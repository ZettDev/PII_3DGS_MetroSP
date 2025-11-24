import { Record } from '../entities/Record';
import { CreateRecordRequestDTO } from '../../data/dtos/RecordDTO';

/**
 * Interface do repositório de Records
 */
export interface IRecordRepository {
  /**
   * Cria um novo registro de fotos para um projeto
   */
  createRecord(projectId: number, data: CreateRecordRequestDTO): Promise<Record>;

  /**
   * Lista todos os registros de um projeto
   */
  listRecords(projectId: number): Promise<Record[]>;
}


