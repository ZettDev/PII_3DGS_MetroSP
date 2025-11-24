import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { CancelAnalysisResponseDTO } from '../../../data/dtos/AnalysisDTO';

/**
 * Use Case: Cancelar uma análise
 */
export class CancelAnalysisUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(id: number): Promise<CancelAnalysisResponseDTO> {
    if (!id || id <= 0) {
      throw new Error('ID da análise inválido');
    }

    // Verifica se a análise pode ser cancelada antes de tentar cancelar
    const analysis = await this.analysisRepository.getAnalysis(id);

    if (!analysis.canBeCancelled()) {
      throw new Error(
        `A análise não pode ser cancelada. Status atual: ${analysis.status}`
      );
    }

    return this.analysisRepository.cancelAnalysis(id);
  }
}


