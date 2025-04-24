import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experiment } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult, ResultType } from '../entities/experiment-result.entity';

@Injectable()
export class ExperimentAnalysisService {
  private readonly logger = new Logger(ExperimentAnalysisService.name);

  constructor(
    @InjectRepository(Experiment)
    private readonly experimentRepository: Repository<Experiment>,
    @InjectRepository(ExperimentVariant)
    private readonly variantRepository: Repository<ExperimentVariant>,
    @InjectRepository(ExperimentResult)
    private readonly resultRepository: Repository<ExperimentResult>,
  ) {}

  /**
   * Calculate statistical significance for experiment variants
   * @param experimentId Experiment ID
   */
  async calculateStatisticalSignificance(experimentId: string): Promise<any> {
    try {
      const experiment = await this.experimentRepository.findOne({
        where: { id: experimentId },
        relations: ['variants'],
      });

      if (!experiment) {
        throw new Error(`Experiment with ID ${experimentId} not found`);
      }

      // Get control variant
      const controlVariant = experiment.variants.find(v => v.isControl);
      if (!controlVariant) {
        throw new Error('No control variant found for experiment');
      }

      // Get metrics for control variant
      const controlImpressions = await this.resultRepository.count({
        where: {
          variantId: controlVariant.id,
          resultType: ResultType.IMPRESSION,
        },
      });

      const controlConversions = await this.resultRepository.count({
        where: {
          variantId: controlVariant.id,
          resultType: ResultType.CONVERSION,
        },
      });

      const controlConversionRate =
        controlImpressions > 0 ? controlConversions / controlImpressions : 0;

      // Calculate significance for each variant
      const results = await Promise.all(
        experiment.variants
          .filter(v => !v.isControl)
          .map(async variant => {
            // Get metrics for this variant
            const variantImpressions = await this.resultRepository.count({
              where: {
                variantId: variant.id,
                resultType: ResultType.IMPRESSION,
              },
            });

            const variantConversions = await this.resultRepository.count({
              where: {
                variantId: variant.id,
                resultType: ResultType.CONVERSION,
              },
            });

            const variantConversionRate =
              variantImpressions > 0 ? variantConversions / variantImpressions : 0;

            // Calculate improvement
            const improvement =
              controlConversionRate > 0
                ? (variantConversionRate - controlConversionRate) / controlConversionRate
                : 0;

            // Calculate statistical significance using z-test
            const { zScore, pValue, confidenceLevel, significant } = this.calculateZTest(
              controlConversions,
              controlImpressions,
              variantConversions,
              variantImpressions,
            );

            // Update variant with confidence level
            variant.confidenceLevel = confidenceLevel;
            variant.improvementRate = improvement;
            await this.variantRepository.save(variant);

            return {
              variantId: variant.id,
              variantName: variant.name,
              impressions: variantImpressions,
              conversions: variantConversions,
              conversionRate: variantConversionRate,
              improvement,
              zScore,
              pValue,
              confidenceLevel,
              significant,
              isWinner: variant.isWinner,
              isControl: false, // Add isControl property for variants
            };
          }),
      );

      // Add control variant to results
      results.unshift({
        variantId: controlVariant.id,
        variantName: controlVariant.name,
        impressions: controlImpressions,
        conversions: controlConversions,
        conversionRate: controlConversionRate,
        improvement: 0,
        zScore: 0,
        pValue: 1,
        confidenceLevel: 0,
        significant: false,
        isControl: true, // Keep isControl for the control object
        isWinner: controlVariant.isWinner,
      });

      return {
        experimentId: experiment.id,
        experimentName: experiment.name,
        results,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate statistical significance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate z-test for two proportions
   * @param control_conversions Control conversions
   * @param control_impressions Control impressions
   * @param variant_conversions Variant conversions
   * @param variant_impressions Variant impressions
   */
  private calculateZTest(
    control_conversions: number,
    control_impressions: number,
    variant_conversions: number,
    variant_impressions: number,
  ): { zScore: number; pValue: number; confidenceLevel: number; significant: boolean } {
    // Calculate conversion rates
    const p1 = control_conversions / control_impressions;
    const p2 = variant_conversions / variant_impressions;

    // Calculate pooled proportion
    const p =
      (control_conversions + variant_conversions) / (control_impressions + variant_impressions);

    // Calculate standard error
    const se = Math.sqrt(p * (1 - p) * (1 / control_impressions + 1 / variant_impressions));

    // Calculate z-score
    const zScore = (p2 - p1) / se;

    // Calculate p-value (two-tailed test)
    const pValue = this.calculatePValue(zScore);

    // Calculate confidence level
    const confidenceLevel = (1 - pValue) * 100;

    // Determine if result is significant (95% confidence level)
    const significant = confidenceLevel >= 95;

    return {
      zScore,
      pValue,
      confidenceLevel,
      significant,
    };
  }

  /**
   * Calculate p-value from z-score
   * @param z Z-score
   */
  private calculatePValue(z: number): number {
    // Approximation of the error function
    const erf = (x: number): number => {
      const t = 1.0 / (1.0 + 0.5 * Math.abs(x));
      const tau =
        t *
        Math.exp(
          -x * x -
            1.26551223 +
            t *
              (1.00002368 +
                t *
                  (0.37409196 +
                    t *
                      (0.09678418 +
                        t *
                          (-0.18628806 +
                            t *
                              (0.27886807 +
                                t *
                                  (-1.13520398 +
                                    t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
        );
      return x >= 0 ? 1 - tau : tau - 1;
    };

    // Calculate p-value
    return 1 - 0.5 * (1 + erf(Math.abs(z) / Math.sqrt(2)));
  }

  /**
   * Calculate sample size needed for experiment
   * @param baselineConversionRate Baseline conversion rate
   * @param minimumDetectableEffect Minimum detectable effect
   * @param _significanceLevel Significance level (default: 0.05)
   * @param _power Statistical power (default: 0.8)
   */
  calculateRequiredSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    _significanceLevel: number = 0.05,
    _power: number = 0.8,
  ): number {
    // Z-score for significance level (two-tailed)
    const zAlpha = 1.96; // 95% confidence

    // Z-score for power
    const zBeta = 0.84; // 80% power

    // Calculate expected conversion rate for variant
    const variantConversionRate = baselineConversionRate * (1 + minimumDetectableEffect);

    // Calculate pooled standard error
    const p = (baselineConversionRate + variantConversionRate) / 2;
    const se = Math.sqrt(2 * p * (1 - p));

    // Calculate sample size per variant
    const n = Math.pow((zAlpha + zBeta) / (variantConversionRate - baselineConversionRate), 2) * se;

    // Return sample size rounded up
    return Math.ceil(n);
  }

  /**
   * Estimate time to complete experiment
   * @param experimentId Experiment ID
   * @param dailyTraffic Daily traffic (impressions)
   */
  async estimateTimeToCompletion(experimentId: string, dailyTraffic: number): Promise<any> {
    try {
      const experiment = await this.experimentRepository.findOne({
        where: { id: experimentId },
        relations: ['variants'],
      });

      if (!experiment) {
        throw new Error(`Experiment with ID ${experimentId} not found`);
      }

      // Get control variant
      const controlVariant = experiment.variants.find(v => v.isControl);
      if (!controlVariant) {
        throw new Error('No control variant found for experiment');
      }

      // Get current metrics
      const controlImpressions = await this.resultRepository.count({
        where: {
          variantId: controlVariant.id,
          resultType: ResultType.IMPRESSION,
        },
      });

      const controlConversions = await this.resultRepository.count({
        where: {
          variantId: controlVariant.id,
          resultType: ResultType.CONVERSION,
        },
      });

      // Calculate current conversion rate
      const currentConversionRate =
        controlImpressions > 0 ? controlConversions / controlImpressions : 0;

      // Assume we want to detect a 10% improvement with 95% confidence and 80% power
      const minimumDetectableEffect = 0.1;
      const requiredSampleSize = this.calculateRequiredSampleSize(
        currentConversionRate,
        minimumDetectableEffect,
      );

      // Calculate total required sample size for all variants
      const totalRequiredSampleSize = requiredSampleSize * experiment.variants.length;

      // Calculate current total impressions
      const currentTotalImpressions = await Promise.all(
        experiment.variants.map(async variant => {
          return this.resultRepository.count({
            where: {
              variantId: variant.id,
              resultType: ResultType.IMPRESSION,
            },
          });
        }),
      ).then(counts => counts.reduce((sum, count) => sum + count, 0));

      // Calculate remaining impressions needed
      const remainingImpressions = Math.max(0, totalRequiredSampleSize - currentTotalImpressions);

      // Calculate days remaining
      const daysRemaining =
        dailyTraffic > 0 ? Math.ceil(remainingImpressions / dailyTraffic) : Infinity;

      // Calculate estimated completion date
      const estimatedCompletionDate = new Date();
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysRemaining);

      return {
        experimentId: experiment.id,
        experimentName: experiment.name,
        currentTotalImpressions,
        requiredSampleSizePerVariant: requiredSampleSize,
        totalRequiredSampleSize,
        remainingImpressions,
        daysRemaining,
        estimatedCompletionDate,
      };
    } catch (error) {
      this.logger.error(`Failed to estimate time to completion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get experiment metrics over time
   * @param experimentId Experiment ID
   * @param interval Interval (day, week, month)
   */
  async getMetricsOverTime(
    experimentId: string,
    interval: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    try {
      const experiment = await this.experimentRepository.findOne({
        where: { id: experimentId },
        relations: ['variants'],
      });

      if (!experiment) {
        throw new Error(`Experiment with ID ${experimentId} not found`);
      }

      // Determine date format based on interval
      let dateFormat: string;
      switch (interval) {
        case 'week':
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'day':
        default:
          dateFormat = 'YYYY-MM-DD';
          break;
      }

      // Get metrics over time for each variant
      const variantMetrics = await Promise.all(
        experiment.variants.map(async variant => {
          // Get impressions over time
          const impressionsOverTime = await this.resultRepository
            .createQueryBuilder('result')
            .select(`TO_CHAR(result.timestamp, '${dateFormat}')`, 'period')
            .addSelect('COUNT(*)', 'count')
            .where('result.variantId = :variantId', { variantId: variant.id })
            .andWhere('result.resultType = :resultType', { resultType: ResultType.IMPRESSION })
            .groupBy('period')
            .orderBy('period', 'ASC')
            .getRawMany();

          // Get conversions over time
          const conversionsOverTime = await this.resultRepository
            .createQueryBuilder('result')
            .select(`TO_CHAR(result.timestamp, '${dateFormat}')`, 'period')
            .addSelect('COUNT(*)', 'count')
            .where('result.variantId = :variantId', { variantId: variant.id })
            .andWhere('result.resultType = :resultType', { resultType: ResultType.CONVERSION })
            .groupBy('period')
            .orderBy('period', 'ASC')
            .getRawMany();

          // Combine metrics
          const periods = new Set([
            ...impressionsOverTime.map(item => item.period),
            ...conversionsOverTime.map(item => item.period),
          ]);

          const metricsOverTime = Array.from(periods)
            .map(period => {
              const impressions = impressionsOverTime.find(item => item.period === period);
              const conversions = conversionsOverTime.find(item => item.period === period);

              const impressionCount = impressions ? parseInt(impressions.count) : 0;
              const conversionCount = conversions ? parseInt(conversions.count) : 0;
              const conversionRate = impressionCount > 0 ? conversionCount / impressionCount : 0;

              return {
                period,
                impressions: impressionCount,
                conversions: conversionCount,
                conversionRate,
              };
            })
            .sort((a, b) => a.period.localeCompare(b.period));

          return {
            variantId: variant.id,
            variantName: variant.name,
            isControl: variant.isControl,
            metricsOverTime,
          };
        }),
      );

      return {
        experimentId: experiment.id,
        experimentName: experiment.name,
        interval,
        variantMetrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics over time: ${error.message}`);
      throw error;
    }
  }
}
