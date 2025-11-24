import { HttpClient } from '../services/HttpClient';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { RecordRepository } from '../repositories/RecordRepository';
import { AnalysisRepository } from '../repositories/AnalysisRepository';
import { HealthRepository } from '../repositories/HealthRepository';

// Projects Use Cases
import { CreateProjectUseCase } from '../../usecases/projects/CreateProjectUseCase';
import { GetProjectUseCase } from '../../usecases/projects/GetProjectUseCase';
import { ListProjectsUseCase } from '../../usecases/projects/ListProjectsUseCase';

// Records Use Cases
import { CreateRecordUseCase } from '../../usecases/records/CreateRecordUseCase';
import { ListRecordsUseCase } from '../../usecases/records/ListRecordsUseCase';

// Analyses Use Cases
import { CreateAnalysisUseCase } from '../../usecases/analyses/CreateAnalysisUseCase';
import { GetAnalysisUseCase } from '../../usecases/analyses/GetAnalysisUseCase';
import { ListAnalysesUseCase } from '../../usecases/analyses/ListAnalysesUseCase';
import { ListProjectAnalysesUseCase } from '../../usecases/analyses/ListProjectAnalysesUseCase';
import { CancelAnalysisUseCase } from '../../usecases/analyses/CancelAnalysisUseCase';
import { PhotoProcessingFullUseCase } from '../../usecases/analyses/PhotoProcessingFullUseCase';
import { AnalysisFullUseCase } from '../../usecases/analyses/AnalysisFullUseCase';
import { DownloadFileUseCase } from '../../usecases/analyses/DownloadFileUseCase';

// Health Use Cases
import { CheckHealthUseCase } from '../../usecases/health/CheckHealthUseCase';

/**
 * Factory para criar instâncias de Use Cases com suas dependências
 */
export class UseCaseFactory {
  private httpClient: HttpClient;
  private projectRepository: ProjectRepository;
  private recordRepository: RecordRepository;
  private analysisRepository: AnalysisRepository;
  private healthRepository: HealthRepository;

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient(baseURL);
    this.projectRepository = new ProjectRepository(this.httpClient);
    this.recordRepository = new RecordRepository(this.httpClient);
    this.analysisRepository = new AnalysisRepository(this.httpClient);
    this.healthRepository = new HealthRepository(this.httpClient);
  }

  // Projects
  createCreateProjectUseCase(): CreateProjectUseCase {
    return new CreateProjectUseCase(this.projectRepository);
  }

  createGetProjectUseCase(): GetProjectUseCase {
    return new GetProjectUseCase(this.projectRepository);
  }

  createListProjectsUseCase(): ListProjectsUseCase {
    return new ListProjectsUseCase(this.projectRepository);
  }

  // Records
  createCreateRecordUseCase(): CreateRecordUseCase {
    return new CreateRecordUseCase(this.recordRepository);
  }

  createListRecordsUseCase(): ListRecordsUseCase {
    return new ListRecordsUseCase(this.recordRepository);
  }

  // Analyses
  createCreateAnalysisUseCase(): CreateAnalysisUseCase {
    return new CreateAnalysisUseCase(this.analysisRepository);
  }

  createGetAnalysisUseCase(): GetAnalysisUseCase {
    return new GetAnalysisUseCase(this.analysisRepository);
  }

  createListAnalysesUseCase(): ListAnalysesUseCase {
    return new ListAnalysesUseCase(this.analysisRepository);
  }

  createListProjectAnalysesUseCase(): ListProjectAnalysesUseCase {
    return new ListProjectAnalysesUseCase(this.analysisRepository);
  }

  createCancelAnalysisUseCase(): CancelAnalysisUseCase {
    return new CancelAnalysisUseCase(this.analysisRepository);
  }

  createPhotoProcessingFullUseCase(): PhotoProcessingFullUseCase {
    return new PhotoProcessingFullUseCase(this.analysisRepository);
  }

  createAnalysisFullUseCase(): AnalysisFullUseCase {
    return new AnalysisFullUseCase(this.analysisRepository);
  }

  createDownloadFileUseCase(): DownloadFileUseCase {
    return new DownloadFileUseCase(this.analysisRepository);
  }

  // Health
  createCheckHealthUseCase(): CheckHealthUseCase {
    return new CheckHealthUseCase(this.healthRepository);
  }
}


