"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ExperimentAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const experiment_entity_1 = require("../entities/experiment.entity");
const experiment_variant_entity_1 = require("../entities/experiment-variant.entity");
const experiment_result_entity_1 = require("../entities/experiment-result.entity");
let ExperimentAnalysisService = ExperimentAnalysisService_1 = class ExperimentAnalysisService {
    constructor(experimentRepository, variantRepository, resultRepository) {
        this.experimentRepository = experimentRepository;
        this.variantRepository = variantRepository;
        this.resultRepository = resultRepository;
        this.logger = new common_1.Logger(ExperimentAnalysisService_1.name);
    }
    async calculateStatisticalSignificance(experimentId) {
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: experimentId },
                relations: ['variants'],
            });
            if (!experiment) {
                throw new Error(`Experiment with ID ${experimentId} not found`);
            }
            const controlVariant = experiment.variants.find(v => v.isControl);
            if (!controlVariant) {
                throw new Error('No control variant found for experiment');
            }
            const controlImpressions = await this.resultRepository.count({
                where: {
                    variantId: controlVariant.id,
                    resultType: experiment_result_entity_1.ResultType.IMPRESSION,
                },
            });
            const controlConversions = await this.resultRepository.count({
                where: {
                    variantId: controlVariant.id,
                    resultType: experiment_result_entity_1.ResultType.CONVERSION,
                },
            });
            const controlConversionRate = controlImpressions > 0 ? controlConversions / controlImpressions : 0;
            const results = await Promise.all(experiment.variants
                .filter(v => !v.isControl)
                .map(async (variant) => {
                const variantImpressions = await this.resultRepository.count({
                    where: {
                        variantId: variant.id,
                        resultType: experiment_result_entity_1.ResultType.IMPRESSION,
                    },
                });
                const variantConversions = await this.resultRepository.count({
                    where: {
                        variantId: variant.id,
                        resultType: experiment_result_entity_1.ResultType.CONVERSION,
                    },
                });
                const variantConversionRate = variantImpressions > 0 ? variantConversions / variantImpressions : 0;
                const improvement = controlConversionRate > 0
                    ? (variantConversionRate - controlConversionRate) / controlConversionRate
                    : 0;
                const { zScore, pValue, confidenceLevel, significant } = this.calculateZTest(controlConversions, controlImpressions, variantConversions, variantImpressions);
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
                    isControl: false,
                };
            }));
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
                isControl: true,
                isWinner: controlVariant.isWinner,
            });
            return {
                experimentId: experiment.id,
                experimentName: experiment.name,
                results,
            };
        }
        catch (error) {
            this.logger.error(`Failed to calculate statistical significance: ${error.message}`);
            throw error;
        }
    }
    calculateZTest(control_conversions, control_impressions, variant_conversions, variant_impressions) {
        const p1 = control_conversions / control_impressions;
        const p2 = variant_conversions / variant_impressions;
        const p = (control_conversions + variant_conversions) / (control_impressions + variant_impressions);
        const se = Math.sqrt(p * (1 - p) * (1 / control_impressions + 1 / variant_impressions));
        const zScore = (p2 - p1) / se;
        const pValue = this.calculatePValue(zScore);
        const confidenceLevel = (1 - pValue) * 100;
        const significant = confidenceLevel >= 95;
        return {
            zScore,
            pValue,
            confidenceLevel,
            significant,
        };
    }
    calculatePValue(z) {
        const erf = (x) => {
            const t = 1.0 / (1.0 + 0.5 * Math.abs(x));
            const tau = t *
                Math.exp(-x * x -
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
                                                                    t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
            return x >= 0 ? 1 - tau : tau - 1;
        };
        return 1 - 0.5 * (1 + erf(Math.abs(z) / Math.sqrt(2)));
    }
    calculateRequiredSampleSize(baselineConversionRate, minimumDetectableEffect, _significanceLevel = 0.05, _power = 0.8) {
        const zAlpha = 1.96;
        const zBeta = 0.84;
        const variantConversionRate = baselineConversionRate * (1 + minimumDetectableEffect);
        const p = (baselineConversionRate + variantConversionRate) / 2;
        const se = Math.sqrt(2 * p * (1 - p));
        const n = Math.pow((zAlpha + zBeta) / (variantConversionRate - baselineConversionRate), 2) * se;
        return Math.ceil(n);
    }
    async estimateTimeToCompletion(experimentId, dailyTraffic) {
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: experimentId },
                relations: ['variants'],
            });
            if (!experiment) {
                throw new Error(`Experiment with ID ${experimentId} not found`);
            }
            const controlVariant = experiment.variants.find(v => v.isControl);
            if (!controlVariant) {
                throw new Error('No control variant found for experiment');
            }
            const controlImpressions = await this.resultRepository.count({
                where: {
                    variantId: controlVariant.id,
                    resultType: experiment_result_entity_1.ResultType.IMPRESSION,
                },
            });
            const controlConversions = await this.resultRepository.count({
                where: {
                    variantId: controlVariant.id,
                    resultType: experiment_result_entity_1.ResultType.CONVERSION,
                },
            });
            const currentConversionRate = controlImpressions > 0 ? controlConversions / controlImpressions : 0;
            const minimumDetectableEffect = 0.1;
            const requiredSampleSize = this.calculateRequiredSampleSize(currentConversionRate, minimumDetectableEffect);
            const totalRequiredSampleSize = requiredSampleSize * experiment.variants.length;
            const currentTotalImpressions = await Promise.all(experiment.variants.map(async (variant) => {
                return this.resultRepository.count({
                    where: {
                        variantId: variant.id,
                        resultType: experiment_result_entity_1.ResultType.IMPRESSION,
                    },
                });
            })).then(counts => counts.reduce((sum, count) => sum + count, 0));
            const remainingImpressions = Math.max(0, totalRequiredSampleSize - currentTotalImpressions);
            const daysRemaining = dailyTraffic > 0 ? Math.ceil(remainingImpressions / dailyTraffic) : Infinity;
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
        }
        catch (error) {
            this.logger.error(`Failed to estimate time to completion: ${error.message}`);
            throw error;
        }
    }
    async getMetricsOverTime(experimentId, interval = 'day') {
        try {
            const experiment = await this.experimentRepository.findOne({
                where: { id: experimentId },
                relations: ['variants'],
            });
            if (!experiment) {
                throw new Error(`Experiment with ID ${experimentId} not found`);
            }
            let dateFormat;
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
            const variantMetrics = await Promise.all(experiment.variants.map(async (variant) => {
                const impressionsOverTime = await this.resultRepository
                    .createQueryBuilder('result')
                    .select(`TO_CHAR(result.timestamp, '${dateFormat}')`, 'period')
                    .addSelect('COUNT(*)', 'count')
                    .where('result.variantId = :variantId', { variantId: variant.id })
                    .andWhere('result.resultType = :resultType', { resultType: experiment_result_entity_1.ResultType.IMPRESSION })
                    .groupBy('period')
                    .orderBy('period', 'ASC')
                    .getRawMany();
                const conversionsOverTime = await this.resultRepository
                    .createQueryBuilder('result')
                    .select(`TO_CHAR(result.timestamp, '${dateFormat}')`, 'period')
                    .addSelect('COUNT(*)', 'count')
                    .where('result.variantId = :variantId', { variantId: variant.id })
                    .andWhere('result.resultType = :resultType', { resultType: experiment_result_entity_1.ResultType.CONVERSION })
                    .groupBy('period')
                    .orderBy('period', 'ASC')
                    .getRawMany();
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
            }));
            return {
                experimentId: experiment.id,
                experimentName: experiment.name,
                interval,
                variantMetrics,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get metrics over time: ${error.message}`);
            throw error;
        }
    }
};
exports.ExperimentAnalysisService = ExperimentAnalysisService;
exports.ExperimentAnalysisService = ExperimentAnalysisService = ExperimentAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(experiment_entity_1.Experiment)),
    __param(1, (0, typeorm_1.InjectRepository)(experiment_variant_entity_1.ExperimentVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(experiment_result_entity_1.ExperimentResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExperimentAnalysisService);
//# sourceMappingURL=experiment-analysis.service.js.map