import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnalysisCard from '../components/AnalysisCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ThemeToggle from '../components/ThemeToggle';
import './AnalysesList.css';

function AnalysesList() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAnalyses();
      setAnalyses(data?.jobs || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (filter === 'all') return true;
    return analysis.status === filter;
  });

  const tabs = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'processing', label: 'Processando' },
    { id: 'completed', label: 'Concluídas' },
    { id: 'failed', label: 'Falhas' }
  ];

  return (
    <div className="analyses-wrap">
      <div className="analyses-header">
        <button className="btn-back-link" onClick={() => navigate('/')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="analyses-container">
        <div className="analyses-controls">
          <h1 className="page-title">Monitoramento de Análises</h1>
          <div className="filter-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${filter === tab.id ? 'active' : ''}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="btn-submit" style={{width: 'auto', padding: '8px 16px'}} onClick={loadAnalyses}>
            Atualizar
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {loading ? (
          <LoadingSpinner message="Buscando dados..." />
        ) : filteredAnalyses.length === 0 ? (
          <div className="empty-placeholder">
            <p>Nenhuma análise encontrada com o filtro "{tabs.find(t => t.id === filter)?.label}".</p>
          </div>
        ) : (
          <div className="analyses-grid">
            {filteredAnalyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysesList;