import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import ThemeToggle from '../components/ThemeToggle';
import './OBJViewer.css';

function OBJViewer() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const currentObjectRef = useRef(null);
  const frameId = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(2, 2, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    const updateTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      scene.background = new THREE.Color(isDark ? 0x050508 : 0xf0f2f5);
      gridHelper.material.color.setHex(isDark ? 0x444444 : 0xcccccc);
    };
    updateTheme();
    
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

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
    };
  }, []);

  const loadFile = (buffer) => {
    try {
        const loader = new OBJLoader();
        const object = loader.parse(new TextDecoder().decode(buffer));
        
        if (currentObjectRef.current) sceneRef.current.remove(currentObjectRef.current);
        
        // Centralizar
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        // Escalar
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if(maxDim > 0) object.scale.setScalar(2 / maxDim);
        
        object.position.y += 1; // Lift up

        sceneRef.current.add(object);
        currentObjectRef.current = object;
        setLoaded(true);
    } catch (e) {
        alert('Erro ao carregar OBJ');
    }
  };

  return (
    <div 
      className="viewer-container"
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
      <div ref={containerRef} style={{position:'absolute', top:0, left:0, zIndex:1}} />
      
      <div className="viewer-ui-layer">
        <div className="viewer-top-bar">
          <button className="viewer-back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>
          <ThemeToggle />
        </div>

        <div className="viewer-controls-sidebar" style={{height: 'auto', minHeight:'150px', justifyContent:'center'}}>
            <div className="viewer-sidebar-content">
                <div className={`viewer-file-upload-box ${isDragging ? 'active' : ''}`} onClick={() => fileInputRef.current.click()}>
                    {isDragging ? 'Solte o arquivo' : loaded ? 'Modelo Carregado (Clique para trocar)' : 'Clique ou Arraste .OBJ'}
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                    if(e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => loadFile(ev.target.result);
                        reader.readAsArrayBuffer(e.target.files[0]);
                    }
                }} style={{display:'none'}} accept=".obj"/>
            </div>
        </div>
      </div>
    </div>
  );
}

export default OBJViewer;