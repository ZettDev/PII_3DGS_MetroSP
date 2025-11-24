/**
 * Entidade de domínio: Health
 */
export class Health {
  constructor(
    public readonly status: string,
    public readonly timestamp: Date
  ) {}

  /**
   * Cria uma instância de Health a partir de dados brutos
   */
  static fromRaw(data: { status: string; timestamp: string | Date }): Health {
    return new Health(
      data.status,
      typeof data.timestamp === 'string' ? new Date(data.timestamp) : data.timestamp
    );
  }

  /**
   * Verifica se o sistema está saudável
   */
  isHealthy(): boolean {
    return this.status === 'ok';
  }
}


