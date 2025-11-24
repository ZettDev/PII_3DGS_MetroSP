import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { Project } from '../../domain/entities/Project';

/**
 * Use Case: Obter um projeto pelo ID
 */
export class GetProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: number): Promise<Project> {
    if (!id || id <= 0) {
      throw new Error('ID do projeto inválido');
    }

    return this.projectRepository.getProject(id);
  }
}


