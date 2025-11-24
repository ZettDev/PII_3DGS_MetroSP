import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Viewer3DGS.css';

function Viewer3DGS() {
  const navigate = useNavigate();
  const [alphaRemovalThreshold, setAlphaRemovalThreshold] = useState(1);
  const [cameraUp, setCameraUp] = useState('0, 1, 0');
  const [cameraPosition, setCameraPosition] = useState('0, 1, 0');
  const [cameraLookAt, setCameraLookAt] = useState('1, 0, 0');
  const [antialiased, setAntialiased] = useState(false);
  const [scene2D, setScene2D] = useState(false);
  const [sphericalHarmonicsDegree, setSphericalHarmonicsDegree] = useState(0);
  const [viewStatus, setViewStatus] = useState('');
  const [viewError, setViewError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const exitButtonRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLoad') === 'true') {
      loadFromLocalStorage();
    }
    return () => cleanupViewer();
  }, []);

  const cleanupViewer = () => {
    if (viewerRef.current) {
      if (viewerRef.current.dispose) viewerRef.current.dispose();
      if (viewerRef.current.rootElement && viewerRef.current.rootElement.parentNode) {
        viewerRef.current.rootElement.parentNode.removeChild(viewerRef.current.rootElement);
      }
      viewerRef.current = null;
    }
    const root = document.getElementById('root');
    if (root) root.style.display = 'flex';
    document.body.style.overflow = '';
  };

  const loadFromLocalStorage = async () => {
    const pendingFileBase64 = localStorage.getItem('pending3DGSFile');
    const pendingFileName = localStorage.getItem('pending3DGSFileName');
    if (pendingFileBase64 && pendingFileName) {
      try {
        const binaryString = atob(pendingFileBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        localStorage.removeItem('pending3DGSFile');
        localStorage.removeItem('pending3DGSFileName');
        await loadAndViewFile(bytes.buffer, pendingFileName);
      } catch (e) {
        setViewError('Erro ao carregar arquivo local.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const loadAndViewFile = async (arrayBuffer, fileName) => {
    try {
      setLoading(true);
      setViewError('');
      setViewStatus('Processando cena...');

      const GaussianSplats3D = await import('gaussian-splats-3d');
      const format = GaussianSplats3D.LoaderUtils.sceneFormatFromPath(fileName);
      
      const viewerOptions = {
        cameraUp: cameraUp.split(',').map(v => parseFloat(v)),
        initialCameraPosition: cameraPosition.split(',').map(v => parseFloat(v)),
        initialCameraLookAt: cameraLookAt.split(',').map(v => parseFloat(v)),
        halfPrecisionCovariancesOnGPU: false,
        antialiased,
        splatRenderMode: scene2D ? GaussianSplats3D.SplatRenderMode.TwoD : GaussianSplats3D.SplatRenderMode.ThreeD,
        sphericalHarmonicsDegree
      };

      let splatBuffer;
      if (format === GaussianSplats3D.SceneFormat.Ply) {
        splatBuffer = await GaussianSplats3D.PlyLoader.loadFromFileData(
          arrayBuffer, alphaRemovalThreshold, 0, true, sphericalHarmonicsDegree
        );
      } else if (format === GaussianSplats3D.SceneFormat.Splat) {
        splatBuffer = await GaussianSplats3D.SplatLoader.loadFromFileData(
          arrayBuffer, alphaRemovalThreshold, 0, true
        );
      } else {
        splatBuffer = await GaussianSplats3D.KSplatLoader.loadFromFileData(arrayBuffer);
      }

      // Preparar UI para modo fullscreen
      if (viewerContainerRef.current) viewerContainerRef.current.style.display = 'none';
      const root = document.getElementById('root');
      if (root) root.style.display = 'none';
      
      // Mover botão de saída para body
      if (exitButtonRef.current) {
        document.body.appendChild(exitButtonRef.current);
        exitButtonRef.current.style.display = 'flex';
        exitButtonRef.current.onclick = handleReset;
      }
      
      document.body.style.overflow = 'hidden';

      const viewer = new GaussianSplats3D.Viewer(viewerOptions);
      viewerRef.current = viewer;
      await viewer.addSplatBuffers([splatBuffer], [{ splatAlphaRemovalThreshold: alphaRemovalThreshold }]);
      viewer.start();
      
      setLoading(false);
      setViewStatus('');
    } catch (e) {
      console.error(e);
      setViewError('Erro na renderização.');
      setLoading(false);
    }
  };

  const handleView = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return setViewError('Selecione um arquivo.');
    const reader = new FileReader();
    reader.onload = (e) => loadAndViewFile(e.target.result, file.name);
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    cleanupViewer();
    if (viewerContainerRef.current) viewerContainerRef.current.style.display = 'block';
    
    // Restaurar botão de saída
    const wrapper = document.querySelector('.viewer-overlay-header');
    if (exitButtonRef.current && wrapper) {
        wrapper.insertBefore(exitButtonRef.current, wrapper.firstChild);
        exitButtonRef.current.onclick = null; // React retoma o controle
    }

    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    navigate('/');
  };

  return (
    <div className="viewer-container" ref={viewerContainerRef}>
      <header className="viewer-overlay-header">
        <button ref={exitButtonRef} className="btn-exit" onClick={handleReset}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Sair do Visualizador
        </button>
        <div className="viewer-brand">
            <img src="/Metro-SP.png" alt="" style={{height: '24px'}} />
            <span>Web3DGS</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="viewer-controls-panel">
        <div className="viewer-panel-title">Parâmetros de Carga</div>
        
        <label className="file-label">
          {fileName || 'Selecionar Arquivo (.ply, .ksplat)'}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".ply,.ksplat,.splat" 
            style={{display: 'none'}} 
          />
        </label>

        <div className="control-row">
          <span>Alpha Threshold</span>
          <input 
            type="number" 
            className="control-input" 
            value={alphaRemovalThreshold}
            onChange={(e) => setAlphaRemovalThreshold(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="control-row">
          <span>Anti-aliasing</span>
          <input 
            type="checkbox" 
            checked={antialiased}
            onChange={(e) => setAntialiased(e.target.checked)}
          />
        </div>

        <button className="btn-viewer" onClick={handleView} disabled={loading}>
            {loading ? 'Carregando...' : 'Renderizar'}
        </button>

        {viewStatus && <div style={{marginTop: 10, color: '#60a5fa'}}>{viewStatus}</div>}
        {viewError && <div style={{marginTop: 10, color: '#f87171'}}>{viewError}</div>}

        <div className="viewer-panel-title" style={{marginTop: 24}}>Atalhos</div>
        <table className="keys-table">
          <tbody>
            <tr><td><span className="key-badge">I</span></td><td>Debug Panel</td></tr>
            <tr><td><span className="key-badge">P</span></td><td>Point Cloud</td></tr>
            <tr><td><span className="key-badge">O</span></td><td>Ortográfico</td></tr>
            <tr><td><span className="key-badge">Mouse</span></td><td>Orbit/Pan/Zoom</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Viewer3DGS;