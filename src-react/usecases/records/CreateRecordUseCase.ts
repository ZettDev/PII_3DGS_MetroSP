import { IRecordRepository } from '../../domain/interfaces/IRecordRepository';
import { Record } from '../../domain/entities/Record';
import { CreateRecordRequestDTO } from '../../../data/dtos/RecordDTO';

/**
 * Use Case: Criar um novo registro de fotos
 */
export class CreateRecordUseCase {
  constructor(private recordRepository: IRecordRepository) {}

  async execute(projectId: number, data: CreateRecordRequestDTO): Promise<Record> {
    // Validações básicas
    if (!projectId || projectId <= 0) {
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

    return this.recordRepository.createRecord(projectId, data);
  }
}


