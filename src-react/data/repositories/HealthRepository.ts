import { ApiService } from '../services/ApiService';
import { IHealthRepository } from '../../domain/interfaces/IHealthRepository';
import { Health } from '../../domain/entities/Health';
import { HealthResponseDTO } from '../dtos/HealthDTO';

/**
 * Implementação concreta do repositório de Health
 */
export class HealthRepository extends ApiService implements IHealthRepository {
  /**
   * Verifica o status de saúde do servidor
   */
  async checkHealth(): Promise<Health> {
    const response = await this.get<HealthResponseDTO>('/health');
    return Health.fromRaw(response);
  }
}


