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
    
    if (bimPath.endsWith('.obj')) {
      const mtlUrl = api.getMtlFileUrl(id);
      navigate(`/obj-viewer?url=${encodeURIComponent(url)}&mtlUrl=${encodeURIComponent(mtlUrl)}`);
    } else if (bimPath.endsWith('.ply')) {
      navigate(`/ply-viewer?url=${encodeURIComponent(url)}`);
    } else {
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner message="Carregando projeto..." />;
  if (!project) return <ErrorAlert message="Projeto não encontrado" />;

  return (
    <div className="project-details">
      <header className="project-details__header">
        <div className="project-details__breadcrumbs">
          <button className="project-details__back-btn" onClick={() => navigate('/projetos')}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Voltar para Projetos</span>
          </button>
          <span className="project-details__breadcrumb-current">{project.name}</span>
        </div>
        <ThemeToggle />
      </header>

      {error && <div className="project-details__alert-container"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

      <div className="project-details__grid">
        <aside className="project-details__sidebar">
          <div className="card project-details__info-card">
            <h1 className="project-details__title">{project.name}</h1>
            <p className="project-details__description">{project.description || 'Sem descrição.'}</p>
            <div className="project-details__meta">
              <span className="project-details__meta-label">Data de Criação</span>
              <span className="project-details__meta-value">{formatDate(project.createdAt)}</span>
            </div>
          </div>

          <div className="card project-details__actions-card">
            <h3 className="project-details__actions-title">Ações do Projeto</h3>
            <div className="project-details__actions-list">
              <button className="btn btn--primary" onClick={() => navigate(`/projetos/${id}/registros/novo`)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Adicionar Registro
              </button>
              
              <button className="btn btn--secondary" onClick={handlePhotoProcessingFull}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Processamento Completo
              </button>

              <button className="btn btn--secondary" onClick={() => navigate(`/projetos/${id}/analises/nova`)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Reanálise C2C
              </button>

              <div className="project-details__action-divider"></div>

              <button className="btn btn--tertiary" onClick={handleViewBIM}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Visualizar Modelo BIM
              </button>

              <button className="btn btn--tertiary" onClick={handleDownloadBIM}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Baixar Modelo BIM
              </button>

              <div className="project-details__action-divider"></div>

              <button className="btn btn--danger" onClick={() => setShowDeleteDialog(true)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Excluir Projeto
              </button>
            </div>
          </div>
        </aside>

        <main className="project-details__content">
          <section className="project-details__section">
            <div className="project-details__section-header">
              <h2 className="project-details__section-title">Registros Fotográficos</h2>
              <span className="project-details__section-count">{records.length}</span>
            </div>
            {records.length === 0 ? (
              <div className="card project-details__empty-state">
                <p className="project-details__empty-text">Nenhum registro encontrado. Comece adicionando um registro fotográfico para iniciar o processamento.</p>
                <button className="btn btn--primary" onClick={() => navigate(`/projetos/${id}/registros/novo`)}>
                  Adicionar Primeiro Registro
                </button>
              </div>
            ) : (
              <div className="project-details__cards-list">
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

          <section className="project-details__section">
            <div className="project-details__section-header">
              <h2 className="project-details__section-title">Análises de Divergência (C2C)</h2>
              <span className="project-details__section-count">{analyses.length}</span>
            </div>
            {analyses.length === 0 ? (
              <div className="card project-details__empty-state">
                <p className="project-details__empty-text">Nenhuma análise de divergência foi gerada para este projeto.</p>
                <button className="btn btn--secondary" onClick={() => navigate(`/projetos/${id}/analises/nova`)}>
                  Criar Nova Análise C2C
                </button>
              </div>
            ) : (
              <div className="project-details__cards-list">
                {analyses.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Iniciar Processamento Completo"
        message="Deseja iniciar o fluxo completo de upload de fotos, reconstrução 3D e registro de dados?"
        onConfirm={confirmAction}
        onCancel={() => { setShowConfirmDialog(false); setPendingAction(null); }}
        confirmText="Iniciar Fluxo Completo"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Projeto Permanentemente"
        message="Atenção: Esta ação removerá permanentemente o projeto, todos os seus registros fotográficos e análises associadas. Esta ação é irreversível."
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText={deleting ? 'Excluindo...' : 'Excluir Definitivamente'}
        cancelText="Cancelar"
      />
    </div>
  );
}

export default ProjectDetails;