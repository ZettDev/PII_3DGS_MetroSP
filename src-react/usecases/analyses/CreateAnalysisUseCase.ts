import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';
import { CreateAnalysisRequestDTO } from '../../../data/dtos/AnalysisDTO';

/**
 * Use Case: Criar uma nova análise
 */
export class CreateAnalysisUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(data: CreateAnalysisRequestDTO): Promise<Analysis> {
    // Validações básicas
    if (!data.projectId || data.projectId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    if (!data.recordId || data.recordId <= 0) {
      throw new Error('ID do registro inválido');
    }

    return this.analysisRepository.createAnalysis(data);
  }
}


