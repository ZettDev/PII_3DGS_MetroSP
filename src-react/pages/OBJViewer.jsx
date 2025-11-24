import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import ThemeToggle from '../components/ThemeToggle';
import './OBJViewer.css';

function OBJViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const currentObjectRef = useRef(null);

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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
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

    function clearCurrentObject() {
      if (currentObjectRef.current) {
        scene.remove(currentObjectRef.current);
        currentObjectRef.current.traverse?.((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
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

    async function loadOBJFromArrayBuffer(arrayBuffer, fileName, mtlArrayBuffer = null) {
      const loader = new OBJLoader();
      let materials = null;

      // Load MTL if provided
      if (mtlArrayBuffer) {
        try {
          const mtlLoader = new MTLLoader();
          const mtlText = new TextDecoder().decode(mtlArrayBuffer);
          materials = mtlLoader.parse(mtlText);
          materials.preload();
          loader.setMaterials(materials);
        } catch (e) {
          console.log('Erro ao carregar MTL:', e);
        }
      }

      const object = loader.parse(new TextDecoder().decode(arrayBuffer));
      
      // Apply default material if no materials loaded
      object.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || child.material.length === 0) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x808080,
              flatShading: false
            });
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      clearCurrentObject();
      scene.add(object);
      currentObjectRef.current = object;
      fitCameraToObject(object);
    }

    async function loadOBJFromURL(url, mtlUrl = null) {
      try {
        // Load OBJ file
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar arquivo');
        const arrayBuffer = await response.arrayBuffer();
        const fileName = url.split('/').pop() || 'modelo.obj';
        
        // Try to load MTL file
        let mtlArrayBuffer = null;
        if (mtlUrl) {
          // Use provided MTL URL
          try {
            const mtlResponse = await fetch(mtlUrl);
            if (mtlResponse.ok) {
              mtlArrayBuffer = await mtlResponse.arrayBuffer();
              console.log('Arquivo MTL carregado com sucesso');
            } else {
              console.log('Arquivo MTL não encontrado na URL fornecida');
            }
          } catch (e) {
            console.log('Erro ao carregar MTL da URL fornecida:', e);
          }
        } else if (fileName.toLowerCase().endsWith('.obj')) {
          // Fallback: try to load MTL by replacing .obj with .mtl in URL
          try {
            const fallbackMtlUrl = url.replace(/\.obj$/i, '.mtl');
            const mtlResponse = await fetch(fallbackMtlUrl);
            if (mtlResponse.ok) {
              mtlArrayBuffer = await mtlResponse.arrayBuffer();
              console.log('Arquivo MTL carregado via fallback');
            }
          } catch (e) {
            // MTL file not found, continue without it
            console.log('Arquivo MTL não encontrado, continuando sem materiais');
          }
        }
        
        loadOBJFromArrayBuffer(arrayBuffer, fileName, mtlArrayBuffer);
      } catch (error) {
        console.error('Erro ao carregar OBJ da URL:', error);
        alert('Erro ao carregar arquivo: ' + error.message);
      }
    }

    // Store function reference for use in separate effect
    window.loadOBJFromURL = loadOBJFromURL;

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
    const mtlUrlParam = searchParams.get('mtlUrl');
    if (urlParam && window.loadOBJFromURL) {
      window.loadOBJFromURL(urlParam, mtlUrlParam || null);
    }
  }, [searchParams]);

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
    <div className="obj-viewer-page">
      <button
        className="obj-exit-button"
        onClick={() => navigate('/')}
        title="Sair do visualizador"
      >
        ← Sair
      </button>
      
      <div className="obj-viewer-header">
        <h1 className="obj-viewer-title">Visualizar arquivo BIM</h1>
        <div className="obj-viewer-header-right">
          <button className="obj-button obj-button-secondary" onClick={handleResetView}>
            Redefinir Visualização
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="obj-viewer-container">
        <div ref={containerRef} className="obj-app"></div>
      </div>
    </div>
  );
}

export default OBJViewer;

