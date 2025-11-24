import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ThemeToggle from '../components/ThemeToggle';
import './ProjectCreate.css';

function ProjectCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bimFiles, setBimFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelected = (files) => {
    setBimFiles(files || []);
  };

  const getBimFile = () => {
    const objFile = bimFiles.find(f => f.name.toLowerCase().endsWith('.obj'));
    const plyFile = bimFiles.find(f => f.name.toLowerCase().endsWith('.ply'));
    const ifcFile = bimFiles.find(f => f.name.toLowerCase().endsWith('.ifc'));
    const dwgFile = bimFiles.find(f => f.name.toLowerCase().endsWith('.dwg'));
    return objFile || plyFile || ifcFile || dwgFile || bimFiles[0] || null;
  };

  const getMtlFile = () => {
    return bimFiles.find(f => f.name.toLowerCase().endsWith('.mtl')) || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Nome obrigatório');
    const bimFile = getBimFile();
    if (!bimFile) return setError('Arquivo BIM obrigatório');

    const mtlFile = getMtlFile();
    const isObjFile = bimFile.name.toLowerCase().endsWith('.obj');
    if (mtlFile && !isObjFile) return setError('Arquivo .mtl requer um .obj');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      if (description.trim()) formData.append('description', description);
      formData.append('modeloBim', bimFile);
      if (mtlFile && isObjFile) formData.append('modeloMtl', mtlFile);

      const project = await api.createProject(formData);
      navigate(`/projetos/${project.id}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-wrap">
      <div className="create-header">
        <button className="btn-back-link" onClick={() => navigate('/projetos')}>
           <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="create-container">
        <div className="create-card">
          <h1 className="create-title">Novo Projeto</h1>
          
          {error && <ErrorAlert message={error} onClose={() => setError('')} />}

          <form className="create-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome do Projeto <span style={{color: '#EE3E34'}}>*</span></label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Estação Sé - Plataforma Norte"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre o local ou escopo..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Arquivos BIM <span style={{color: '#EE3E34'}}>*</span></label>
              <FileUpload
                accept=".ifc,.dwg,.obj,.ply,.mtl"
                multiple={true}
                maxFiles={2}
                onFilesSelected={handleFileSelected}
                label="Clique ou arraste o arquivo BIM"
                description=".obj (+ .mtl opcional), .ply, .ifc, .dwg"
              />
              
              {bimFiles.length > 0 && (
                <div className="file-list">
                  {bimFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <svg className="file-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="file-name">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/projetos')}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit" disabled={loading || !name.trim() || !getBimFile()}>
                {loading ? 'Criando...' : 'Confirmar Criação'}
              </button>
            </div>
          </form>
        </div>
        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}

export default ProjectCreate;