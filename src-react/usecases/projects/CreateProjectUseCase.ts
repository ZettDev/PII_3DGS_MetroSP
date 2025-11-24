import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { Project } from '../../domain/entities/Project';
import { CreateProjectRequestDTO } from '../../../data/dtos/ProjectDTO';

/**
 * Use Case: Criar um novo projeto
 */
export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(data: CreateProjectRequestDTO): Promise<Project> {
    // Validações básicas
    if (!data.name || data.name.trim() === '') {
      throw new Error('O nome do projeto é obrigatório');
    }

    if (!data.modeloBim) {
      throw new Error('O arquivo BIM é obrigatório');
    }

    // Validação de tipo de arquivo
    const allowedExtensions = ['.ifc', '.dwg', '.obj', '.ply'];
    const fileName = data.modeloBim.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExtension) {
      throw new Error(
        `Tipo de arquivo não suportado. Tipos permitidos: ${allowedExtensions.join(', ')}`
      );
    }

    return this.projectRepository.createProject(data);
  }
}


