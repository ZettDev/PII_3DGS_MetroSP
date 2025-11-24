import { ApiService } from '../services/ApiService';
import { IRecordRepository } from '../../domain/interfaces/IRecordRepository';
import { Record } from '../../domain/entities/Record';
import {
  CreateRecordRequestDTO,
  RecordResponseDTO,
  RecordsListResponseDTO,
} from '../dtos/RecordDTO';

/**
 * Implementação concreta do repositório de Records
 */
export class RecordRepository extends ApiService implements IRecordRepository {
  /**
   * Cria um novo registro de fotos para um projeto
   */
  async createRecord(projectId: number, data: CreateRecordRequestDTO): Promise<Record> {
    const formData = new FormData();
    formData.append('name', data.name);
    data.fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });

    const response = await this.postFormData<RecordResponseDTO>(
      `/api/projects/${projectId}/records`,
      formData
    );

    return Record.fromRaw(response);
  }

  /**
   * Lista todos os registros de um projeto
   */
  async listRecords(projectId: number): Promise<Record[]> {
    const response = await this.get<RecordsListResponseDTO>(
      `/api/projects/${projectId}/records`
    );
    return response.map((item) => Record.fromRaw(item));
  }
}


