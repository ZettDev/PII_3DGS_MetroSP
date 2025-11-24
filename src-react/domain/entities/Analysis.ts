import { AnalysisStatus } from '../../shared/types/common';

/**
 * Entidade de domínio: Analysis
 */
export class Analysis {
  constructor(
    public readonly id: number,
    public readonly projectId: number,
    public readonly recordId: number,
    public readonly status: AnalysisStatus,
    public readonly progress: number,
    public readonly logs: string[],
    public readonly error: string | null,
    public readonly outputPaths: AnalysisOutputPaths | null,
    public readonly createdAt: Date,
    public readonly startedAt: Date | null,
    public readonly updatedAt: Date,
    public readonly completedAt: Date | null,
    public readonly resultPath: string | null,
    public readonly summaryJsonPath: string | null,
    public readonly meanDistance: number | null,
    public readonly stdDeviation: number | null
  ) {}

  /**
   * Cria uma instância de Analysis a partir de dados brutos
   */
  static fromRaw(data: {
    id: number;
    project_id: number;
    record_id: number;
    status: AnalysisStatus;
    progress: number;
    logs: string[];
    error?: string | null;
    output_paths?: AnalysisOutputPaths | null;
    created_at: string | Date;
    started_at?: string | Date | null;
    updated_at: string | Date;
    completed_at?: string | Date | null;
    result_path?: string | null;
    summary_json_path?: string | null;
    mean_distance?: number | null;
    std_deviation?: number | null;
  }): Analysis {
    return new Analysis(
      data.id,
      data.project_id,
      data.record_id,
      data.status,
      data.progress,
      data.logs,
      data.error ?? null,
      data.output_paths ?? null,
      typeof data.created_at === 'string' ? new Date(data.created_at) : data.created_at,
      data.started_at
        ? typeof data.started_at === 'string'
          ? new Date(data.started_at)
          : data.started_at
        : null,
      typeof data.updated_at === 'string' ? new Date(data.updated_at) : data.updated_at,
      data.completed_at
        ? typeof data.completed_at === 'string'
          ? new Date(data.completed_at)
          : data.completed_at
        : null,
      data.result_path ?? null,
      data.summary_json_path ?? null,
      data.mean_distance ?? null,
      data.std_deviation ?? null
    );
  }

  /**
   * Verifica se a análise está concluída
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Verifica se a análise falhou
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Verifica se a análise está em processamento
   */
  isProcessing(): boolean {
    return this.status === 'processing';
  }

  /**
   * Verifica se a análise está pendente
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Verifica se a análise pode ser cancelada
   */
  canBeCancelled(): boolean {
    return this.status === 'pending' || this.status === 'processing';
  }
}

/**
 * Estrutura de caminhos de saída da análise
 */
export interface AnalysisOutputPaths {
  modelo3d?: string;
  comparacaoBim?: string;
  relatorio?: string;
}


