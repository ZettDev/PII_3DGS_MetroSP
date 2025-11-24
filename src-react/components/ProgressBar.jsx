import React from 'react';
import './ProgressBar.css';

function ProgressBar({ progress = 0, showLabel = true }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">{Math.round(progress)}%</span>
      )}
    </div>
  );
}

export default ProgressBar;

