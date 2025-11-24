import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';
import { AnalysisFullRequestDTO } from '../../../data/dtos/AnalysisDTO';

/**
 * Use Case: Análise completa usando modelos existentes
 */
export class AnalysisFullUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(
    constructionId: number,
    data: AnalysisFullRequestDTO
  ): Promise<Analysis> {
    // Validações básicas
    if (!constructionId || constructionId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    // Se recordId for fornecido, deve ser válido
    if (data.recordId !== undefined && data.recordId <= 0) {
      throw new Error('ID do registro inválido');
    }

    return this.analysisRepository.analysisFull(constructionId, data);
  }
}


