import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrap">
      <nav className="home-navbar">
        <div className="home-logo-container">
          <img src="/Metro-SP.png" alt="Metro SP" className="home-logo" />
        </div>
        <ThemeToggle />
      </nav>

      <main className="home-main">
        <div className="home-content">
          <h1 className="home-title">Sistema de Monitoramento 3D</h1>
          <p className="home-subtitle">
            Gestão de ativos, visualização de nuvens de pontos e análise comparativa BIM vs Realidade.
          </p>
        </div>

        <div className="home-actions">
          <button className="action-card" onClick={() => navigate('/projetos/novo')}>
            <svg className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="action-label">Novo Projeto</span>
          </button>

          <button className="action-card" onClick={() => navigate('/projetos')}>
            <svg className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="action-label">Listar Projetos</span>
          </button>

          <button className="action-card" onClick={() => navigate('/analises')}>
            <svg className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="action-label">Painel de Análises</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;