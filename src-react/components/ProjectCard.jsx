import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projetos/${project.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
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

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-card-header">
        <h3 className="project-card-title">{project.name}</h3>
        {onDelete && (
          <button
            className="project-card-delete-btn"
            onClick={handleDelete}
            title="Deletar projeto"
          >
            🗑️
          </button>
        )}
      </div>
      {project.description && (
        <p className="project-card-description">{project.description}</p>
      )}
      <div className="project-card-footer">
        <span className="project-card-date">
          Criado em: {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default ProjectCard;

