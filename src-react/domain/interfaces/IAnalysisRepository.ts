import { Analysis } from '../entities/Analysis';
import {
  CreateAnalysisRequestDTO,
  PhotoProcessingFullRequestDTO,
  AnalysisFullRequestDTO,
  CancelAnalysisResponseDTO,
} from '../../data/dtos/AnalysisDTO';

/**
 * Interface do repositório de Analyses
 */
export interface IAnalysisRepository {
  /**
   * Cria uma nova análise
   */
  createAnalysis(data: CreateAnalysisRequestDTO): Promise<Analysis>;

  /**
   * Obtém uma análise pelo ID
   */
  getAnalysis(id: number): Promise<Analysis>;

  /**
   * Lista todas as análises
   */
  listAnalyses(): Promise<Analysis[]>;

  /**
   * Lista todas as análises de um projeto
   */
  listProjectAnalyses(constructionId: number): Promise<Analysis[]>;

  /**
   * Cancela uma análise
   */
  cancelAnalysis(id: number): Promise<CancelAnalysisResponseDTO>;

  /**
   * Processamento completo: upload de fotos + criação de registro + análise
   */
  photoProcessingFull(
    constructionId: number,
    data: PhotoProcessingFullRequestDTO
  ): Promise<Analysis>;

  /**
   * Análise completa usando modelos existentes
   */
  analysisFull(constructionId: number, data: AnalysisFullRequestDTO): Promise<Analysis>;

  /**
   * Baixa um arquivo (BIM, registro ou análise)
   */
  downloadFile(
    constructionId: number,
    fileType: 'bim' | 'registro' | 'analise',
    fileId: number
  ): Promise<Blob>;
}


