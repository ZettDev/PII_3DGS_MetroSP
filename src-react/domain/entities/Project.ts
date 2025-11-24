/**
 * Entidade de domínio: Project
 */
export class Project {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly bimPath: string,
    public readonly createdAt: Date
  ) {}

  /**
   * Cria uma instância de Project a partir de dados brutos
   */
  static fromRaw(data: {
    id: number;
    name: string;
    description?: string | null;
    bimPath: string;
    createdAt: string | Date;
  }): Project {
    return new Project(
      data.id,
      data.name,
      data.description ?? null,
      data.bimPath,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt
    );
  }
}


