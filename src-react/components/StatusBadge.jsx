import React from 'react';
import './StatusBadge.css';

function StatusBadge({ status }) {
  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed':
      case 'concluído':
        return 'status-completed';
      case 'processing':
      case 'processando':
        return 'status-processing';
      case 'pending':
      case 'pendente':
        return 'status-pending';
      case 'failed':
      case 'falhou':
        return 'status-failed';
      case 'cancelled':
      case 'cancelado':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status || 'Desconhecido';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;

