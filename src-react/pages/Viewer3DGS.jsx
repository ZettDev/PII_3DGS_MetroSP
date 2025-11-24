import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Viewer3DGS.css';

function Viewer3DGS() {
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(true);
  
  const [alphaRemovalThreshold, setAlphaRemovalThreshold] = useState(1);
  const [cameraUp, setCameraUp] = useState('0, 1, 0');
  const [cameraPosition, setCameraPosition] = useState('0, 10, 15');
  const [cameraLookAt, setCameraLookAt] = useState('0, 0, 0');
  const [antialiased, setAntialiased] = useState(false);
  const [scene2D, setScene2D] = useState(false);
  const [shDegree, setShDegree] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [fileName, setFileName] = useState('Nenhum arquivo selecionado');
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLoad') === 'true') {
      loadFromLocalStorage();
    }
    return () => {
      cleanupViewer();
      restorePageSettings();
    };
  }, []);

  const cleanupViewer = () => {
    if (viewerRef.current) {
      if (viewerRef.current.dispose) viewerRef.current.dispose();
      viewerRef.current = null;
    }
  };

  const restorePageSettings = () => {
    document.body.style.overflow = '';
    document.body.style.backgroundColor = '';
    const root = document.getElementById('root');
    if (root) root.style.display = 'block';
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
        console.error(e);
      }
    }
  };

  const loadAndViewFile = async (arrayBuffer, fileName) => {
    try {
      setLoading(true);
      setStatusMsg('Carregando motor gráfico...');

      // Import dinâmico da lib compilada
      const GaussianSplats3D = await import('gaussian-splats-3d');
      
      const format = GaussianSplats3D.LoaderUtils.sceneFormatFromPath(fileName);
      const parseVec = (str) => str.split(',').map(n => parseFloat(n.trim()));

      const options = {
        cameraUp: parseVec(cameraUp),
        initialCameraPosition: parseVec(cameraPosition),
        initialCameraLookAt: parseVec(cameraLookAt),
        halfPrecisionCovariancesOnGPU: false,
        antialiased: antialiased,
        splatRenderMode: scene2D ? GaussianSplats3D.SplatRenderMode.TwoD : GaussianSplats3D.SplatRenderMode.ThreeD,
        sphericalHarmonicsDegree: shDegree,
        rootElement: containerRef.current, // Renderiza direto no container do React
        useBuiltInControls: true
      };

      cleanupViewer();

      // Prepara ambiente
      const rootElement = document.getElementById('root');
      if (rootElement) rootElement.style.display = 'none';
      
      if(containerRef.current) {
          containerRef.current.style.display = 'block';
          // Limpa o container caso tenha lixo
          while(containerRef.current.firstChild && containerRef.current.firstChild.className !== 'viewer-ui-layer') {
              containerRef.current.removeChild(containerRef.current.firstChild);
          }
      }

      document.body.style.overflow = 'hidden';
      document.body.style.backgroundColor = '#000000';

      const viewer = new GaussianSplats3D.Viewer(options);
      viewerRef.current = viewer;

      let splatBuffer;
      if (format === GaussianSplats3D.SceneFormat.Ply) {
        splatBuffer = await GaussianSplats3D.PlyLoader.loadFromFileData(arrayBuffer, alphaRemovalThreshold, 0, true, shDegree);
      } else if (format === GaussianSplats3D.SceneFormat.Splat) {
        splatBuffer = await GaussianSplats3D.SplatLoader.loadFromFileData(arrayBuffer, alphaRemovalThreshold, 0, true);
      } else {
        splatBuffer = await GaussianSplats3D.KSplatLoader.loadFromFileData(arrayBuffer);
      }

      await viewer.addSplatBuffers([splatBuffer], [{ splatAlphaRemovalThreshold: alphaRemovalThreshold }]);
      viewer.start();
      
      setLoading(false);
      if (window.innerWidth <= 768) setShowControls(false);
      
    } catch (e) {
      console.error(e);
      setStatusMsg('Erro: ' + e.message);
      setTimeout(() => {
          setLoading(false);
          restorePageSettings();
      }, 3000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleView = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    const reader = new FileReader();
    reader.onload = (e) => loadAndViewFile(e.target.result, file.name);
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    cleanupViewer();
    restorePageSettings();
    navigate('/');
  };

  return (
    <div className="viewer-container" ref={containerRef}>
      {/* UI Layer fica SOBRE o canvas que o Viewer injeta */}
      <div className="viewer-ui-layer">
        
        <div className="viewer-top-bar">
          <button className="viewer-back-btn" onClick={handleReset}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Voltar</span>
          </button>
          <ThemeToggle />
        </div>

        <button 
          className="viewer-toggle-sidebar-btn" 
          onClick={() => setShowControls(!showControls)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div className={`viewer-controls-sidebar ${!showControls ? 'collapsed' : ''}`}>
          <div className="viewer-sidebar-header">
            <h3 className="viewer-sidebar-title">Controles 3DGS</h3>
          </div>

          <div className="viewer-sidebar-content">
            <div className="viewer-control-group">
              <span className="viewer-control-label">Arquivo</span>
              <div className="viewer-file-upload-box" onClick={() => fileInputRef.current.click()}>
                {fileName}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}} accept=".ply,.splat,.ksplat" />
            </div>

            <div className="viewer-control-group">
              <span className="viewer-control-label">Modo</span>
              <label className="viewer-checkbox-row">
                <input type="checkbox" checked={antialiased} onChange={e => setAntialiased(e.target.checked)} />
                <span>Anti-aliased</span>
              </label>
              <label className="viewer-checkbox-row">
                <input type="checkbox" checked={scene2D} onChange={e => setScene2D(e.target.checked)} />
                <span>Modo 2D</span>
              </label>
            </div>

            <div className="viewer-control-group">
                <span className="viewer-control-label">Alpha Threshold</span>
                <input type="number" className="viewer-input-field" value={alphaRemovalThreshold} onChange={e => setAlphaRemovalThreshold(parseInt(e.target.value))} />
            </div>

            <div className="viewer-control-group">
                <span className="viewer-control-label">Câmera (Pos / Look / Up)</span>
                <input type="text" className="viewer-input-field" placeholder="0, 10, 15" value={cameraPosition} onChange={e => setCameraPosition(e.target.value)} style={{marginBottom:4}}/>
                <input type="text" className="viewer-input-field" placeholder="0, 0, 0" value={cameraLookAt} onChange={e => setCameraLookAt(e.target.value)} style={{marginBottom:4}}/>
                <input type="text" className="viewer-input-field" placeholder="0, 1, 0" value={cameraUp} onChange={e => setCameraUp(e.target.value)} />
            </div>

            <button className="viewer-btn-primary" onClick={handleView}>
              Carregar Cena
            </button>

            <div className="viewer-shortcuts-section">
                <span className="viewer-control-label" style={{display:'block', marginBottom:'8px'}}>Atalhos</span>
                <div className="viewer-shortcut-item"><span>Mouse Esq</span><span>Orbitar</span></div>
                <div className="viewer-shortcut-item"><span>Mouse Dir</span><span>Pan</span></div>
                <div className="viewer-shortcut-item"><span>Scroll</span><span>Zoom</span></div>
                <div className="viewer-shortcut-item"><span>Click Duplo</span><span>Focar</span></div>
                <div className="viewer-shortcut-item"><span>I</span><span>Info</span></div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="viewer-loading-overlay">
            <div className="viewer-spinner"></div>
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Viewer3DGS;