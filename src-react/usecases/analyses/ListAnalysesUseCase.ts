import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';

/**
 * Use Case: Listar todas as análises
 */
export class ListAnalysesUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(): Promise<Analysis[]> {
    return this.analysisRepository.listAnalyses();
  }
}


