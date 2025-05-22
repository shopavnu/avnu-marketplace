import { ExperimentService } from './experiment.service';
import { ExperimentAssignmentService } from './experiment-assignment.service';
import { ExperimentAnalysisService } from './experiment-analysis.service';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
import { ExperimentStatus, ExperimentType } from '../entities/experiment.entity';
export declare class AbTestingService {
  private readonly experimentService;
  private readonly assignmentService;
  private readonly analysisService;
  private readonly logger;
  constructor(
    experimentService: ExperimentService,
    assignmentService: ExperimentAssignmentService,
    analysisService: ExperimentAnalysisService,
  );
  createExperiment(
    createExperimentDto: CreateExperimentDto,
  ): Promise<import('../entities/experiment.entity').Experiment>;
  getAllExperiments(
    status?: ExperimentStatus,
  ): Promise<import('../entities/experiment.entity').Experiment[]>;
  getExperimentById(id: string): Promise<import('../entities/experiment.entity').Experiment>;
  updateExperiment(
    id: string,
    updateExperimentDto: UpdateExperimentDto,
  ): Promise<import('../entities/experiment.entity').Experiment>;
  deleteExperiment(id: string): Promise<void>;
  startExperiment(id: string): Promise<import('../entities/experiment.entity').Experiment>;
  pauseExperiment(id: string): Promise<import('../entities/experiment.entity').Experiment>;
  completeExperiment(id: string): Promise<import('../entities/experiment.entity').Experiment>;
  archiveExperiment(id: string): Promise<import('../entities/experiment.entity').Experiment>;
  declareWinner(
    experimentId: string,
    variantId: string,
  ): Promise<import('../entities/experiment.entity').Experiment>;
  getExperimentResults(id: string): Promise<any>;
  getVariantConfiguration(
    experimentType: ExperimentType,
    userId?: string,
    sessionId?: string,
  ): Promise<any>;
  trackImpression(assignmentId: string): Promise<void>;
  trackInteraction(assignmentId: string, context?: string, metadata?: any): Promise<void>;
  trackConversion(
    assignmentId: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void>;
  trackCustomEvent(
    assignmentId: string,
    eventType: string,
    value?: number,
    context?: string,
    metadata?: any,
  ): Promise<void>;
  calculateStatisticalSignificance(experimentId: string): Promise<any>;
  estimateTimeToCompletion(experimentId: string, dailyTraffic: number): Promise<any>;
  getMetricsOverTime(experimentId: string, interval?: 'day' | 'week' | 'month'): Promise<any>;
  calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    significanceLevel?: number,
    power?: number,
  ): number;
  getSearchExperiments(userId?: string, sessionId?: string): Promise<any>;
  getPersonalizationExperiments(userId?: string, sessionId?: string): Promise<any>;
  getRecommendationExperiments(userId?: string, sessionId?: string): Promise<any>;
  getUiExperiments(userId?: string, sessionId?: string): Promise<any>;
  getUserAssignments(
    userId?: string,
    sessionId?: string,
  ): Promise<import('../entities/user-experiment-assignment.entity').UserExperimentAssignment[]>;
}
