import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { FileType } from '../../../shared/types/common';

/**
 * Use Case: Baixar um arquivo (BIM, registro ou análise)
 */
export class DownloadFileUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(
    constructionId: number,
    fileType: FileType,
    fileId: number
  ): Promise<Blob> {
    // Validações básicas
    if (!constructionId || constructionId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    if (!['bim', 'registro', 'analise'].includes(fileType)) {
      throw new Error('Tipo de arquivo inválido. Valores válidos: bim, registro, analise');
    }

    if (!fileId || fileId < 0) {
      throw new Error('ID do arquivo inválido');
    }

    return this.analysisRepository.downloadFile(constructionId, fileType, fileId);
  }
}


