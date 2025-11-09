import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [showSavedFiles, setShowSavedFiles] = useState(false);

  return (
    <div className="home-wrap">
      <div className="home-header">
        <ThemeToggle />
      </div>

      <div className="home-main-content">
        <div className="home-description">
          <h2>Web3DGS</h2>
          <p>
            Web-based 3D Gaussian Splatting viewer and visualization tool. Upload and explore 3D models in .ply, .ksplat, or .splat formats directly in your browser with high-performance rendering.
          </p>
        </div>

        <div className="home-button-grid">
          <button className="home-btn" onClick={() => {}}>
            Create 3DGS
          </button>
          <button className="home-btn home-btn-secondary" onClick={() => setShowSavedFiles(!showSavedFiles)}>
            View Saved Files
          </button>
        </div>

        {showSavedFiles && (
          <div className="home-saved-files-section">
            <button className="home-btn home-btn-back" onClick={() => setShowSavedFiles(false)}>
              ← Back
            </button>
            <div className="home-saved-files-grid">
              <button className="home-btn home-btn-file-type" onClick={() => navigate('/threedgs')}>
                3DGS
              </button>
              <button className="home-btn home-btn-file-type" onClick={() => navigate('/obj-viewer')}>
                .OBJ
              </button>
              <button className="home-btn home-btn-file-type" onClick={() => navigate('/ply-viewer')}>
                .PLY
              </button>
            </div>
          </div>
        )}

        <div className="home-controls-section">
          <h3>3DGS Viewer Controls</h3>
          <div className="home-controls-grid">
            <div className="home-control-group">
              <h4>Mouse Input</h4>
              <div className="home-control-item">
                <div className="home-control-key">LMB</div>
                <div className="home-control-desc">Set focal point</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">LMB + Drag</div>
                <div className="home-control-desc">Orbit camera</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">RMB + Drag</div>
                <div className="home-control-desc">Pan camera</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">Scroll</div>
                <div className="home-control-desc">Zoom in/out</div>
              </div>
            </div>
            <div className="home-control-group">
              <h4>Keyboard Shortcuts</h4>
              <div className="home-control-item">
                <div className="home-control-key">I</div>
                <div className="home-control-desc">Display debug info panel</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">C</div>
                <div className="home-control-desc">Toggle mesh cursor</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">U</div>
                <div className="home-control-desc">Toggle controls orientation marker</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">← / →</div>
                <div className="home-control-desc">Rotate camera-up</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">P</div>
                <div className="home-control-desc">Toggle point-cloud mode</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">O</div>
                <div className="home-control-desc">Toggle orthographic mode</div>
              </div>
              <div className="home-control-item">
                <div className="home-control-key">= / -</div>
                <div className="home-control-desc">Adjust splat scale</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

