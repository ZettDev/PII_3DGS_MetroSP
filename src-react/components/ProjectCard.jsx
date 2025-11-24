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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="card" onClick={handleClick}>
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        {onDelete && (
          <button
            className="btn-icon-delete"
            onClick={handleDelete}
            title="Excluir projeto"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <p className="card-desc">{project.description || 'Sem descrição.'}</p>
      <div className="card-footer">
        <span className="card-date">
          Criado em: {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default ProjectCard;