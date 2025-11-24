import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import ThemeToggle from '../components/ThemeToggle';
import './PLYViewer.css';

function PLYViewer() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const currentObjectRef = useRef(null);
  const frameId = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(1.5, 1.0, 1.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(2, 4, 2);
    directional.castShadow = true;
    scene.add(directional);

    // Grid Helper Management
    let gridHelper = null;

    const updateTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      scene.background = new THREE.Color(isDark ? 0x050508 : 0xf0f2f5);
      
      if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper.geometry.dispose();
        gridHelper.material.dispose();
      }

      const c1 = isDark ? 0x3b82f6 : 0x001489;
      const c2 = isDark ? 0x1f2937 : 0xe5e7eb;

      gridHelper = new THREE.GridHelper(10, 10, c1, c2);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.35;
      scene.add(gridHelper);
    };
    
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x001489 })
    );
    placeholder.position.y = 0.1;
    placeholder.castShadow = true;
    scene.add(placeholder);
    currentObjectRef.current = placeholder;

    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId.current);
      observer.disconnect();
      if (renderer) {
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      }
      if (gridHelper) {
          gridHelper.geometry.dispose();
          gridHelper.material.dispose();
      }
    };
  }, []);

  function fitCameraToObject(object3D, offset = 1.2) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const dist = offset * maxSize * 2;

    const direction = new THREE.Vector3(1, 1, 1).normalize(); // Isometric view dir
    
    controlsRef.current.object.position.copy(center).add(direction.multiplyScalar(dist));
    controlsRef.current.maxDistance = dist * 10;
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }

  const loadFile = (buffer) => {
    try {
        const loader = new PLYLoader();
        const geometry = loader.parse(buffer);
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();
        
        if (currentObjectRef.current) {
            sceneRef.current.remove(currentObjectRef.current);
            if (currentObjectRef.current.geometry) currentObjectRef.current.geometry.dispose();
            if (currentObjectRef.current.material) currentObjectRef.current.material.dispose();
        }

        const material = new THREE.PointsMaterial({ 
        size: 0.02, 
        vertexColors: geometry.hasAttribute('color'),
        color: geometry.hasAttribute('color') ? 0xffffff : 0x001489,
        sizeAttenuation: true
        });

        const mesh = new THREE.Points(geometry, material);
        sceneRef.current.add(mesh);
        currentObjectRef.current = mesh;
        
        fitCameraToObject(mesh);
        setLoaded(true);
    } catch (err) {
        console.error(err);
        alert("Erro ao carregar PLY.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => loadFile(ev.target.result);
      reader.readAsArrayBuffer(file);
    }
  };

  const handleResetView = () => {
      if (currentObjectRef.current) {
          fitCameraToObject(currentObjectRef.current);
      } else {
          controlsRef.current.reset();
      }
  };

  return (
    <div 
      className="ply-container"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => loadFile(ev.target.result);
          reader.readAsArrayBuffer(e.dataTransfer.files[0]);
        }
      }}
    >
      <div ref={containerRef} className="ply-canvas" />
      
      <div className="ply-ui">
        <div className="top-bar">
          <button className="back-btn" onClick={() => navigate('/')}>
            VOLTAR
          </button>
          <ThemeToggle />
        </div>

        <div className={`drop-msg ${!loaded || isDragging ? 'visible' : ''}`}>
          {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo .PLY ou use o botão abaixo'}
        </div>

        <div className="ply-controls-box">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".ply" style={{display:'none'}} />
          <button className="ply-btn" onClick={() => fileInputRef.current.click()}>
            CARREGAR ARQUIVO
          </button>
          {loaded && (
            <button className="ply-btn-ghost" onClick={handleResetView}>
              RECENTRALIZAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PLYViewer;