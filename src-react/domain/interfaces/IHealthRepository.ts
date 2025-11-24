import { Health } from '../entities/Health';

/**
 * Interface do repositório de Health
 */
export interface IHealthRepository {
  /**
   * Verifica o status de saúde do servidor
   */
  checkHealth(): Promise<Health>;
}


