import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import './AnalysisCard.css';

function AnalysisCard({ analysis }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/analises/${analysis.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="analysis-card" onClick={handleClick}>
      <div className="analysis-card-header">
        <div>
          <h3 className="analysis-card-title">Análise #{analysis.id}</h3>
          <span className="analysis-card-meta">
            Projeto: {analysis.project_id} | Registro: {analysis.record_id}
          </span>
        </div>
        <StatusBadge status={analysis.status} />
      </div>
      <div className="analysis-card-progress">
        <ProgressBar progress={analysis.progress || 0} />
      </div>
      {analysis.mean_distance !== null && (
        <div className="analysis-card-metrics">
          <span>Distância média: {analysis.mean_distance.toFixed(4)}m</span>
          {analysis.std_deviation !== null && (
            <span>Desvio padrão: {analysis.std_deviation.toFixed(4)}m</span>
          )}
        </div>
      )}
      <div className="analysis-card-footer">
        <span className="analysis-card-date">
          {formatDate(analysis.created_at) || 'Data não disponível'}
        </span>
      </div>
    </div>
  );
}

export default AnalysisCard;

