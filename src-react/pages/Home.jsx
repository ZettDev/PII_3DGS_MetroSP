import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrap">
      <div className="home-header">
        <ThemeToggle />
      </div>

      <div className="home-main-content">
        <div className="home-description">
          <h2>Metro SP - Sistema de Monitoramento</h2>
          <p>
            Sistema de monitoramento de canteiros de obras do Metrô de São Paulo. 
            Gerencie projetos, registros fotográficos e análises de comparação BIM vs realidade.
          </p>
        </div>

        <div className="home-button-grid">
          <button className="home-btn" onClick={() => navigate('/projetos/novo')}>
            ➕ Criar Novo Projeto
          </button>
          <button className="home-btn home-btn-secondary" onClick={() => navigate('/projetos')}>
            📋 Ver Projetos
          </button>
          <button className="home-btn home-btn-secondary" onClick={() => navigate('/analises')}>
            📊 Ver Análises
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

