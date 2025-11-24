import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ThemeToggle from '../components/ThemeToggle';
import './RecordCreate.css';

function RecordCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState('');
  const [fullProcessing, setFullProcessing] = useState(false);

  useEffect(() => {
    loadProject();
    if (searchParams.get('full') === 'true') {
      setFullProcessing(true);
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoadingProject(true);
      const data = await api.getProject(id);
      setProject(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar projeto');
    } finally {
      setLoadingProject(false);
    }
  };

  const handlePhotosSelected = (files) => {
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('O nome do registro é obrigatório');
      return;
    }

    if (photos.length < 3) {
      setError('É necessário pelo menos 3 fotos para reconstrução 3D');
      return;
    }

    if (photos.length > 20) {
      setError('Máximo de 20 fotos por registro');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (fullProcessing) {
        // Processamento completo: photo-processing-full
        const formData = new FormData();
        formData.append('name', name);
        photos.forEach((photo) => {
          formData.append('fotos', photo);
        });

        const result = await api.photoProcessingFull(id, formData);
        navigate(`/analises/${result.analysisId}`);
      } else {
        // Apenas criar registro
        const formData = new FormData();
        formData.append('name', name);
        photos.forEach((photo) => {
          formData.append('fotos', photo);
        });

        const record = await api.createRecord(id, formData);
        navigate(`/projetos/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar registro');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="record-create-wrap">
        <LoadingSpinner message="Carregando projeto..." />
      </div>
    );
  }

  return (
    <div className="record-create-wrap">
      <div className="record-create-header">
        <button className="record-create-back-btn" onClick={() => navigate(`/projetos/${id}`)}>
          ← Voltar
        </button>
        <ThemeToggle />
      </div>

      <div className="record-create-content">
        <h1 className="record-create-title">
          {fullProcessing ? 'Processamento Completo' : 'Adicionar Registro'}
        </h1>
        {project && (
          <p className="record-create-subtitle">Projeto: {project.name}</p>
        )}

        {fullProcessing && (
          <div className="record-create-info">
            <p>
              Este processo irá: fazer upload das fotos, criar o registro, executar reconstrução 3DGS 
              e iniciar a análise de comparação C2C automaticamente.
            </p>
          </div>
        )}

        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <form className="record-create-form" onSubmit={handleSubmit}>
          <div className="record-create-field">
            <label className="record-create-label">
              Nome do Registro <span className="required">*</span>
            </label>
            <input
              type="text"
              className="record-create-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Semana 5 - Fachada Leste"
              required
            />
          </div>

          <div className="record-create-field">
            <label className="record-create-label">
              Fotos <span className="required">*</span>
            </label>
            <FileUpload
              accept=".jpg,.jpeg,.png"
              multiple={true}
              minFiles={3}
              maxFiles={20}
              minSize={100 * 1024} // 100KB
              maxSize={100 * 1024 * 1024} // 100MB
              onFilesSelected={handlePhotosSelected}
              label="Selecionar fotos"
              description="Mínimo: 3 fotos | Máximo: 20 fotos | Formatos: .jpg, .jpeg, .png | Tamanho: 100KB - 100MB por foto"
            />
            {photos.length > 0 && (
              <p className="record-create-photos-count">
                {photos.length} foto(s) selecionada(s)
              </p>
            )}
          </div>

          <div className="record-create-actions">
            <button
              type="button"
              className="record-create-btn record-create-btn-cancel"
              onClick={() => navigate(`/projetos/${id}`)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="record-create-btn record-create-btn-submit"
              disabled={loading || !name.trim() || photos.length < 3}
            >
              {loading
                ? fullProcessing
                  ? 'Processando...'
                  : 'Criando...'
                : fullProcessing
                ? 'Iniciar Processamento Completo'
                : 'Criar Registro'}
            </button>
          </div>
        </form>

        {loading && (
          <LoadingSpinner
            message={
              fullProcessing
                ? 'Iniciando processamento completo...'
                : 'Criando registro...'
            }
          />
        )}
      </div>
    </div>
  );
}

export default RecordCreate;

