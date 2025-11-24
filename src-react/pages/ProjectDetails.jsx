import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import RecordCard from '../components/RecordCard';
import AnalysisCard from '../components/AnalysisCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle';
import './ProjectDetails.css';

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [records, setRecords] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectData, recordsData, analysesData] = await Promise.all([
        api.getProject(id),
        api.getRecords(id),
        api.getProjectAnalyses(id),
      ]);
      setProject(projectData);
      setRecords(recordsData || []);
      setAnalyses(analysesData?.analyses || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do projeto');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBIM = () => {
    if (!project?.bimPath) {
      setError('Arquivo BIM não disponível');
      return;
    }

    const url = api.getFileUrl(id, 'bim', 0);
    const bimPath = project.bimPath.toLowerCase();
    
    // Determinar visualizador baseado na extensão do arquivo
    if (bimPath.endsWith('.obj')) {
      // Para OBJ, incluir URL do MTL se disponível
      const mtlUrl = api.getMtlFileUrl(id);
      navigate(`/obj-viewer?url=${encodeURIComponent(url)}&mtlUrl=${encodeURIComponent(mtlUrl)}`);
    } else if (bimPath.endsWith('.ply')) {
      navigate(`/ply-viewer?url=${encodeURIComponent(url)}`);
    } else {
      // Padrão: usar OBJViewer para outros formatos
      navigate(`/obj-viewer?url=${encodeURIComponent(url)}`);
    }
  };

  const handleDownloadBIM = async () => {
    try {
      const blob = await api.downloadFile(id, 'bim', 0);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = project.bimPath?.split('/').pop() || 'modelo.bim';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Erro ao baixar arquivo BIM');
    }
  };

  const handleViewRecord = (record) => {
    navigate(`/ply-viewer?url=${encodeURIComponent(api.getFileUrl(id, 'registro', record.id))}`);
  };

  const handleDownloadRecord = async (record) => {
    try {
      const blob = await api.downloadFile(id, 'registro', record.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.recordPath?.split('/').pop() || 'registro.ply';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Erro ao baixar registro');
    }
  };

  const handlePhotoProcessingFull = () => {
    setPendingAction('photo-processing');
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    setShowConfirmDialog(false);
    if (pendingAction === 'photo-processing') {
      navigate(`/projetos/${id}/registros/novo?full=true`);
    }
    setPendingAction(null);
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      setError('');
      await api.deleteProject(id);
      navigate('/projetos');
    } catch (err) {
      setError(err.message || 'Erro ao deletar projeto');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="project-details-wrap">
        <LoadingSpinner message="Carregando projeto..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-wrap">
        <ErrorAlert message="Projeto não encontrado" />
        <button onClick={() => navigate('/projetos')}>Voltar para Projetos</button>
      </div>
    );
  }

  return (
    <div className="project-details-wrap">
      <div className="project-details-header">
        <button className="project-details-back-btn" onClick={() => navigate('/projetos')}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="project-details-content">
        <div className="project-details-info">
          <h1 className="project-details-title">{project.name}</h1>
          {project.description && (
            <p className="project-details-description">{project.description}</p>
          )}
          <div className="project-details-meta">
            <span>Criado em: {formatDate(project.createdAt)}</span>
          </div>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <div className="project-details-actions">
          <button className="project-details-action-btn" onClick={() => navigate(`/projetos/${id}/registros/novo`)}>
            📸 Adicionar Registro
          </button>
          <button className="project-details-action-btn" onClick={handlePhotoProcessingFull}>
            🚀 Processamento Completo
          </button>
          <button className="project-details-action-btn" onClick={() => navigate(`/projetos/${id}/analises/nova`)}>
            📊 Reanálise C2C
          </button>
          <button className="project-details-action-btn" onClick={handleViewBIM}>
            👁️ Visualizar BIM
          </button>
          <button className="project-details-action-btn" onClick={handleDownloadBIM}>
            ⬇️ Download BIM
          </button>
          <button 
            className="project-details-action-btn project-details-action-btn-danger" 
            onClick={() => setShowDeleteDialog(true)}
          >
            🗑️ Deletar Projeto
          </button>
        </div>

        <div className="project-details-sections">
          <section className="project-details-section">
            <h2 className="project-details-section-title">Registros ({records.length})</h2>
            {records.length === 0 ? (
              <div className="project-details-empty">
                <p>Nenhum registro cadastrado ainda.</p>
                <button
                  className="project-details-empty-btn"
                  onClick={() => navigate(`/projetos/${id}/registros/novo`)}
                >
                  Adicionar Primeiro Registro
                </button>
              </div>
            ) : (
              <div className="project-details-records">
                {records.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onView={handleViewRecord}
                    onDownload={handleDownloadRecord}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="project-details-section">
            <h2 className="project-details-section-title">Análises ({analyses.length})</h2>
            {analyses.length === 0 ? (
              <div className="project-details-empty">
                <p>Nenhuma análise realizada ainda.</p>
              </div>
            ) : (
              <div className="project-details-analyses">
                {analyses.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Processamento Completo"
        message="Você será redirecionado para fazer upload de fotos e iniciar o processamento completo (upload + 3DGS + análise C2C)."
        onConfirm={confirmAction}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPendingAction(null);
        }}
        confirmText="Continuar"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Deletar Projeto"
        message={`Tem certeza que deseja deletar o projeto "${project?.name}"? Esta ação não pode ser desfeita e todos os registros e análises associados serão removidos.`}
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText={deleting ? 'Deletando...' : 'Deletar'}
        cancelText="Cancelar"
      />
    </div>
  );
}

export default ProjectDetails;

