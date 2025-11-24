import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [showFiles, setShowFiles] = useState(false);

  return (
    <div className="home-container">
      <nav className="home-nav">
        <ThemeToggle />
      </nav>

      <div className="home-hero">
        <div className="hero-glow"></div>
        <h1 className="hero-title">Web3DGS</h1>
        <p className="hero-subtitle">
          Plataforma de visualização avançada para Gaussian Splatting e fotogrametria 3D.
          Renderização de alta performance diretamente no seu navegador.
        </p>

        <div className="action-grid">
          <div className="primary-card" onClick={() => navigate('/threedgs')}>
            <span className="card-title">Iniciar Visualizador 3DGS</span>
            <span className="card-desc">Carregue arquivos .splat, .ksplat ou .ply e visualize cenas com iluminação realista em tempo real.</span>
          </div>

          <div className="secondary-card" onClick={() => navigate('/obj-viewer')}>
            <h3>Visualizador OBJ</h3>
            <p>Para modelos 3D tradicionais com malhas texturizadas.</p>
            <div style={{marginTop: 'auto'}}>
              <span className="format-tag">.OBJ</span>
              <span className="format-tag" style={{marginLeft: '8px'}}>.MTL</span>
            </div>
          </div>

          <div className="secondary-card" onClick={() => navigate('/ply-viewer')}>
            <h3>Visualizador PLY</h3>
            <p>Visualização de nuvem de pontos densa e dados brutos.</p>
            <div style={{marginTop: 'auto'}}>
              <span className="format-tag">.PLY</span>
            </div>
          </div>
        </div>

        <div style={{marginTop: '32px'}}>
            <button className="home-btn-outline" onClick={() => setShowFiles(true)}>
                Ver Arquivos Salvos
            </button>
        </div>
      </div>

      {showFiles && (
        <div className="saved-files-overlay" onClick={(e) => e.target === e.currentTarget && setShowFiles(false)}>
          <div className="saved-modal">
            <div className="modal-header">
              <h2>Arquivos Salvos</h2>
              <button className="close-btn" onClick={() => setShowFiles(false)}>&times;</button>
            </div>
            <div className="file-list">
              <div className="file-item" onClick={() => navigate('/threedgs')}>
                <span>Demo Scene 3DGS</span>
                <span className="format-tag">SPLAT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;