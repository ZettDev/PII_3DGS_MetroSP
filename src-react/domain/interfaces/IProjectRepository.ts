import { Project } from '../entities/Project';
import { CreateProjectRequestDTO } from '../../data/dtos/ProjectDTO';

/**
 * Interface do repositório de Projects
 */
export interface IProjectRepository {
  /**
   * Cria um novo projeto
   */
  createProject(data: CreateProjectRequestDTO): Promise<Project>;

  /**
   * Obtém um projeto pelo ID
   */
  getProject(id: number): Promise<Project>;

  /**
   * Lista todos os projetos
   */
  listProjects(): Promise<Project[]>;
}


