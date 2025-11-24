import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ThemeToggle from '../components/ThemeToggle';
import './AnalysisCreate.css';

function AnalysisCreate() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError('');
      const [projectData, recordsData] = await Promise.all([
        api.getProject(projectId),
        api.getRecords(projectId),
      ]);
      setProject(projectData);
      const recordsWithReconstruction = (recordsData || []).filter(r => r.recordPath);
      setRecords(recordsWithReconstruction);
      if (recordsWithReconstruction.length > 0) {
        setSelectedRecordId(recordsWithReconstruction[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRecordId) {
      setError('Selecione um registro');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = {
        recordId: parseInt(selectedRecordId),
      };

      const result = await api.analysisFull(projectId, data);
      navigate(`/analises/${result.analysisId}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar análise');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="analysis-create-wrap">
        <LoadingSpinner message="Carregando dados..." />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="analysis-create-wrap">
        <div className="analysis-create-header">
          <button className="analysis-create-back-btn" onClick={() => navigate(`/projetos/${projectId}`)}>
            ← Voltar
          </button>
          <ThemeToggle />
        </div>
        <div className="analysis-create-content">
          <h1 className="analysis-create-title">Criar Nova Análise</h1>
          <ErrorAlert message="Nenhum registro com reconstrução 3D encontrado. Execute o processamento completo primeiro." />
          <button
            className="analysis-create-btn"
            onClick={() => navigate(`/projetos/${projectId}/registros/novo?full=true`)}
          >
            Executar Processamento Completo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-create-wrap">
      <div className="analysis-create-header">
        <button className="analysis-create-back-btn" onClick={() => navigate(`/projetos/${projectId}`)}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="analysis-create-content">
        <h1 className="analysis-create-title">Criar Nova Análise C2C</h1>
        {project && (
          <p className="analysis-create-subtitle">Projeto: {project.name}</p>
        )}

        <div className="analysis-create-info">
          <p>
            Esta análise irá comparar o modelo BIM com a reconstrução 3DGS do registro selecionado usando o método C2C (Cloud-to-Cloud).
          </p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form className="analysis-create-form" onSubmit={handleSubmit}>
          <div className="analysis-create-field">
            <label className="analysis-create-label">
              Registro <span className="required">*</span>
            </label>
            <select
              className="analysis-create-select"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              required
            >
              <option value="">Selecione um registro</option>
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.name} ({record.uploadedFilesPaths?.length || 0} fotos)
                </option>
              ))}
            </select>
          </div>

          <div className="analysis-create-actions">
            <button
              type="button"
              className="analysis-create-btn analysis-create-btn-cancel"
              onClick={() => navigate(`/projetos/${projectId}`)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="analysis-create-btn analysis-create-btn-submit"
              disabled={loading || !selectedRecordId}
            >
              {loading ? 'Criando...' : 'Criar Análise'}
            </button>
          </div>
        </form>

        {loading && <LoadingSpinner message="Criando análise..." />}
      </div>
    </div>
  );
}

export default AnalysisCreate;

