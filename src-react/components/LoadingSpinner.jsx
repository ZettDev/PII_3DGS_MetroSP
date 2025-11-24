import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', message }) {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClass}`} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;

