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

  return (
    <div className="analyses-list-wrap">
      <div className="analyses-list-header">
        <button className="analyses-list-back-btn" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="analyses-list-content">
        <div className="analyses-list-title-section">
          <h1 className="analyses-list-title">Análises</h1>
          <button className="analyses-list-refresh-btn" onClick={loadAnalyses} disabled={loading}>
            🔄 Atualizar
          </button>
        </div>

        <div className="analyses-list-filters">
          <button
            className={`analyses-list-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`analyses-list-filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </button>
          <button
            className={`analyses-list-filter-btn ${filter === 'processing' ? 'active' : ''}`}
            onClick={() => setFilter('processing')}
          >
            Processando
          </button>
          <button
            className={`analyses-list-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Concluídas
          </button>
          <button
            className={`analyses-list-filter-btn ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Falhadas
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {loading ? (
          <LoadingSpinner message="Carregando análises..." />
        ) : filteredAnalyses.length === 0 ? (
          <div className="analyses-list-empty">
            <p>
              {filter === 'all'
                ? 'Nenhuma análise cadastrada ainda.'
                : `Nenhuma análise com status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="analyses-list-grid">
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

