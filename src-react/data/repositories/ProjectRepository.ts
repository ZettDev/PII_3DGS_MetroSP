import { ApiService } from '../services/ApiService';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { Project } from '../../domain/entities/Project';
import {
  CreateProjectRequestDTO,
  ProjectResponseDTO,
  ProjectsListResponseDTO,
} from '../dtos/ProjectDTO';

/**
 * Implementação concreta do repositório de Projects
 */
export class ProjectRepository extends ApiService implements IProjectRepository {
  /**
   * Cria um novo projeto
   */
  async createProject(data: CreateProjectRequestDTO): Promise<Project> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('modeloBim', data.modeloBim);

    const response = await this.postFormData<ProjectResponseDTO>(
      '/api/projects',
      formData
    );

    return Project.fromRaw(response);
  }

  /**
   * Obtém um projeto pelo ID
   */
  async getProject(id: number): Promise<Project> {
    const response = await this.get<ProjectResponseDTO>(`/api/projects/${id}`);
    return Project.fromRaw(response);
  }

  /**
   * Lista todos os projetos
   */
  async listProjects(): Promise<Project[]> {
    const response = await this.get<ProjectsListResponseDTO>('/api/projects');
    return response.map((item) => Project.fromRaw(item));
  }
}


