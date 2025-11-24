import { IRecordRepository } from '../../domain/interfaces/IRecordRepository';
import { Record } from '../../domain/entities/Record';

/**
 * Use Case: Listar registros de um projeto
 */
export class ListRecordsUseCase {
  constructor(private recordRepository: IRecordRepository) {}

  async execute(projectId: number): Promise<Record[]> {
    if (!projectId || projectId <= 0) {
      throw new Error('ID do projeto inválido');
    }

    return this.recordRepository.listRecords(projectId);
  }
}


