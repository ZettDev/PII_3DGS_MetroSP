import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle';
import './ProjectsList.css';

function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeleting(true);
      setError('');
      await api.deleteProject(projectToDelete.id);
      setShowDeleteDialog(false);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Erro ao deletar projeto');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="projects-wrap">
      {/* Header Fixo */}
      <header className="projects-header">
        <div className="header-left">
          <button className="btn-back-link" onClick={() => navigate('/')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
        </div>
        <ThemeToggle />
      </header>

      {/* Conteúdo Principal */}
      <main className="projects-container">
        <div className="projects-controls">
          <div>
            <h1 className="page-title">Projetos</h1>
            <p className="page-subtitle">Gerencie os canteiros de obras e ativos monitorados.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/projetos/novo')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Projeto
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {loading ? (
          <LoadingSpinner message="Carregando projetos..." />
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum projeto encontrado no sistema.</p>
            <button className="btn-primary" onClick={() => navigate('/projetos/novo')}>
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Projeto"
        message={`Atenção: O projeto "${projectToDelete?.name}" e todos os seus registros serão removidos permanentemente. Deseja continuar?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        confirmText={deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
        cancelText="Cancelar"
      />
    </div>
  );
}

export default ProjectsList;