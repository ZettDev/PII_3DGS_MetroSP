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
    <div className="projects-list-wrap">
      <div className="projects-list-header">
        <button className="projects-list-back-btn" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="projects-list-content">
        <div className="projects-list-title-section">
          <h1 className="projects-list-title">Projetos</h1>
          <button className="projects-list-create-btn" onClick={() => navigate('/projetos/novo')}>
            ➕ Novo Projeto
          </button>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {loading ? (
          <LoadingSpinner message="Carregando projetos..." />
        ) : projects.length === 0 ? (
          <div className="projects-list-empty">
            <p>Nenhum projeto cadastrado ainda.</p>
            <button className="projects-list-empty-btn" onClick={() => navigate('/projetos/novo')}>
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="projects-list-grid">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Deletar Projeto"
        message={`Tem certeza que deseja deletar o projeto "${projectToDelete?.name}"? Esta ação não pode ser desfeita e todos os registros e análises associados serão removidos.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        confirmText={deleting ? 'Deletando...' : 'Deletar'}
        cancelText="Cancelar"
      />
    </div>
  );
}

export default ProjectsList;

