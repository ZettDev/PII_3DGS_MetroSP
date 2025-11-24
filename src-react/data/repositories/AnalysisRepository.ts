import { ApiService } from '../services/ApiService';
import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';
import {
  CreateAnalysisRequestDTO,
  CreateAnalysisResponseDTO,
  AnalysisResponseDTO,
  AnalysesListResponseDTO,
  ProjectAnalysesResponseDTO,
  PhotoProcessingFullRequestDTO,
  PhotoProcessingFullResponseDTO,
  AnalysisFullRequestDTO,
  AnalysisFullResponseDTO,
  CancelAnalysisResponseDTO,
} from '../dtos/AnalysisDTO';

/**
 * Implementação concreta do repositório de Analyses
 */
export class AnalysisRepository extends ApiService implements IAnalysisRepository {
  /**
   * Cria uma nova análise
   */
  async createAnalysis(data: CreateAnalysisRequestDTO): Promise<Analysis> {
    const response = await this.post<CreateAnalysisResponseDTO>('/api/analyses', {
      projectId: data.projectId,
      recordId: data.recordId,
      parametros: data.parametros,
    });

    // Após criar, busca a análise completa
    return this.getAnalysis(response.jobId);
  }

  /**
   * Obtém uma análise pelo ID
   */
  async getAnalysis(id: number): Promise<Analysis> {
    const response = await this.get<AnalysisResponseDTO>(`/api/analyses/${id}`);
    return Analysis.fromRaw(response);
  }

  /**
   * Lista todas as análises
   */
  async listAnalyses(): Promise<Analysis[]> {
    const response = await this.get<AnalysesListResponseDTO>('/api/analyses');
    return response.jobs.map((item) => Analysis.fromRaw(item));
  }

  /**
   * Lista todas as análises de um projeto
   */
  async listProjectAnalyses(constructionId: number): Promise<Analysis[]> {
    const response = await this.get<ProjectAnalysesResponseDTO>(
      `/api/${constructionId}/analyses`
    );
    return response.analyses.map((item) => Analysis.fromRaw(item));
  }

  /**
   * Cancela uma análise
   */
  async cancelAnalysis(id: number): Promise<CancelAnalysisResponseDTO> {
    return this.delete<CancelAnalysisResponseDTO>(`/api/analyses/${id}`);
  }

  /**
   * Processamento completo: upload de fotos + criação de registro + análise
   */
  async photoProcessingFull(
    constructionId: number,
    data: PhotoProcessingFullRequestDTO
  ): Promise<Analysis> {
    const formData = new FormData();
    formData.append('name', data.name);
    data.fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });
    if (data.parametros) {
      formData.append('parametros', data.parametros);
    }

    const response = await this.postFormData<PhotoProcessingFullResponseDTO>(
      `/api/${constructionId}/photo-processing-full`,
      formData
    );

    // Retorna a análise criada
    return this.getAnalysis(response.analysisId);
  }

  /**
   * Análise completa usando modelos existentes
   */
  async analysisFull(
    constructionId: number,
    data: AnalysisFullRequestDTO
  ): Promise<Analysis> {
    const response = await this.post<AnalysisFullResponseDTO>(
      `/api/${constructionId}/analysis-full`,
      {
        recordId: data.recordId,
        parametros: data.parametros,
      }
    );

    // Retorna a análise criada
    return this.getAnalysis(response.analysisId);
  }

  /**
   * Baixa um arquivo (BIM, registro ou análise)
   */
  async downloadFile(
    constructionId: number,
    fileType: 'bim' | 'registro' | 'analise',
    fileId: number
  ): Promise<Blob> {
    return this.getBlob(`/api/${constructionId}/${fileType}/${fileId}`);
  }
}


