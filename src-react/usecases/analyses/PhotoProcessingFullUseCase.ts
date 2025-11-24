import { IAnalysisRepository } from '../../domain/interfaces/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';
import { PhotoProcessingFullRequestDTO } from '../../../data/dtos/AnalysisDTO';

/**
 * Use Case: Processamento completo (upload de fotos + registro + análise)
 */
export class PhotoProcessingFullUseCase {
  constructor(private analysisRepository: IAnalysisRepository) {}

  async execute(
    constructionId: number,
    data: PhotoProcessingFullRequestDTO
  ): Promise<Analysis> {
    // Validações básicas
    if (!constructionId || constructionId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    if (!data.name || data.name.trim() === '') {
      throw new Error('O nome do registro é obrigatório');
    }

    if (!data.fotos || data.fotos.length === 0) {
      throw new Error('Pelo menos uma foto é obrigatória');
    }

    if (data.fotos.length < 3) {
      throw new Error('Mínimo de 3 fotos é necessário para reconstrução 3D');
    }

    if (data.fotos.length > 20) {
      throw new Error('Máximo de 20 fotos por request');
    }

    // Validação de tipos de arquivo
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    for (const foto of data.fotos) {
      const fileName = foto.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

      if (!hasValidExtension) {
        throw new Error(
          `Tipo de arquivo não suportado: ${foto.name}. Tipos permitidos: ${allowedExtensions.join(', ')}`
        );
      }
    }

    // Validação de parâmetros JSON se fornecido
    if (data.parametros) {
      try {
        JSON.parse(data.parametros);
      } catch {
        throw new Error('O campo parametros deve ser um JSON válido');
      }
    }

    return this.analysisRepository.photoProcessingFull(constructionId, data);
  }
}


