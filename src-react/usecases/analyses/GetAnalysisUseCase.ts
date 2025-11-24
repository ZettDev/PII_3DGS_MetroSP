import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';

/**
 * Use Case: Obter uma análise pelo ID
 */
export class GetAnalysisUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(id: number): Promise<Analysis> {
    if (!id || id <= 0) {
      throw new Error('ID da análise inválido');
    }

    return this.analysisRepository.getAnalysis(id);
  }
}


