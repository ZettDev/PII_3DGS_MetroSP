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
  const [fileName, setFileName] = useState('(No file chosen)');
  const [loading, setLoading] = useState(false);
  const [isViewerActive, setIsViewerActive] = useState(false);
  const fileInputRef = useRef(null);
  const viewerContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const exitButtonRef = useRef(null);

  useEffect(() => {
    // Auto-load from localStorage if available
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLoad') === 'true') {
      loadFromLocalStorage();
    }

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        if (viewerRef.current.dispose) {
          viewerRef.current.dispose();
        }
        if (viewerRef.current.rootElement && viewerRef.current.rootElement.parentNode) {
          viewerRef.current.rootElement.parentNode.removeChild(viewerRef.current.rootElement);
        }
        viewerRef.current = null;
      }
      
      // Restore React content and scroll
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.display = 'block';
      }
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

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
        const arrayBuffer = bytes.buffer;
        localStorage.removeItem('pending3DGSFile');
        localStorage.removeItem('pending3DGSFileName');
        
        await loadAndViewFile(arrayBuffer, pendingFileName);
      } catch (e) {
        console.error(e);
        setViewError('Could not load file. It may be too large for auto-loading.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const loadAndViewFile = async (arrayBuffer, fileName) => {
    try {
      setLoading(true);
      setViewError('');
      setViewStatus('Loading scene...');

      // Dynamic import to load modules
      const GaussianSplats3D = await import('gaussian-splats-3d');
      const THREE = await import('three');

      const format = GaussianSplats3D.LoaderUtils.sceneFormatFromPath(fileName);
      const cameraUpArray = cameraUp.split(',').map(v => parseFloat(v.trim()));
      const cameraPositionArray = cameraPosition.split(',').map(v => parseFloat(v.trim()));
      const cameraLookAtArray = cameraLookAt.split(',').map(v => parseFloat(v.trim()));

      const viewerOptions = {
        cameraUp: cameraUpArray,
        initialCameraPosition: cameraPositionArray,
        initialCameraLookAt: cameraLookAtArray,
        halfPrecisionCovariancesOnGPU: false,
        antialiased: antialiased || false,
        splatRenderMode: scene2D ? GaussianSplats3D.SplatRenderMode.TwoD : GaussianSplats3D.SplatRenderMode.ThreeD,
        sphericalHarmonicsDegree: sphericalHarmonicsDegree
      };

      const splatBufferOptions = {
        splatAlphaRemovalThreshold: alphaRemovalThreshold
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

      // Hide React content and setup viewer
      if (viewerContainerRef.current) {
        viewerContainerRef.current.style.display = 'none';
      }
      
      // Hide root element to prevent black screen overlay, but keep exit button visible
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.display = 'none';
      }
      
      // Move exit button to body so it stays visible
      const exitButton = exitButtonRef.current || document.querySelector('.viewer-exit-button');
      if (exitButton && exitButton.parentNode !== document.body) {
        // Store original parent to restore later
        exitButton.dataset.originalParent = exitButton.parentNode?.className || '';
        document.body.appendChild(exitButton);
        // Reattach click handler to ensure it works after moving to body
        exitButton.onclick = handleReset;
      }
      
      // Disable scroll
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.backgroundColor = '#000000';
      document.documentElement.style.overflow = 'hidden';

      // Clean up any existing viewer
      if (viewerRef.current) {
        if (viewerRef.current.dispose) {
          viewerRef.current.dispose();
        }
        if (viewerRef.current.rootElement && viewerRef.current.rootElement.parentNode) {
          viewerRef.current.rootElement.parentNode.removeChild(viewerRef.current.rootElement);
        }
      }

      const viewer = new GaussianSplats3D.Viewer(viewerOptions);
      viewerRef.current = viewer;
      
      await viewer.addSplatBuffers([splatBuffer], [splatBufferOptions]);
      viewer.start();
      
      setIsViewerActive(true);
      setViewStatus('');
      setLoading(false);
    } catch (e) {
      console.error(e);
      setViewError('Could not view scene.');
      setLoading(false);
    }
  };

  const handleView = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setViewError('Please choose a file to view.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      loadAndViewFile(e.target.result, file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    if (viewerRef.current) {
      if (viewerRef.current.dispose) {
        viewerRef.current.dispose();
      }
      if (viewerRef.current.rootElement && viewerRef.current.rootElement.parentNode) {
        viewerRef.current.rootElement.parentNode.removeChild(viewerRef.current.rootElement);
      }
      viewerRef.current = null;
    }
    
    // Restore React content
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.display = 'block';
    }
    
    // Move exit button back to its original position
    const exitButton = exitButtonRef.current || document.querySelector('.viewer-exit-button');
    const viewerWrap = viewerContainerRef.current;
    if (exitButton && viewerWrap && exitButton.parentNode === document.body) {
      viewerWrap.insertBefore(exitButton, viewerWrap.firstChild);
      // Remove the native onclick handler since React will handle it
      exitButton.onclick = null;
    }
    
    // Restore scroll
    document.body.style.overflow = '';
    document.body.style.margin = '';
    document.body.style.padding = '';
    document.body.style.backgroundColor = '';
    document.documentElement.style.overflow = '';
    
    if (viewerContainerRef.current) {
      viewerContainerRef.current.style.display = 'block';
    }
    
    setIsViewerActive(false);
    setViewStatus('');
    setViewError('');
    setFileName('(No file chosen)');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    navigate('/');
  };

  return (
    <div className="viewer-wrap" ref={viewerContainerRef}>
      <button
        ref={exitButtonRef}
        className="viewer-exit-button"
        onClick={handleReset}
        title="Exit viewer"
      >
        ← Exit
      </button>
      <div className="viewer-header">
        <h1 className="viewer-title">Web3DGS</h1>
        <ThemeToggle />
      </div>

      <div className="viewer-content">
        <div className="viewer-panel">
          <div className="viewer-small-title">
            View a <span className="viewer-file-ext">.ply</span>, <span className="viewer-file-ext">.ksplat</span>, or <span className="viewer-file-ext-small">.splat</span> file
          </div>
          <table style={{ textAlign: 'left', width: '100%' }}>
            <tbody>
              <tr>
                <td colSpan="2">
                  <label htmlFor="viewFile">
                    <span className="viewer-button viewer-button-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                      Choose file
                    </span>
                    <input
                      type="file"
                      id="viewFile"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      accept=".ply,.ksplat,.splat"
                    />
                  </label>
                  <span style={{ paddingLeft: '15px', color: 'var(--gray)' }}>{fileName}</span>
                </td>
              </tr>
              <tr><td colSpan="2" style={{ height: '12px' }}></td></tr>
              <tr>
                <td>Minimum alpha:&nbsp;</td>
                <td>
                  <input
                    type="text"
                    className="viewer-text-input"
                    style={{ width: '60px' }}
                    value={alphaRemovalThreshold}
                    onChange={(e) => setAlphaRemovalThreshold(parseInt(e.target.value) || 1)}
                  />
                  <span className="viewer-valid-label">(1 - 255)</span>
                </td>
              </tr>
              <tr>
                <td>Anti-aliased</td>
                <td style={{ textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    className="viewer-checkbox"
                    checked={antialiased}
                    onChange={(e) => setAntialiased(e.target.checked)}
                  />
                </td>
              </tr>
              <tr>
                <td>2D scene</td>
                <td style={{ textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    className="viewer-checkbox"
                    checked={scene2D}
                    onChange={(e) => setScene2D(e.target.checked)}
                  />
                </td>
              </tr>
              <tr>
                <td>Camera up:&nbsp;</td>
                <td>
                  <input
                    type="text"
                    className="viewer-text-input"
                    style={{ width: '120px' }}
                    value={cameraUp}
                    onChange={(e) => setCameraUp(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Camera position:&nbsp;</td>
                <td>
                  <input
                    type="text"
                    className="viewer-text-input"
                    style={{ width: '120px' }}
                    value={cameraPosition}
                    onChange={(e) => setCameraPosition(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>Camera look-at:&nbsp;</td>
                <td>
                  <input
                    type="text"
                    className="viewer-text-input"
                    style={{ width: '120px' }}
                    value={cameraLookAt}
                    onChange={(e) => setCameraLookAt(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>SH level:</td>
                <td>
                  <input
                    type="text"
                    className="viewer-text-input"
                    style={{ width: '60px' }}
                    value={sphericalHarmonicsDegree}
                    onChange={(e) => setSphericalHarmonicsDegree(parseInt(e.target.value) || 0)}
                  />
                  <span className="viewer-valid-label">(0, 1, or 2)</span>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <span className="viewer-button" onClick={handleView} style={{ flex: 1, textAlign: 'center' }}>
              View
            </span>
            <span className="viewer-button viewer-button-secondary" onClick={handleReset} style={{ flex: 1, textAlign: 'center' }}>
              Reset
            </span>
          </div>
          <br />
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginTop: '16px' }}>
            <div style={{ width: '50px' }}>
              {loading && <div className="viewer-loading-icon"></div>}
            </div>
            <div style={{ textAlign: 'left', color: 'var(--text)', marginTop: '7px', marginLeft: '15px', flex: 1 }}>
              {viewStatus}
            </div>
          </div>
          {viewError && <span style={{ color: '#ff4444', fontSize: '13px' }}>{viewError}</span>}
        </div>

        <div className="viewer-panel">
          <div className="viewer-small-title">Mouse input</div>
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray)' }}>
              <li style={{ marginBottom: '8px' }}>Left click to set the focal point</li>
              <li style={{ marginBottom: '8px' }}>Left click and drag to orbit</li>
              <li style={{ marginBottom: '8px' }}>Right click and drag to pan</li>
              <li>Scroll to zoom in/out</li>
            </ul>
          </div>
          <div className="viewer-small-title">Keyboard input</div>
          <div style={{ height: '12px' }}></div>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '50px' }}><div className="viewer-control-key">I</div></td>
                <td className="viewer-control-desc">Display debug info panel</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">C</div></td>
                <td className="viewer-control-desc">Toggle mesh cursor</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">U</div></td>
                <td className="viewer-control-desc">Toggle controls orientation marker</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key" style={{ fontSize: '14pt', fontWeight: 'bold' }}>←</div></td>
                <td className="viewer-control-desc">Rotate camera-up counter-clockwise</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key" style={{ fontSize: '14pt', fontWeight: 'bold' }}>→</div></td>
                <td className="viewer-control-desc">Rotate camera-up clockwise</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">P</div></td>
                <td className="viewer-control-desc">Toggle point-cloud mode</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">O</div></td>
                <td className="viewer-control-desc">Toggle orthographic mode</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">=</div></td>
                <td className="viewer-control-desc">Increase splat scale</td>
              </tr>
              <tr><td colSpan="2" style={{ height: '8px' }}></td></tr>
              <tr>
                <td><div className="viewer-control-key">-</div></td>
                <td className="viewer-control-desc">Decrease splat scale</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Viewer3DGS;

