/**
 * Entidade de domínio: Record
 */
export class Record {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly uploadedFilesPaths: string[],
    public readonly recordPath: string | null,
    public readonly createdAt: Date,
    public readonly projectId: number
  ) {}

  /**
   * Cria uma instância de Record a partir de dados brutos
   */
  static fromRaw(data: {
    id: number;
    name: string;
    uploadedFilesPaths: string[];
    recordPath?: string | null;
    createdAt: string | Date;
    projectId: number;
  }): Record {
    return new Record(
      data.id,
      data.name,
      data.uploadedFilesPaths,
      data.recordPath ?? null,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      data.projectId
    );
  }

  /**
   * Verifica se o registro tem uma reconstrução 3DGS
   */
  hasReconstruction(): boolean {
    return this.recordPath !== null && this.recordPath.trim() !== '';
  }
}


