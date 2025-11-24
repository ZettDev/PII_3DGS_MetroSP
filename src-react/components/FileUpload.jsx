import React, { useRef, useState } from 'react';
import './FileUpload.css';

function FileUpload({ 
  accept, 
  multiple = false, 
  maxFiles = 20,
  minFiles = 1,
  maxSize = 100 * 1024 * 1024, // 100MB default
  minSize = 100 * 1024, // 100KB default
  onFilesSelected,
  label = 'Selecionar arquivos',
  description
}) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (minSize > 0 && file.size < minSize) {
      throw new Error(`O arquivo ${file.name} é muito pequeno. Tamanho mínimo: ${(minSize / 1024).toFixed(0)}KB`);
    }
    if (file.size > maxSize) {
      throw new Error(`O arquivo ${file.name} é muito grande. Tamanho máximo: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError('');

    try {
      if (selectedFiles.length < minFiles) {
        throw new Error(`Selecione pelo menos ${minFiles} arquivo(s)`);
      }

      if (selectedFiles.length > maxFiles) {
        throw new Error(`Selecione no máximo ${maxFiles} arquivo(s)`);
      }

      selectedFiles.forEach(validateFile);

      setFiles(selectedFiles);
      if (onFilesSelected) {
        onFilesSelected(selectedFiles);
      }
    } catch (err) {
      setError(err.message);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="file-upload">
      <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="file-upload-content">
          <span className="file-upload-icon">📁</span>
          <span className="file-upload-label">{label}</span>
          {description && (
            <span className="file-upload-description">{description}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="file-upload-error">{error}</div>
      )}

      {files.length > 0 && (
        <div className="file-upload-list">
          {files.map((file, index) => (
            <div key={index} className="file-upload-item">
              <span className="file-upload-item-name">{file.name}</span>
              <span className="file-upload-item-size">{formatFileSize(file.size)}</span>
              <button
                className="file-upload-item-remove"
                onClick={() => handleRemoveFile(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;

