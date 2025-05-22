import { Repository } from 'typeorm';
import { Experiment } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult } from '../entities/experiment-result.entity';
export declare class ExperimentAnalysisService {
  private readonly experimentRepository;
  private readonly variantRepository;
  private readonly resultRepository;
  private readonly logger;
  constructor(
    experimentRepository: Repository<Experiment>,
    variantRepository: Repository<ExperimentVariant>,
    resultRepository: Repository<ExperimentResult>,
  );
  calculateStatisticalSignificance(experimentId: string): Promise<any>;
  private calculateZTest;
  private calculatePValue;
  calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    _significanceLevel?: number,
    _power?: number,
  ): number;
  estimateTimeToCompletion(experimentId: string, dailyTraffic: number): Promise<any>;
  getMetricsOverTime(experimentId: string, interval?: 'day' | 'week' | 'month'): Promise<any>;
}
