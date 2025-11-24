/**
 * DTOs para endpoints de Records
 */

/**
 * Request DTO para criar um registro
 */
export interface CreateRecordRequestDTO {
  name: string;
  fotos: File[];
}

/**
 * Response DTO de um registro
 */
export interface RecordResponseDTO {
  id: number;
  name: string;
  uploadedFilesPaths: string[];
  recordPath: string | null;
  createdAt: string;
  projectId: number;
}

/**
 * Response DTO para lista de registros
 */
export type RecordsListResponseDTO = RecordResponseDTO[];


