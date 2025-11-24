import React from 'react';
import './ErrorAlert.css';

function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-alert">
      <div className="error-alert-content">
        <span className="error-alert-icon">⚠️</span>
        <span className="error-alert-message">{message}</span>
        {onClose && (
          <button className="error-alert-close" onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;

