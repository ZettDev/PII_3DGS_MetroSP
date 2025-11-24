import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';

/**
 * Use Case: Listar análises de um projeto
 */
export class ListProjectAnalysesUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(constructionId: number): Promise<Analysis[]> {
    if (!constructionId || constructionId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    return this.analysisRepository.listProjectAnalyses(constructionId);
  }
}


