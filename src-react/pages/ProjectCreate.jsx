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
    // Retorna o arquivo principal (.obj, .ply, .ifc, .dwg) ou o primeiro arquivo
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
    
    if (!name.trim()) {
      setError('O nome do projeto é obrigatório');
      return;
    }

    const bimFile = getBimFile();
    if (!bimFile) {
      setError('O arquivo BIM é obrigatório');
      return;
    }

    const mtlFile = getMtlFile();
    const isObjFile = bimFile.name.toLowerCase().endsWith('.obj');
    
    // Validar que MTL só pode ser enviado com OBJ
    if (mtlFile && !isObjFile) {
      setError('O arquivo .mtl só pode ser enviado quando o arquivo BIM é .obj');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', name);
      if (description.trim()) {
        formData.append('description', description);
      }
      formData.append('modeloBim', bimFile);
      
      // Se houver arquivo .mtl e o BIM for .obj, adicionar como modeloMtl
      if (mtlFile && isObjFile) {
        formData.append('modeloMtl', mtlFile);
      }

      const project = await api.createProject(formData);
      navigate(`/projetos/${project.id}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-create-wrap">
      <div className="project-create-header">
        <button className="project-create-back-btn" onClick={() => navigate('/')}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="project-create-content">
        <h1 className="project-create-title">Criar Novo Projeto</h1>

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form className="project-create-form" onSubmit={handleSubmit}>
          <div className="project-create-field">
            <label className="project-create-label">
              Nome do Projeto <span className="required">*</span>
            </label>
            <input
              type="text"
              className="project-create-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Estação Morumbi - Bloco A"
              required
            />
          </div>

          <div className="project-create-field">
            <label className="project-create-label">Descrição</label>
            <textarea
              className="project-create-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do projeto"
              rows={4}
            />
          </div>

          <div className="project-create-field">
            <label className="project-create-label">
              Arquivo BIM <span className="required">*</span>
            </label>
            <FileUpload
              accept=".ifc,.dwg,.obj,.ply,.mtl"
              multiple={true}
              maxFiles={2}
              minSize={0}
              maxSize={5 * 1024 * 1024 * 1024} // 5GB
              onFilesSelected={handleFileSelected}
              label="Selecionar arquivo BIM"
              description="Formatos aceitos: .ifc, .dwg, .obj, .ply. Para arquivos .obj, você pode incluir um arquivo .mtl (máx. 5GB por arquivo)"
            />
            {bimFiles.length > 0 && (
              <div className="project-create-files-info">
                <p className="project-create-files-selected">
                  Arquivos selecionados:
                </p>
                <ul className="project-create-files-list">
                  {bimFiles.map((file, index) => {
                    const isBim = !file.name.toLowerCase().endsWith('.mtl');
                    const isObj = file.name.toLowerCase().endsWith('.obj');
                    const isMtl = file.name.toLowerCase().endsWith('.mtl');
                    return (
                      <li key={index} className="project-create-file-item">
                        <span className={isBim ? 'project-create-file-bim' : 'project-create-file-mtl'}>
                          {isBim ? '📄' : '🎨'} {file.name}
                        </span>
                        {isMtl && !isObj && (
                          <span className="project-create-file-warning">
                            ⚠️ Arquivo .mtl só pode ser usado com .obj
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="project-create-actions">
            <button
              type="button"
              className="project-create-btn project-create-btn-cancel"
              onClick={() => navigate('/projetos')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="project-create-btn project-create-btn-submit"
              disabled={loading || !name.trim() || !getBimFile()}
            >
              {loading ? 'Criando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>

        {loading && <LoadingSpinner message="Criando projeto..." />}
      </div>
    </div>
  );
}

export default ProjectCreate;

