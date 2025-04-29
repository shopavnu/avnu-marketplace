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
var SessionAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../../personalization/entities/session.entity");
const session_interaction_entity_1 = require("../../personalization/entities/session-interaction.entity");
const session_interaction_type_enum_1 = require("../../personalization/enums/session-interaction-type.enum");
let SessionAnalyticsService = SessionAnalyticsService_1 = class SessionAnalyticsService {
    constructor(sessionRepository, interactionRepository) {
        this.sessionRepository = sessionRepository;
        this.interactionRepository = interactionRepository;
        this.logger = new common_1.Logger(SessionAnalyticsService_1.name);
    }
    async getSessionAnalyticsOverview(period = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const totalSessions = await this.sessionRepository.count({
                where: {
                    startTime: (0, typeorm_2.Between)(startDate, new Date()),
                },
            });
            const totalInteractions = await this.interactionRepository.count({
                where: {
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                },
            });
            const avgInteractionsPerSession = totalSessions > 0 ? totalInteractions / totalSessions : 0;
            const interactionTypeDistribution = await this.getInteractionTypeDistribution(startDate);
            const avgSessionDuration = await this.getAverageSessionDuration(startDate);
            const personalizationEffectiveness = await this.getPersonalizationEffectiveness(startDate);
            return {
                totalSessions,
                totalInteractions,
                avgInteractionsPerSession,
                interactionTypeDistribution,
                avgSessionDuration,
                personalizationEffectiveness,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get session analytics overview: ${error.message}`);
            throw error;
        }
    }
    async getInteractionTypeDistribution(startDate) {
        try {
            const result = await this.interactionRepository
                .createQueryBuilder('interaction')
                .select('interaction.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .where('interaction.timestamp >= :startDate', { startDate })
                .groupBy('interaction.type')
                .orderBy('count', 'DESC')
                .getRawMany();
            const distribution = {};
            let total = 0;
            result.forEach(item => {
                distribution[item.type] = parseInt(item.count);
                total += parseInt(item.count);
            });
            Object.keys(distribution).forEach(key => {
                distribution[`${key}Percentage`] = total > 0 ? (distribution[key] / total) * 100 : 0;
            });
            return distribution;
        }
        catch (error) {
            this.logger.error(`Failed to get interaction type distribution: ${error.message}`);
            return {};
        }
    }
    async getAverageSessionDuration(startDate) {
        try {
            const sessions = await this.sessionRepository.find({
                where: {
                    startTime: (0, typeorm_2.Between)(startDate, new Date()),
                },
                select: ['startTime', 'lastActivityTime'],
            });
            if (sessions.length === 0) {
                return 0;
            }
            const durations = sessions.map(session => {
                const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
                return duration / (1000 * 60);
            });
            const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
            return avgDuration;
        }
        catch (error) {
            this.logger.error(`Failed to get average session duration: ${error.message}`);
            return 0;
        }
    }
    async getPersonalizationEffectiveness(startDate) {
        try {
            const clickThroughRates = await this.getPersonalizedVsRegularClickThroughRates(startDate);
            const dwellTimeMetrics = await this.getDwellTimeMetrics(startDate);
            const impressionToClickRates = await this.getImpressionToClickRates(startDate);
            return {
                clickThroughRates,
                dwellTimeMetrics,
                impressionToClickRates,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get personalization effectiveness: ${error.message}`);
            return {};
        }
    }
    async getPersonalizedVsRegularClickThroughRates(startDate) {
        try {
            const personalizedClicks = await this.interactionRepository.count({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.CLICK,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    data: { hasPersonalization: true },
                },
            });
            const personalizedImpressions = await this.interactionRepository.count({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.IMPRESSION,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    data: { hasPersonalization: true },
                },
            });
            const regularClicks = await this.interactionRepository.count({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.CLICK,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    data: { hasPersonalization: false },
                },
            });
            const regularImpressions = await this.interactionRepository.count({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.IMPRESSION,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    data: { hasPersonalization: false },
                },
            });
            const personalizedCTR = personalizedImpressions > 0 ? personalizedClicks / personalizedImpressions : 0;
            const regularCTR = regularImpressions > 0 ? regularClicks / regularImpressions : 0;
            const improvement = personalizedCTR - regularCTR;
            const improvementPercentage = regularCTR > 0 ? (improvement / regularCTR) * 100 : 0;
            return {
                personalized: {
                    clicks: personalizedClicks,
                    impressions: personalizedImpressions,
                    clickThroughRate: personalizedCTR,
                },
                regular: {
                    clicks: regularClicks,
                    impressions: regularImpressions,
                    clickThroughRate: regularCTR,
                },
                improvement,
                improvementPercentage,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get personalized vs regular click-through rates: ${error.message}`);
            return {
                personalized: { clickThroughRate: 0 },
                regular: { clickThroughRate: 0 },
                improvement: 0,
                improvementPercentage: 0,
            };
        }
    }
    async getDwellTimeMetrics(startDate) {
        try {
            const dwellTimeInteractions = await this.interactionRepository.find({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.DWELL,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                },
                select: ['data', 'durationMs'],
            });
            if (dwellTimeInteractions.length === 0) {
                return {
                    avgDwellTime: 0,
                    personalized: { avgDwellTime: 0 },
                    regular: { avgDwellTime: 0 },
                    improvement: 0,
                    improvementPercentage: 0,
                };
            }
            const personalizedInteractions = dwellTimeInteractions.filter(interaction => interaction.data?.hasPersonalization === true);
            const regularInteractions = dwellTimeInteractions.filter(interaction => interaction.data?.hasPersonalization === false);
            const avgDwellTime = dwellTimeInteractions.reduce((sum, interaction) => sum + (interaction.durationMs || 0), 0) /
                dwellTimeInteractions.length;
            const avgPersonalizedDwellTime = personalizedInteractions.length > 0
                ? personalizedInteractions.reduce((sum, interaction) => sum + (interaction.durationMs || 0), 0) / personalizedInteractions.length
                : 0;
            const avgRegularDwellTime = regularInteractions.length > 0
                ? regularInteractions.reduce((sum, interaction) => sum + (interaction.durationMs || 0), 0) / regularInteractions.length
                : 0;
            const improvement = avgPersonalizedDwellTime - avgRegularDwellTime;
            const improvementPercentage = avgRegularDwellTime > 0 ? (improvement / avgRegularDwellTime) * 100 : 0;
            return {
                avgDwellTime,
                personalized: {
                    avgDwellTime: avgPersonalizedDwellTime,
                    count: personalizedInteractions.length,
                },
                regular: {
                    avgDwellTime: avgRegularDwellTime,
                    count: regularInteractions.length,
                },
                improvement,
                improvementPercentage,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get dwell time metrics: ${error.message}`);
            return {
                avgDwellTime: 0,
                personalized: { avgDwellTime: 0 },
                regular: { avgDwellTime: 0 },
                improvement: 0,
                improvementPercentage: 0,
            };
        }
    }
    async getImpressionToClickRates(startDate) {
        try {
            const sessions = await this.sessionRepository.find({
                where: {
                    startTime: (0, typeorm_2.Between)(startDate, new Date()),
                },
                relations: ['interactions'],
            });
            const metrics = {
                personalized: {
                    sessions: 0,
                    impressions: 0,
                    clicks: 0,
                    conversionRate: 0,
                },
                regular: {
                    sessions: 0,
                    impressions: 0,
                    clicks: 0,
                    conversionRate: 0,
                },
                improvement: 0,
                improvementPercentage: 0,
            };
            sessions.forEach(session => {
                const hasPersonalization = session.interactions.some(interaction => interaction.data?.hasPersonalization === true);
                const impressions = session.interactions.filter(interaction => interaction.type === session_interaction_type_enum_1.SessionInteractionType.IMPRESSION).length;
                const clicks = session.interactions.filter(interaction => interaction.type === session_interaction_type_enum_1.SessionInteractionType.CLICK).length;
                if (hasPersonalization) {
                    metrics.personalized.sessions++;
                    metrics.personalized.impressions += impressions;
                    metrics.personalized.clicks += clicks;
                }
                else {
                    metrics.regular.sessions++;
                    metrics.regular.impressions += impressions;
                    metrics.regular.clicks += clicks;
                }
            });
            metrics.personalized.conversionRate =
                metrics.personalized.impressions > 0
                    ? metrics.personalized.clicks / metrics.personalized.impressions
                    : 0;
            metrics.regular.conversionRate =
                metrics.regular.impressions > 0 ? metrics.regular.clicks / metrics.regular.impressions : 0;
            metrics.improvement = metrics.personalized.conversionRate - metrics.regular.conversionRate;
            metrics.improvementPercentage =
                metrics.regular.conversionRate > 0
                    ? (metrics.improvement / metrics.regular.conversionRate) * 100
                    : 0;
            return metrics;
        }
        catch (error) {
            this.logger.error(`Failed to get impression to click conversion rates: ${error.message}`);
            return {
                personalized: { conversionRate: 0 },
                regular: { conversionRate: 0 },
                improvement: 0,
                improvementPercentage: 0,
            };
        }
    }
    async getSessionTimeSeriesData(period = 30, interval = 1) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const timeSeriesData = [];
            for (let i = 0; i < period; i += interval) {
                const intervalStartDate = new Date(startDate);
                intervalStartDate.setDate(intervalStartDate.getDate() + i);
                const intervalEndDate = new Date(intervalStartDate);
                intervalEndDate.setDate(intervalEndDate.getDate() + interval);
                if (intervalEndDate > endDate) {
                    intervalEndDate.setTime(endDate.getTime());
                }
                const sessionCount = await this.sessionRepository.count({
                    where: {
                        startTime: (0, typeorm_2.Between)(intervalStartDate, intervalEndDate),
                    },
                });
                const interactionCount = await this.interactionRepository.count({
                    where: {
                        timestamp: (0, typeorm_2.Between)(intervalStartDate, intervalEndDate),
                    },
                });
                const personalizedInteractionCount = await this.interactionRepository.count({
                    where: {
                        timestamp: (0, typeorm_2.Between)(intervalStartDate, intervalEndDate),
                        data: { hasPersonalization: true },
                    },
                });
                timeSeriesData.push({
                    date: intervalStartDate.toISOString().split('T')[0],
                    sessionCount,
                    interactionCount,
                    personalizedInteractionCount,
                    personalizationRate: interactionCount > 0 ? personalizedInteractionCount / interactionCount : 0,
                });
            }
            return timeSeriesData;
        }
        catch (error) {
            this.logger.error(`Failed to get session time series data: ${error.message}`);
            return [];
        }
    }
    async getTopPersonalizedEntities(limit = 10, period = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const clickInteractions = await this.interactionRepository.find({
                where: {
                    type: session_interaction_type_enum_1.SessionInteractionType.CLICK,
                    timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                },
                select: ['data'],
            });
            const entityCounts = {};
            clickInteractions.forEach(interaction => {
                const entityId = interaction.data?.resultId;
                if (entityId) {
                    entityCounts[entityId] = (entityCounts[entityId] || 0) + 1;
                }
            });
            const sortedEntities = Object.entries(entityCounts)
                .map(([entityId, count]) => ({
                entityId,
                count,
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
            return sortedEntities;
        }
        catch (error) {
            this.logger.error(`Failed to get top personalized entities: ${error.message}`);
            return [];
        }
    }
};
exports.SessionAnalyticsService = SessionAnalyticsService;
exports.SessionAnalyticsService = SessionAnalyticsService = SessionAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(session_interaction_entity_1.SessionInteractionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionAnalyticsService);
//# sourceMappingURL=session-analytics.service.js.map