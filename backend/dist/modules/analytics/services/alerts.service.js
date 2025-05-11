'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var AlertsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AlertsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const config_1 = require('@nestjs/config');
const schedule_1 = require('@nestjs/schedule');
const search_analytics_service_1 = require('./search-analytics.service');
const session_analytics_service_1 = require('./session-analytics.service');
const ab_testing_service_1 = require('../../search/services/ab-testing.service');
const alert_entity_1 = require('../entities/alert.entity');
const alert_metric_entity_1 = require('../entities/alert-metric.entity');
const alert_enum_1 = require('../enums/alert.enum');
let AlertsService = (AlertsService_1 = class AlertsService {
  constructor(
    alertRepository,
    alertMetricRepository,
    searchAnalyticsService,
    sessionAnalyticsService,
    abTestingService,
    configService,
  ) {
    this.alertRepository = alertRepository;
    this.alertMetricRepository = alertMetricRepository;
    this.searchAnalyticsService = searchAnalyticsService;
    this.sessionAnalyticsService = sessionAnalyticsService;
    this.abTestingService = abTestingService;
    this.configService = configService;
    this.logger = new common_1.Logger(AlertsService_1.name);
    this.thresholds = {
      clickThroughRateDrop: this.configService.get('ALERT_THRESHOLD_CTR_DROP', 10),
      conversionRateDrop: this.configService.get('ALERT_THRESHOLD_CONVERSION_DROP', 15),
      dwellTimeDrop: this.configService.get('ALERT_THRESHOLD_DWELL_TIME_DROP', 20),
      sessionCountDrop: this.configService.get('ALERT_THRESHOLD_SESSION_COUNT_DROP', 25),
      abTestSignificance: this.configService.get('ALERT_THRESHOLD_AB_TEST_SIGNIFICANCE', 95),
    };
  }
  async getAlerts(status, type, period = 30) {
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
  async updateAlertStatus(id, status) {
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
  async createAlert(type, title, description, severity, metrics, affectedSegments) {
    try {
      const alert = this.alertRepository.create({
        type,
        title,
        description,
        severity,
        status: alert_enum_1.AlertStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedAlert = await this.alertRepository.save(alert);
      if (metrics && metrics.length > 0) {
        const alertMetrics = metrics.map(metric => {
          return this.alertMetricRepository.create({
            ...metric,
            alert: savedAlert,
          });
        });
        savedAlert.metrics = await this.alertMetricRepository.save(alertMetrics);
      }
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
  async checkForPersonalizationDrops() {
    try {
      this.logger.log('Checking for personalization effectiveness drops');
      const currentPeriod = 1;
      const previousPeriod = 7;
      const currentPersonalization =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(currentPeriod);
      const previousPersonalization =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(previousPeriod);
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
          if (ctrChangePercentage < -this.thresholds.clickThroughRateDrop) {
            await this.createAlert(
              alert_enum_1.AlertType.PERSONALIZATION_DROP,
              'Significant drop in personalized click-through rate',
              `The personalized click-through rate has dropped by ${Math.abs(ctrChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              alert_enum_1.AlertSeverity.HIGH,
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
          if (dwellTimeChangePercentage < -this.thresholds.dwellTimeDrop) {
            await this.createAlert(
              alert_enum_1.AlertType.PERSONALIZATION_DROP,
              'Significant drop in personalized dwell time',
              `The personalized dwell time has dropped by ${Math.abs(dwellTimeChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              alert_enum_1.AlertSeverity.MEDIUM,
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
      if (currentPersonalization?.totalSessions && previousPersonalization?.totalSessions) {
        const currentSessionCount = currentPersonalization.totalSessions;
        const previousSessionCount = previousPersonalization.totalSessions / 7;
        if (previousSessionCount > 0) {
          const sessionCountChangePercentage =
            ((currentSessionCount - previousSessionCount) / previousSessionCount) * 100;
          if (sessionCountChangePercentage < -this.thresholds.sessionCountDrop) {
            await this.createAlert(
              alert_enum_1.AlertType.UNUSUAL_PATTERN,
              'Unusual drop in session count',
              `The number of sessions has dropped by ${Math.abs(sessionCountChangePercentage).toFixed(2)}% in the last 24 hours compared to the 7-day average.`,
              alert_enum_1.AlertSeverity.MEDIUM,
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
  async checkForABTestResults() {
    try {
      this.logger.log('Checking for significant A/B test results');
      const activeTests = await this.abTestingService.getActiveTests();
      for (const test of activeTests) {
        const testMetrics = await this.abTestingService.getTestMetrics(test.id);
        if (!testMetrics || testMetrics.length < 2) {
          continue;
        }
        const sortedByCTR = [...testMetrics].sort(
          (a, b) => b.clickThroughRate - a.clickThroughRate,
        );
        const sortedByConversion = [...testMetrics].sort(
          (a, b) => b.conversionRate - a.conversionRate,
        );
        if (sortedByCTR[0].variant.id === sortedByConversion[0].variant.id) {
          const winner = sortedByCTR[0];
          const runnerUp = sortedByCTR[1];
          const ctrImprovement =
            (winner.clickThroughRate - runnerUp.clickThroughRate) / runnerUp.clickThroughRate;
          const conversionImprovement =
            (winner.conversionRate - runnerUp.conversionRate) / runnerUp.conversionRate;
          if (ctrImprovement > 0.1 && conversionImprovement > 0.1) {
            await this.createAlert(
              alert_enum_1.AlertType.AB_TEST_RESULT,
              `A/B Test "${test.name}" has a clear winner`,
              `Variant "${winner.variant.name}" is outperforming other variants with ${(ctrImprovement * 100).toFixed(2)}% higher CTR and ${(conversionImprovement * 100).toFixed(2)}% higher conversion rate.`,
              alert_enum_1.AlertSeverity.LOW,
              [
                {
                  name: 'Click-Through Rate Improvement',
                  value: winner.clickThroughRate,
                  previousValue: runnerUp.clickThroughRate,
                  changePercentage: ctrImprovement * 100,
                  threshold: 10,
                },
                {
                  name: 'Conversion Rate Improvement',
                  value: winner.conversionRate,
                  previousValue: runnerUp.conversionRate,
                  changePercentage: conversionImprovement * 100,
                  threshold: 10,
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
});
exports.AlertsService = AlertsService;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AlertsService.prototype,
  'checkForPersonalizationDrops',
  null,
);
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AlertsService.prototype,
  'checkForABTestResults',
  null,
);
exports.AlertsService =
  AlertsService =
  AlertsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(alert_entity_1.AlertEntity)),
        __param(1, (0, typeorm_1.InjectRepository)(alert_metric_entity_1.AlertMetricEntity)),
        __param(
          2,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => search_analytics_service_1.SearchAnalyticsService),
          ),
        ),
        __param(
          3,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => session_analytics_service_1.SessionAnalyticsService),
          ),
        ),
        __param(
          4,
          (0, common_1.Inject)(
            (0, common_1.forwardRef)(() => ab_testing_service_1.ABTestingService),
          ),
        ),
        __metadata('design:paramtypes', [
          typeorm_2.Repository,
          typeorm_2.Repository,
          search_analytics_service_1.SearchAnalyticsService,
          session_analytics_service_1.SessionAnalyticsService,
          ab_testing_service_1.ABTestingService,
          config_1.ConfigService,
        ]),
      ],
      AlertsService,
    );
//# sourceMappingURL=alerts.service.js.map
