import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import ThemeToggle from '../components/ThemeToggle';
import './PLYViewer.css';

function PLYViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const currentObjectRef = useRef(null);
    const placeholderRef = useRef(null);
    const dropzoneRef = useRef(null);
    const fileInputRef = useRef(null);
    const handleFilesRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get theme colors
    const getThemeColor = (lightColor, darkColor) => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return isDark ? darkColor : lightColor;
    };

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.sortObjects = true; // Enable depth sorting for better rendering order
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    const updateSceneBackground = () => {
      scene.background = new THREE.Color(getThemeColor(0xf9f9fb, 0x0f1115));
    };
    updateSceneBackground();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.01, 1000);
    camera.position.set(1.5, 1.0, 1.5);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 0.8);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 4, 2);
    dir.castShadow = true;
    scene.add(dir);

    // Helpers
    const grid = new THREE.GridHelper(10, 10, getThemeColor(0x3b82f6, 0x4b5563), getThemeColor(0xe5e7eb, 0x1f2937));
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    scene.add(grid);

    const axes = new THREE.AxesHelper(0.25);
    axes.material.opacity = 0.65;
    axes.material.transparent = true;
    scene.add(axes);

    // Placeholder object
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x001489 })
    );
    placeholder.position.y = 0.1;
    placeholder.castShadow = true;
    scene.add(placeholder);
    placeholderRef.current = placeholder;

    function clearCurrentObject() {
      if (currentObjectRef.current) {
        scene.remove(currentObjectRef.current);
        currentObjectRef.current.traverse?.((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        });
        currentObjectRef.current = null;
      }
    }

    function fitCameraToObject(object3D, offset = 1.2) {
      const box = new THREE.Box3().setFromObject(object3D);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance = maxSize / (2 * Math.tan((Math.PI * camera.fov) / 360));
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

      const direction = controls.target.clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(-1);

      camera.position.copy(direction.multiplyScalar(distance).add(center));
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();

      controls.maxDistance = distance * 10;
      controls.target.copy(center);
      controls.update();
    }

    function createPointsFromPLYGeometry(geometry) {
      geometry.center();
      geometry.computeBoundingBox();
      const hasColors = geometry.getAttribute('color') !== undefined;

      const sizeVec = new THREE.Vector3();
      geometry.boundingBox?.getSize(sizeVec);
      const maxSize = Math.max(sizeVec.x || 1, sizeVec.y || 1, sizeVec.z || 1);
      const pointSize = Math.min(0.02 * maxSize, Math.max(0.002 * maxSize, 0.003 * maxSize));

      const material = new THREE.PointsMaterial({
        size: pointSize,
        sizeAttenuation: true,
        vertexColors: hasColors,
        color: hasColors ? 0xffffff : 0xd1d5db,
        depthWrite: true,
        depthTest: true,
        transparent: false,
        opacity: 1.0,
        alphaTest: 0.1 // Helps with depth sorting for overlapping points
      });
      const points = new THREE.Points(geometry, material);
      return points;
    }

    async function loadPLYFromArrayBuffer(arrayBuffer) {
      const loader = new PLYLoader();
      const geometry = loader.parse(arrayBuffer);
      const points = createPointsFromPLYGeometry(geometry);
      clearCurrentObject();
      
      // Remove placeholder when loading a file
      if (placeholderRef.current) {
        scene.remove(placeholderRef.current);
        if (placeholderRef.current.geometry) placeholderRef.current.geometry.dispose();
        if (placeholderRef.current.material) placeholderRef.current.material.dispose();
        placeholderRef.current = null;
      }
      
      scene.add(points);
      currentObjectRef.current = points;
      fitCameraToObject(points);
    }

    async function loadPLYFromURL(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar arquivo');
        const arrayBuffer = await response.arrayBuffer();
        loadPLYFromArrayBuffer(arrayBuffer);
      } catch (error) {
        console.error('Erro ao carregar PLY da URL:', error);
        alert('Erro ao carregar arquivo: ' + error.message);
      }
    }

    // Store function reference for use in separate effect
    window.loadPLYFromURL = loadPLYFromURL;

    const handleFiles = (files) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.ply')) {
        alert('Please select a .ply file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        loadPLYFromArrayBuffer(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    };
    
    handleFilesRef.current = handleFiles;

    // Theme change observer
    const themeObserver = new MutationObserver(() => {
      updateSceneBackground();
      grid.material.color.setHex(getThemeColor(0x3b82f6, 0x4b5563));
      grid.material.color2.setHex(getThemeColor(0xe5e7eb, 0x1f2937));
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Resize
    function onWindowResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
      clearCurrentObject();
      if (placeholderRef.current) {
        scene.remove(placeholderRef.current);
        if (placeholderRef.current.geometry) placeholderRef.current.geometry.dispose();
        if (placeholderRef.current.material) placeholderRef.current.material.dispose();
        placeholderRef.current = null;
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Load from URL if provided (separate effect to avoid re-initializing Three.js)
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && window.loadPLYFromURL) {
      window.loadPLYFromURL(urlParam);
    }
  }, [searchParams]);

  const handleFileChange = (e) => {
    if (e.target.files && handleFilesRef.current) {
      handleFilesRef.current(e.target.files);
    }
  };

  const handleResetView = () => {
    if (currentObjectRef.current && controlsRef.current && cameraRef.current) {
      const box = new THREE.Box3().setFromObject(currentObjectRef.current);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance = maxSize / (2 * Math.tan((Math.PI * cameraRef.current.fov) / 360));
      const fitWidthDistance = fitHeightDistance / cameraRef.current.aspect;
      const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);
      const direction = controlsRef.current.target.clone()
        .sub(cameraRef.current.position)
        .normalize()
        .multiplyScalar(-1);
      cameraRef.current.position.copy(direction.multiplyScalar(distance).add(center));
      cameraRef.current.near = distance / 100;
      cameraRef.current.far = distance * 100;
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.maxDistance = distance * 10;
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    } else {
      const controls = controlsRef.current;
      const camera = cameraRef.current;
      if (controls && camera) {
        controls.target.set(0, 0, 0);
        camera.position.set(1.5, 1.0, 1.5);
        camera.near = 0.01;
        camera.far = 1000;
        camera.updateProjectionMatrix();
        controls.update();
      }
    }
  };


  return (
    <div className="ply-viewer-page">
      <button
        className="ply-exit-button"
        onClick={() => navigate('/')}
        title="Exit viewer"
      >
        ← Exit
      </button>
      
      <div className="ply-viewer-header">
        <h1 className="ply-viewer-title">PLY Viewer</h1>
        <ThemeToggle />
      </div>

      <div className="ply-viewer-container">
        <div className="ply-toolbar">
          <label htmlFor="plyFileInput" className="ply-button ply-button-primary">
            Choose File
          </label>
          <input
            id="plyFileInput"
            ref={fileInputRef}
            type="file"
            accept=".ply"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="ply-button ply-button-secondary" onClick={handleResetView}>
            Reset View
          </button>
          <span className="ply-hint">Drop a .ply file anywhere</span>
        </div>
        <div ref={containerRef} className="ply-app"></div>
        <div
          ref={dropzoneRef}
          className="ply-dropzone"
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropzoneRef.current) dropzoneRef.current.classList.add('active');
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropzoneRef.current) dropzoneRef.current.classList.add('active');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropzoneRef.current) dropzoneRef.current.classList.remove('active');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropzoneRef.current) dropzoneRef.current.classList.remove('active');
            const dt = e.dataTransfer;
            if (dt?.files?.length && handleFilesRef.current) {
              handleFilesRef.current(dt.files);
            }
          }}
        >
          <div className="ply-dropzone-badge">Drop .ply to load</div>
        </div>
      </div>
    </div>
  );
}

export default PLYViewer;
