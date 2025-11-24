/**
 * DTOs para endpoints de Projects
 */

/**
 * Request DTO para criar um projeto
 */
export interface CreateProjectRequestDTO {
  name: string;
  description?: string;
  modeloBim: File;
}

/**
 * Response DTO de um projeto
 */
export interface ProjectResponseDTO {
  id: number;
  name: string;
  description: string | null;
  bimPath: string;
  createdAt: string;
}

/**
 * Response DTO para lista de projetos
 */
export type ProjectsListResponseDTO = ProjectResponseDTO[];


