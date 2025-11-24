import { IHealthRepository } from '../../domain/interfaces/IHealthRepository';
import { Health } from '../../domain/entities/Health';

/**
 * Use Case: Verificar status de saúde do servidor
 */
export class CheckHealthUseCase {
  constructor(private healthRepository: IHealthRepository) {}

  async execute(): Promise<Health> {
    return this.healthRepository.checkHealth();
  }
}


