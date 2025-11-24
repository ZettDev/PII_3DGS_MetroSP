import React from 'react';
import StatusBadge from './StatusBadge';
import './RecordCard.css';

function RecordCard({ record, onView, onDownload }) {
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

  const hasReconstruction = !!record.recordPath;

  return (
    <div className="record-card">
      <div className="record-card-header">
        <h3 className="record-card-title">{record.name}</h3>
        <StatusBadge status={hasReconstruction ? 'completed' : 'pending'} />
      </div>
      <div className="record-card-info">
        <span className="record-card-photos">
          {record.uploadedFilesPaths?.length || 0} foto(s)
        </span>
        <span className="record-card-date">
          {formatDate(record.createdAt)}
        </span>
      </div>
      <div className="record-card-actions">
        {hasReconstruction && onView && (
          <button className="record-card-btn" onClick={() => onView(record)}>
            Visualizar
          </button>
        )}
        {hasReconstruction && onDownload && (
          <button className="record-card-btn" onClick={() => onDownload(record)}>
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export default RecordCard;

