const API_BASE_URL = 'http://localhost:3000';

/**
 * Serviço de API para comunicação com o backend
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Faz uma requisição HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    // Remove Content-Type para multipart/form-data
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      // Se a resposta for um arquivo binário
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/octet-stream')) {
        return response.blob();
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  // Projects
  async createProject(formData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: formData,
    });
  }

  async getProjects() {
    return this.request('/api/projects');
  }

  async getProject(id) {
    return this.request(`/api/projects/${id}`);
  }

  async deleteProject(id) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Records
  async createRecord(projectId, formData) {
    return this.request(`/api/projects/${projectId}/records`, {
      method: 'POST',
      body: formData,
    });
  }

  async getRecords(projectId) {
    return this.request(`/api/projects/${projectId}/records`);
  }

  // Analyses
  async createAnalysis(data) {
    return this.request('/api/analyses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async getAnalyses() {
    return this.request('/api/analyses');
  }

  async getAnalysis(id) {
    return this.request(`/api/analyses/${id}`);
  }

  async cancelAnalysis(id) {
    return this.request(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
  }

  // Constructions (Alias)
  async createConstruction(formData) {
    return this.request('/api/construction', {
      method: 'POST',
      body: formData,
    });
  }

  async getConstructions() {
    return this.request('/api/constructions');
  }

  // Photo Processing Full
  async photoProcessingFull(constructionId, formData) {
    return this.request(`/api/${constructionId}/photo-processing-full`, {
      method: 'POST',
      body: formData,
    });
  }

  // Analysis Full
  async analysisFull(constructionId, data) {
    return this.request(`/api/${constructionId}/analysis-full`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // Get Project Analyses
  async getProjectAnalyses(constructionId) {
    return this.request(`/api/${constructionId}/analyses`);
  }

  // Download File
  async downloadFile(constructionId, fileType, fileId) {
    const blob = await this.request(`/api/${constructionId}/${fileType}/${fileId}`);
    return blob;
  }

  // Helper para criar URL de download
  getFileUrl(constructionId, fileType, fileId) {
    return `${this.baseURL}/api/${constructionId}/${fileType}/${fileId}`;
  }

  // Helper para criar URL de download do MTL (para arquivos OBJ)
  // Endpoint: GET /api/:constructionId/mtl/:fileId
  // O fileId não é usado, mas é obrigatório na URL
  getMtlFileUrl(constructionId) {
    return `${this.baseURL}/api/${constructionId}/mtl/0`;
  }
}

export default new ApiService();

