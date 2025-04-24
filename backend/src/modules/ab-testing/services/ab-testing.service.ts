import { Injectable, Logger } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentAssignmentService } from './experiment-assignment.service';
import { ExperimentAnalysisService } from './experiment-analysis.service';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
import { ExperimentStatus, ExperimentType } from '../entities/experiment.entity';

@Injectable()
export class AbTestingService {
  private readonly logger = new Logger(AbTestingService.name);

  constructor(
    private readonly experimentService: ExperimentService,
    private readonly assignmentService: ExperimentAssignmentService,
    private readonly analysisService: ExperimentAnalysisService,
  ) {}

  /**
   * Create a new experiment
   * @param createExperimentDto Experiment data
   */
  async createExperiment(createExperimentDto: CreateExperimentDto) {
    return this.experimentService.create(createExperimentDto);
  }

  /**
   * Get all experiments
   * @param status Optional status filter
   */
  async getAllExperiments(status?: ExperimentStatus) {
    return this.experimentService.findAll(status);
  }

  /**
   * Get experiment by ID
   * @param id Experiment ID
   */
  async getExperimentById(id: string) {
    return this.experimentService.findOne(id);
  }

  /**
   * Update experiment
   * @param id Experiment ID
   * @param updateExperimentDto Updated experiment data
   */
  async updateExperiment(id: string, updateExperimentDto: UpdateExperimentDto) {
    return this.experimentService.update(id, updateExperimentDto);
  }

  /**
   * Delete experiment
   * @param id Experiment ID
   */
  async deleteExperiment(id: string) {
    return this.experimentService.remove(id);
  }

  /**
   * Start experiment
   * @param id Experiment ID
   */
  async startExperiment(id: string) {
    return this.experimentService.startExperiment(id);
  }

  /**
   * Pause experiment
   * @param id Experiment ID
   */
  async pauseExperiment(id: string) {
    return this.experimentService.pauseExperiment(id);
  }

  /**
   * Complete experiment
   * @param id Experiment ID
   */
  async completeExperiment(id: string) {
    return this.experimentService.completeExperiment(id);
  }

  /**
   * Archive experiment
   * @param id Experiment ID
   */
  async archiveExperiment(id: string) {
    return this.experimentService.archiveExperiment(id);
  }

  /**
   * Declare winner for experiment
   * @param experimentId Experiment ID
   * @param variantId Winning variant ID
   */
  async declareWinner(experimentId: string, variantId: string) {
    return this.experimentService.declareWinner(experimentId, variantId);
  }

  /**
   * Get experiment results
   * @param id Experiment ID
   */
  async getExperimentResults(id: string) {
    return this.experimentService.getExperimentResults(id);
  }

  /**
   * Get variant configuration for a user/session
   * @param experimentType Experiment type
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getVariantConfiguration(
    experimentType: ExperimentType,
    userId?: string,
    sessionId?: string,
  ) {
    return this.assignmentService.getVariantConfiguration(experimentType, userId, sessionId);
  }

  /**
   * Track impression
   * @param assignmentId Assignment ID
   */
  async trackImpression(assignmentId: string) {
    return this.assignmentService.trackImpression(assignmentId);
  }

  /**
   * Track interaction
   * @param assignmentId Assignment ID
   * @param context Context of the interaction
   * @param metadata Additional metadata
   */
  async trackInteraction(assignmentId: string, context?: string, metadata?: any) {
    return this.assignmentService.trackInteraction(assignmentId, context, metadata);
  }

  /**
   * Track conversion
   * @param assignmentId Assignment ID
   * @param value Value of the conversion
   * @param context Context of the conversion
   * @param metadata Additional metadata
   */
  async trackConversion(assignmentId: string, value?: number, context?: string, metadata?: any) {
    return this.assignmentService.trackConversion(assignmentId, value, context, metadata);
  }

  /**
   * Track custom event
   * @param assignmentId Assignment ID
   * @param eventType Event type
   * @param value Value of the event
   * @param context Context of the event
   * @param metadata Additional metadata
   */
  async trackCustomEvent(
    assignmentId: string,
    eventType: string,
    value?: number,
    context?: string,
    metadata?: any,
  ) {
    return this.assignmentService.trackCustomEvent(
      assignmentId,
      eventType,
      value,
      context,
      metadata,
    );
  }

  /**
   * Calculate statistical significance for experiment
   * @param experimentId Experiment ID
   */
  async calculateStatisticalSignificance(experimentId: string) {
    return this.analysisService.calculateStatisticalSignificance(experimentId);
  }

  /**
   * Estimate time to complete experiment
   * @param experimentId Experiment ID
   * @param dailyTraffic Daily traffic (impressions)
   */
  async estimateTimeToCompletion(experimentId: string, dailyTraffic: number) {
    return this.analysisService.estimateTimeToCompletion(experimentId, dailyTraffic);
  }

  /**
   * Get metrics over time
   * @param experimentId Experiment ID
   * @param interval Interval (day, week, month)
   */
  async getMetricsOverTime(experimentId: string, interval: 'day' | 'week' | 'month' = 'day') {
    return this.analysisService.getMetricsOverTime(experimentId, interval);
  }

  /**
   * Calculate required sample size for experiment
   * @param baselineConversionRate Baseline conversion rate
   * @param minimumDetectableEffect Minimum detectable effect
   * @param significanceLevel Significance level
   * @param power Statistical power
   */
  calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    significanceLevel: number = 0.05,
    power: number = 0.8,
  ) {
    return this.analysisService.calculateRequiredSampleSize(
      baselineConversionRate,
      minimumDetectableEffect,
      significanceLevel,
      power,
    );
  }

  /**
   * Get active experiments for search
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getSearchExperiments(userId?: string, sessionId?: string) {
    return this.assignmentService.getVariantConfiguration(
      ExperimentType.SEARCH_ALGORITHM,
      userId,
      sessionId,
    );
  }

  /**
   * Get active experiments for personalization
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getPersonalizationExperiments(userId?: string, sessionId?: string) {
    return this.assignmentService.getVariantConfiguration(
      ExperimentType.PERSONALIZATION,
      userId,
      sessionId,
    );
  }

  /**
   * Get active experiments for recommendations
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getRecommendationExperiments(userId?: string, sessionId?: string) {
    return this.assignmentService.getVariantConfiguration(
      ExperimentType.RECOMMENDATION,
      userId,
      sessionId,
    );
  }

  /**
   * Get active experiments for UI components
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getUiExperiments(userId?: string, sessionId?: string) {
    return this.assignmentService.getVariantConfiguration(
      ExperimentType.UI_COMPONENT,
      userId,
      sessionId,
    );
  }

  /**
   * Get all user assignments
   * @param userId User ID (optional)
   * @param sessionId Session ID (required if userId is not provided)
   */
  async getUserAssignments(userId?: string, sessionId?: string) {
    return this.assignmentService.getUserAssignments(userId, sessionId);
  }
}
