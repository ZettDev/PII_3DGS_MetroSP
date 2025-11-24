import { AnalysisStatus } from '../../shared/types/common';
import { AnalysisOutputPaths } from '../../domain/entities/Analysis';

/**
 * DTOs para endpoints de Analyses
 */

/**
 * Request DTO para criar uma análise
 */
export interface CreateAnalysisRequestDTO {
  projectId: number;
  recordId: number;
  parametros?: AnalysisParametersDTO;
}

/**
 * Parâmetros opcionais para análise
 */
export interface AnalysisParametersDTO {
  threshold?: number;
  outputFormat?: 'json' | 'xml' | 'csv';
  [key: string]: unknown;
}

/**
 * Request DTO para photo-processing-full
 */
export interface PhotoProcessingFullRequestDTO {
  name: string;
  fotos: File[];
  parametros?: string; // JSON stringificado
}

/**
 * Request DTO para analysis-full
 */
export interface AnalysisFullRequestDTO {
  recordId?: number;
  parametros?: AnalysisParametersDTO;
}

/**
 * Response DTO de uma análise
 */
export interface AnalysisResponseDTO {
  id: number;
  project_id: number;
  record_id: number;
  status: AnalysisStatus;
  progress: number;
  logs: string[];
  error: string | null;
  output_paths: AnalysisOutputPaths | null;
  created_at: string;
  started_at: string | null;
  updated_at: string;
  completed_at: string | null;
  result_path: string | null;
  summary_json_path: string | null;
  mean_distance: number | null;
  std_deviation: number | null;
}

/**
 * Response DTO para criação de análise
 */
export interface CreateAnalysisResponseDTO {
  jobId: number;
  status: AnalysisStatus;
  message: string;
  timestamp: string;
}

/**
 * Response DTO para photo-processing-full
 */
export interface PhotoProcessingFullResponseDTO {
  analysisId: number;
  recordId: number;
  status: AnalysisStatus;
  message: string;
  timestamp: string;
}

/**
 * Response DTO para analysis-full
 */
export interface AnalysisFullResponseDTO {
  analysisId: number;
  status: AnalysisStatus;
  message: string;
  timestamp: string;
}

/**
 * Response DTO para lista de análises
 */
export interface AnalysesListResponseDTO {
  jobs: AnalysisResponseDTO[];
}

/**
 * Response DTO para análises de um projeto
 */
export interface ProjectAnalysesResponseDTO {
  analyses: AnalysisResponseDTO[];
}

/**
 * Response DTO para cancelamento de análise
 */
export interface CancelAnalysisResponseDTO {
  message: string;
  jobId: string;
}


