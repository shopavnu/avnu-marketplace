import { AbTestingService } from '../services/ab-testing.service';
import { Experiment } from '../entities/experiment.entity';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
export declare class ExperimentResolver {
  private readonly abTestingService;
  constructor(abTestingService: AbTestingService);
  createExperiment(createExperimentDto: CreateExperimentDto): Promise<Experiment>;
  findAll(status?: string): Promise<Experiment[]>;
  findOne(id: string): Promise<Experiment>;
  updateExperiment(id: string, updateExperimentDto: UpdateExperimentDto): Promise<Experiment>;
  removeExperiment(id: string): boolean;
  startExperiment(id: string): Promise<Experiment>;
  pauseExperiment(id: string): Promise<Experiment>;
  completeExperiment(id: string): Promise<Experiment>;
  archiveExperiment(id: string): Promise<Experiment>;
  declareWinner(experimentId: string, variantId: string): Promise<Experiment>;
  getExperimentResults(id: string): Promise<any>;
  getStatisticalSignificance(id: string): Promise<any>;
  getTimeToCompletion(id: string, dailyTraffic: number): Promise<any>;
  getMetricsOverTime(id: string, interval?: 'day' | 'week' | 'month'): Promise<any>;
  getRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    significanceLevel?: number,
    power?: number,
  ): number;
}
