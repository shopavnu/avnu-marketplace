import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Removed unused imports: Between, LessThan, MoreThan
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchAnalyticsService } from './search-analytics.service';
import { SessionAnalyticsService } from './session-analytics.service';
import { ABTestingService } from '../../search/services/ab-testing.service';
import { AlertEntity } from '../entities/alert.entity';
import { AlertMetricEntity } from '../entities/alert-metric.entity';
import { AlertSeverity, AlertStatus, AlertType } from '../enums/alert.enum';

/**
 * Service for managing personalization alerts
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly thresholds: Record<string, number>;

  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<AlertEntity>,
    @InjectRepository(AlertMetricEntity)
    private readonly alertMetricRepository: Repository<AlertMetricEntity>,
    @Inject(forwardRef(() => SearchAnalyticsService))
    private readonly searchAnalyticsService: SearchAnalyticsService,
    @Inject(forwardRef(() => SessionAnalyticsService))
    private readonly sessionAnalyticsService: SessionAnalyticsService,
    @Inject(forwardRef(() => ABTestingService))
    private readonly abTestingService: ABTestingService,
    private readonly configService: ConfigService,
  ) {
    // Initialize thresholds from config
    this.thresholds = {
      clickThroughRateDrop: this.configService.get<number>('ALERT_THRESHOLD_CTR_DROP', 10),
      conversionRateDrop: this.configService.get<number>('ALERT_THRESHOLD_CONVERSION_DROP', 15),
      dwellTimeDrop: this.configService.get<number>('ALERT_THRESHOLD_DWELL_TIME_DROP', 20),
      sessionCountDrop: this.configService.get<number>('ALERT_THRESHOLD_SESSION_COUNT_DROP', 25),
      abTestSignificance: this.configService.get<number>(
        'ALERT_THRESHOLD_AB_TEST_SIGNIFICANCE',
        95,
      ),
    };
  }

  /**
   * Get alerts with optional filters
   * @param status Alert status filter
   * @param type Alert type filter
   * @param period Period in days
   */
  async getAlerts(status?: AlertStatus, type?: AlertType, period = 30): Promise<AlertEntity[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const queryBuilder = this.alertRepository
        .createQueryBuilder('alert')
        .leftJoinAndSelect('alert.metrics', 'metrics')
        .leftJoinAndSelect('alert.affectedSegments', 'segments')
        .where('alert.createdAt >= :startDate', { startDate })
        .orderBy('alert.createdAt', 'DESC');

      if (status) {
        queryBuilder.andWhere('alert.status = :status', { status });
      }

      if (type) {
        queryBuilder.andWhere('alert.type = :type', { type });
      }

      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Failed to get alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update alert status
   * @param id Alert ID
   * @param status New status
   */
  async updateAlertStatus(id: string, status: AlertStatus): Promise<AlertEntity> {
    try {
      const alert = await this.alertRepository.findOne({
        where: { id },
        relations: ['metrics', 'affectedSegments'],
      });

      if (!alert) {
        throw new Error(`Alert with ID ${id} not found`);
      }

      alert.status = status;
      alert.updatedAt = new Date();

      return this.alertRepository.save(alert);
    } catch (error) {
      this.logger.error(`Failed to update alert status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new alert
   * @param type Alert type
   * @param title Alert title
   * @param description Alert description
   * @param severity Alert severity
   * @param metrics Alert metrics
   * @param affectedSegments Affected user segments
   */
  async createAlert(
    type: AlertType,
    title: string,
    description: string,
    severity: AlertSeverity,
    metrics: Partial<AlertMetricEntity>[],
    affectedSegments?: any[],
  ): Promise<AlertEntity> {
    try {
      // Create alert
      const alert = this.alertRepository.create({
        type,
        title,
        description,
        severity,
        status: AlertStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save alert to get ID
      const savedAlert = await this.alertRepository.save(alert);

      // Create and save metrics
      if (metrics && metrics.length > 0) {
        const alertMetrics = metrics.map(metric => {
          return this.alertMetricRepository.create({
            ...metric,
            alert: savedAlert,
          });
        });

        savedAlert.metrics = await this.alertMetricRepository.save(alertMetrics);
      }

      // Add affected segments if provided
      if (affectedSegments && affectedSegments.length > 0) {
        savedAlert.affectedSegments = affectedSegments;
        await this.alertRepository.save(savedAlert);
      }

      return savedAlert;
    } catch (error) {
      this.logger.error(`Failed to create alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scheduled job to check for personalization drops
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkForPersonalizationDrops() {
    try {
      this.logger.log('Checking for personalization effectiveness drops');

      // Get current and previous period data
      const currentPeriod = 1; // 1 day
      const previousPeriod = 7; // 7 days for comparison

      // Get personalization effectiveness for current period
      const currentPersonalization =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(currentPeriod);

      // Get personalization effectiveness for previous period
      const previousPersonalization =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(previousPeriod);

      // Check for significant drops in click-through rate
      if (
        currentPersonalization?.personalizationEffectiveness?.clickThroughRates &&
        previousPersonalization?.personalizationEffectiveness?.clickThroughRates
      ) {
        const currentCTR =
          currentPersonalization.personalizationEffectiveness.clickThroughRates.personalized
            .clickThroughRate;
        const previousCTR =
          previousPersonalization.personalizationEffectiveness.clickThroughRates.personalized
            .clickThroughRate;

        if (previousCTR > 0) {
          const ctrChangePercentage = ((currentCTR - previousCTR) / previousCTR) * 100;

          // Check if drop exceeds threshold
          if (ctrChangePercentage < -this.thresholds.clickThroughRateDrop) {
            await this.createAlert(
              AlertType.PERSONALIZATION_DROP,
              'Significant drop in personalized click-through rate',
              `The personalized click-through rate has dropped by ${Math.abs(ctrChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              AlertSeverity.HIGH,
              [
                {
                  name: 'Click-Through Rate',
                  value: currentCTR,
                  previousValue: previousCTR,
                  changePercentage: ctrChangePercentage,
                  threshold: -this.thresholds.clickThroughRateDrop,
                },
              ],
            );
          }
        }
      }

      // Check for significant drops in dwell time
      if (
        currentPersonalization?.personalizationEffectiveness?.dwellTimeMetrics &&
        previousPersonalization?.personalizationEffectiveness?.dwellTimeMetrics
      ) {
        const currentDwellTime =
          currentPersonalization.personalizationEffectiveness.dwellTimeMetrics.personalized
            .avgDwellTime;
        const previousDwellTime =
          previousPersonalization.personalizationEffectiveness.dwellTimeMetrics.personalized
            .avgDwellTime;

        if (previousDwellTime > 0) {
          const dwellTimeChangePercentage =
            ((currentDwellTime - previousDwellTime) / previousDwellTime) * 100;

          // Check if drop exceeds threshold
          if (dwellTimeChangePercentage < -this.thresholds.dwellTimeDrop) {
            await this.createAlert(
              AlertType.PERSONALIZATION_DROP,
              'Significant drop in personalized dwell time',
              `The personalized dwell time has dropped by ${Math.abs(dwellTimeChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              AlertSeverity.MEDIUM,
              [
                {
                  name: 'Dwell Time (ms)',
                  value: currentDwellTime,
                  previousValue: previousDwellTime,
                  changePercentage: dwellTimeChangePercentage,
                  threshold: -this.thresholds.dwellTimeDrop,
                },
              ],
            );
          }
        }
      }

      // Check for significant drops in session count
      if (currentPersonalization?.totalSessions && previousPersonalization?.totalSessions) {
        const currentSessionCount = currentPersonalization.totalSessions;
        const previousSessionCount = previousPersonalization.totalSessions / 7; // Daily average from 7 days

        if (previousSessionCount > 0) {
          const sessionCountChangePercentage =
            ((currentSessionCount - previousSessionCount) / previousSessionCount) * 100;

          // Check if drop exceeds threshold
          if (sessionCountChangePercentage < -this.thresholds.sessionCountDrop) {
            await this.createAlert(
              AlertType.UNUSUAL_PATTERN,
              'Unusual drop in session count',
              `The number of sessions has dropped by ${Math.abs(sessionCountChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              AlertSeverity.MEDIUM,
              [
                {
                  name: 'Session Count',
                  value: currentSessionCount,
                  previousValue: previousSessionCount,
                  changePercentage: sessionCountChangePercentage,
                  threshold: -this.thresholds.sessionCountDrop,
                },
              ],
            );
          }
        }
      }

      this.logger.log('Completed checking for personalization effectiveness drops');
    } catch (error) {
      this.logger.error(`Failed to check for personalization drops: ${error.message}`);
    }
  }

  /**
   * Scheduled job to check for A/B test results
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkForABTestResults() {
    try {
      this.logger.log('Checking for significant A/B test results');

      // Get active A/B tests
      const activeTests = await this.abTestingService.getActiveTests();

      // Check each test for significant results
      for (const test of activeTests) {
        // Get test metrics
        const testMetrics = await this.abTestingService.getTestMetrics(test.id);

        // Skip tests with insufficient data
        if (!testMetrics || testMetrics.length < 2) {
          continue;
        }

        // Sort metrics by CTR and conversion rate
        const sortedByCTR = [...testMetrics].sort(
          (a, b) => b.clickThroughRate - a.clickThroughRate,
        );
        const sortedByConversion = [...testMetrics].sort(
          (a, b) => b.conversionRate - a.conversionRate,
        );

        // Check if the same variant is winning in both metrics
        if (sortedByCTR[0].variant.id === sortedByConversion[0].variant.id) {
          const winner = sortedByCTR[0];
          const runnerUp = sortedByCTR[1];

          // Check if the difference is significant
          const ctrImprovement =
            (winner.clickThroughRate - runnerUp.clickThroughRate) / runnerUp.clickThroughRate;
          const conversionImprovement =
            (winner.conversionRate - runnerUp.conversionRate) / runnerUp.conversionRate;

          if (ctrImprovement > 0.1 && conversionImprovement > 0.1) {
            await this.createAlert(
              AlertType.AB_TEST_RESULT,
              `A/B Test "${test.name}" has a clear winner`,
              `Variant "${winner.variant.name}" is outperforming other variants with ${(ctrImprovement * 100).toFixed(2)}% higher CTR and ${(conversionImprovement * 100).toFixed(2)}% higher conversion rate.`,
              AlertSeverity.LOW,
              [
                {
                  name: 'Click-Through Rate Improvement',
                  value: winner.clickThroughRate,
                  previousValue: runnerUp.clickThroughRate,
                  changePercentage: ctrImprovement * 100,
                  threshold: 10, // 10% improvement threshold
                },
                {
                  name: 'Conversion Rate Improvement',
                  value: winner.conversionRate,
                  previousValue: runnerUp.conversionRate,
                  changePercentage: conversionImprovement * 100,
                  threshold: 10, // 10% improvement threshold
                },
              ],
            );
          }
        }
      }

      this.logger.log('Completed checking for A/B test results');
    } catch (error) {
      this.logger.error(`Failed to check for A/B test results: ${error.message}`);
    }
  }
}
