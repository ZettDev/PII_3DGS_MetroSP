import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle';
import './AnalysisDetails.css';

function AnalysisDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    // Polling para análises em processamento
    if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
      pollingIntervalRef.current = setInterval(() => {
        loadAnalysis();
      }, 3000); // Atualiza a cada 3 segundos
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [analysis?.status]);

  const loadAnalysis = async () => {
    try {
      setError('');
      const data = await api.getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await api.cancelAnalysis(id);
      await loadAnalysis();
      setShowCancelDialog(false);
    } catch (err) {
      setError(err.message || 'Erro ao cancelar análise');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewResult = () => {
    if (analysis?.result_path) {
      const url = api.getFileUrl(analysis.project_id, 'analise', analysis.id);
      navigate(`/ply-viewer?url=${encodeURIComponent(url)}`);
    }
  };

  const handleDownloadResult = async () => {
    try {
      const blob = await api.downloadFile(analysis.project_id, 'analise', analysis.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = analysis.result_path?.split('/').pop() || 'analise.ply';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Erro ao baixar resultado');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!id) {
    return (
      <div className="analysis-details-wrap">
        <ErrorAlert message="ID da análise não fornecido" />
        <button onClick={() => navigate('/analises')}>Voltar para Análises</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analysis-details-wrap">
        <LoadingSpinner message="Carregando análise..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-details-wrap">
        <ErrorAlert message="Análise não encontrada" />
        <button onClick={() => navigate('/analises')}>Voltar para Análises</button>
      </div>
    );
  }

  const canCancel = analysis.status === 'pending' || analysis.status === 'processing';
  const hasResult = analysis.status === 'completed' && analysis.result_path;

  return (
    <div className="analysis-details-wrap">
      <div className="analysis-details-header">
        <button className="analysis-details-back-btn" onClick={() => navigate('/analises')}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="analysis-details-content">
        <div className="analysis-details-info">
          <div className="analysis-details-title-section">
            <h1 className="analysis-details-title">Análise #{analysis.id}</h1>
            <StatusBadge status={analysis.status} />
          </div>
          <div className="analysis-details-meta">
            <span>Projeto ID: {analysis.project_id}</span>
            <span>Registro ID: {analysis.record_id}</span>
          </div>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <div className="analysis-details-progress-section">
          <h2 className="analysis-details-section-title">Progresso</h2>
          <ProgressBar progress={analysis.progress || 0} />
        </div>

        {analysis.mean_distance != null && typeof analysis.mean_distance === 'number' && (
          <div className="analysis-details-metrics">
            <h2 className="analysis-details-section-title">Métricas</h2>
            <div className="analysis-details-metrics-grid">
              <div className="analysis-details-metric">
                <span className="analysis-details-metric-label">Distância Média</span>
                <span className="analysis-details-metric-value">
                  {analysis.mean_distance.toFixed(4)}m
                </span>
              </div>
              {analysis.std_deviation != null && typeof analysis.std_deviation === 'number' && (
                <div className="analysis-details-metric">
                  <span className="analysis-details-metric-label">Desvio Padrão</span>
                  <span className="analysis-details-metric-value">
                    {analysis.std_deviation.toFixed(4)}m
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="analysis-details-timeline">
          <h2 className="analysis-details-section-title">Timeline</h2>
          <div className="analysis-details-timeline-items">
            <div className="analysis-details-timeline-item">
              <span className="analysis-details-timeline-label">Criado em:</span>
              <span className="analysis-details-timeline-value">{formatDate(analysis.created_at)}</span>
            </div>
            {analysis.started_at && (
              <div className="analysis-details-timeline-item">
                <span className="analysis-details-timeline-label">Iniciado em:</span>
                <span className="analysis-details-timeline-value">{formatDate(analysis.started_at)}</span>
              </div>
            )}
            {analysis.completed_at && (
              <div className="analysis-details-timeline-item">
                <span className="analysis-details-timeline-label">Concluído em:</span>
                <span className="analysis-details-timeline-value">{formatDate(analysis.completed_at)}</span>
              </div>
            )}
            {analysis.updated_at && (
              <div className="analysis-details-timeline-item">
                <span className="analysis-details-timeline-label">Última atualização:</span>
                <span className="analysis-details-timeline-value">{formatDate(analysis.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {analysis.logs && analysis.logs.length > 0 && (
          <div className="analysis-details-logs">
            <h2 className="analysis-details-section-title">Logs do Processamento</h2>
            <div className="analysis-details-logs-content">
              {analysis.logs.map((log, index) => (
                <div key={index} className="analysis-details-log-item">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.error && (
          <div className="analysis-details-error">
            <h2 className="analysis-details-section-title">Erro</h2>
            <div className="analysis-details-error-content">{analysis.error}</div>
          </div>
        )}

        <div className="analysis-details-actions">
          {canCancel && (
            <button
              className="analysis-details-action-btn analysis-details-action-btn-danger"
              onClick={() => setShowCancelDialog(true)}
            >
              ❌ Cancelar Análise
            </button>
          )}
          {hasResult && (
            <>
              <button
                className="analysis-details-action-btn"
                onClick={handleViewResult}
              >
                👁️ Visualizar Resultado
              </button>
              <button
                className="analysis-details-action-btn"
                onClick={handleDownloadResult}
              >
                ⬇️ Download Resultado
              </button>
            </>
          )}
          <button
            className="analysis-details-action-btn"
            onClick={() => navigate(`/projetos/${analysis.project_id}`)}
          >
            📋 Ver Projeto
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancelar Análise"
        message="Tem certeza que deseja cancelar esta análise? Esta ação não pode ser desfeita."
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
        confirmText={cancelling ? 'Cancelando...' : 'Cancelar'}
        cancelText="Voltar"
      />
    </div>
  );
}

export default AnalysisDetails;

