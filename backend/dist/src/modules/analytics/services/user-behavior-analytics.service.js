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
var UserBehaviorAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBehaviorAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scroll_analytics_entity_1 = require("../entities/scroll-analytics.entity");
const heatmap_data_entity_1 = require("../entities/heatmap-data.entity");
const user_engagement_entity_1 = require("../entities/user-engagement.entity");
let UserBehaviorAnalyticsService = UserBehaviorAnalyticsService_1 = class UserBehaviorAnalyticsService {
    constructor(scrollAnalyticsRepository, heatmapDataRepository, userEngagementRepository) {
        this.scrollAnalyticsRepository = scrollAnalyticsRepository;
        this.heatmapDataRepository = heatmapDataRepository;
        this.userEngagementRepository = userEngagementRepository;
        this.logger = new common_1.Logger(UserBehaviorAnalyticsService_1.name);
    }
    async trackScrolling(data) {
        try {
            if (!data.direction) {
                data.direction = scroll_analytics_entity_1.ScrollDirection.VERTICAL;
            }
            if (!data.maxScrollPercentage && data.maxScrollDepth && data.pageHeight) {
                data.maxScrollPercentage = (data.maxScrollDepth / data.pageHeight) * 100;
            }
            const scrollAnalytics = this.scrollAnalyticsRepository.create(data);
            return this.scrollAnalyticsRepository.save(scrollAnalytics);
        }
        catch (error) {
            this.logger.error(`Failed to track scrolling: ${error.message}`);
            throw error;
        }
    }
    async trackHeatmapData(data) {
        try {
            const heatmapData = this.heatmapDataRepository.create(data);
            return this.heatmapDataRepository.save(heatmapData);
        }
        catch (error) {
            this.logger.error(`Failed to track heatmap data: ${error.message}`);
            throw error;
        }
    }
    async trackBatchHeatmapData(dataItems) {
        try {
            if (!dataItems || dataItems.length === 0) {
                return [];
            }
            const heatmapDataItems = dataItems.map(data => this.heatmapDataRepository.create(data));
            return this.heatmapDataRepository.save(heatmapDataItems);
        }
        catch (error) {
            this.logger.error(`Failed to track batch heatmap data: ${error.message}`);
            throw error;
        }
    }
    async getVerticalScrollingAnalytics(period = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const avgScrollDepthByPage = await this.scrollAnalyticsRepository
                .createQueryBuilder('scroll')
                .select('scroll.pagePath', 'pagePath')
                .addSelect('AVG(scroll.maxScrollPercentage)', 'avgScrollPercentage')
                .addSelect('AVG(scroll.scrollCount)', 'avgScrollCount')
                .addSelect('AVG(scroll.dwellTimeSeconds)', 'avgDwellTime')
                .addSelect('COUNT(scroll.id)', 'sessionCount')
                .where('scroll.timestamp >= :startDate', { startDate })
                .andWhere('scroll.direction = :direction', { direction: scroll_analytics_entity_1.ScrollDirection.VERTICAL })
                .groupBy('scroll.pagePath')
                .orderBy('avgScrollPercentage', 'DESC')
                .getRawMany();
            const avgScrollDepthByDevice = await this.scrollAnalyticsRepository
                .createQueryBuilder('scroll')
                .select('scroll.deviceType', 'deviceType')
                .addSelect('AVG(scroll.maxScrollPercentage)', 'avgScrollPercentage')
                .addSelect('AVG(scroll.scrollCount)', 'avgScrollCount')
                .addSelect('AVG(scroll.dwellTimeSeconds)', 'avgDwellTime')
                .addSelect('COUNT(scroll.id)', 'sessionCount')
                .where('scroll.timestamp >= :startDate', { startDate })
                .andWhere('scroll.direction = :direction', { direction: scroll_analytics_entity_1.ScrollDirection.VERTICAL })
                .groupBy('scroll.deviceType')
                .orderBy('avgScrollPercentage', 'DESC')
                .getRawMany();
            const scrollDepthDistribution = await this.scrollAnalyticsRepository
                .createQueryBuilder('scroll')
                .select('CASE ' +
                'WHEN scroll.maxScrollPercentage < 25 THEN \'0-25%\' ' +
                'WHEN scroll.maxScrollPercentage >= 25 AND scroll.maxScrollPercentage < 50 THEN \'25-50%\' ' +
                'WHEN scroll.maxScrollPercentage >= 50 AND scroll.maxScrollPercentage < 75 THEN \'50-75%\' ' +
                'WHEN scroll.maxScrollPercentage >= 75 AND scroll.maxScrollPercentage < 90 THEN \'75-90%\' ' +
                'ELSE \'90-100%\' ' +
                'END', 'depthRange')
                .addSelect('COUNT(scroll.id)', 'sessionCount')
                .where('scroll.timestamp >= :startDate', { startDate })
                .andWhere('scroll.direction = :direction', { direction: scroll_analytics_entity_1.ScrollDirection.VERTICAL })
                .groupBy('depthRange')
                .orderBy('depthRange', 'ASC')
                .getRawMany();
            const scrollDepthConversionCorrelation = await this.getScrollDepthConversionCorrelation(startDate);
            return {
                avgScrollDepthByPage,
                avgScrollDepthByDevice,
                scrollDepthDistribution,
                scrollDepthConversionCorrelation,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get vertical scrolling analytics: ${error.message}`);
            throw error;
        }
    }
    async getHeatmapAnalytics(pagePath, period = 30, interactionType) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            let queryBuilder = this.heatmapDataRepository
                .createQueryBuilder('heatmap')
                .select('heatmap.xPosition', 'xPosition')
                .addSelect('heatmap.yPosition', 'yPosition')
                .addSelect('COUNT(heatmap.id)', 'interactionCount')
                .where('heatmap.timestamp >= :startDate', { startDate })
                .andWhere('heatmap.pagePath = :pagePath', { pagePath });
            if (interactionType) {
                queryBuilder = queryBuilder.andWhere('heatmap.interactionType = :interactionType', {
                    interactionType,
                });
            }
            const heatmapData = await queryBuilder
                .groupBy('heatmap.xPosition')
                .addGroupBy('heatmap.yPosition')
                .orderBy('interactionCount', 'DESC')
                .getRawMany();
            let elementQueryBuilder = this.heatmapDataRepository
                .createQueryBuilder('heatmap')
                .select('heatmap.elementSelector', 'elementSelector')
                .addSelect('heatmap.elementId', 'elementId')
                .addSelect('heatmap.elementText', 'elementText')
                .addSelect('COUNT(heatmap.id)', 'interactionCount')
                .where('heatmap.timestamp >= :startDate', { startDate })
                .andWhere('heatmap.pagePath = :pagePath', { pagePath })
                .andWhere('heatmap.elementSelector IS NOT NULL');
            if (interactionType) {
                elementQueryBuilder = elementQueryBuilder.andWhere('heatmap.interactionType = :interactionType', { interactionType });
            }
            const elementInteractions = await elementQueryBuilder
                .groupBy('heatmap.elementSelector')
                .addGroupBy('heatmap.elementId')
                .addGroupBy('heatmap.elementText')
                .orderBy('interactionCount', 'DESC')
                .limit(50)
                .getRawMany();
            const interactionsByType = await this.heatmapDataRepository
                .createQueryBuilder('heatmap')
                .select('heatmap.interactionType', 'interactionType')
                .addSelect('COUNT(heatmap.id)', 'interactionCount')
                .where('heatmap.timestamp >= :startDate', { startDate })
                .andWhere('heatmap.pagePath = :pagePath', { pagePath })
                .groupBy('heatmap.interactionType')
                .orderBy('interactionCount', 'DESC')
                .getRawMany();
            return {
                heatmapData,
                elementInteractions,
                interactionsByType,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get heatmap analytics: ${error.message}`);
            throw error;
        }
    }
    async getVerticalNavigationFunnel(period = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const scrollDepthSegments = [
                { min: 0, max: 25, label: '0-25%' },
                { min: 25, max: 50, label: '25-50%' },
                { min: 50, max: 75, label: '50-75%' },
                { min: 75, max: 90, label: '75-90%' },
                { min: 90, max: 100, label: '90-100%' },
            ];
            const funnelData = await Promise.all(scrollDepthSegments.map(async (segment) => {
                const sessionsInSegment = await this.scrollAnalyticsRepository
                    .createQueryBuilder('scroll')
                    .select('DISTINCT scroll.sessionId', 'sessionId')
                    .where('scroll.timestamp >= :startDate', { startDate })
                    .andWhere('scroll.direction = :direction', { direction: scroll_analytics_entity_1.ScrollDirection.VERTICAL })
                    .andWhere('scroll.maxScrollPercentage >= :minDepth', { minDepth: segment.min })
                    .andWhere('scroll.maxScrollPercentage < :maxDepth', { maxDepth: segment.max })
                    .getRawMany();
                const sessionIds = sessionsInSegment.map(s => s.sessionId);
                if (sessionIds.length === 0) {
                    return {
                        segment: segment.label,
                        sessionCount: 0,
                        productViews: 0,
                        addToCarts: 0,
                        checkoutStarts: 0,
                        checkoutCompletions: 0,
                        addToCartRate: 0,
                        checkoutStartRate: 0,
                        checkoutCompletionRate: 0,
                        overallConversionRate: 0,
                    };
                }
                const productViews = await this.userEngagementRepository.count({
                    where: {
                        sessionId: sessionIds,
                        engagementType: user_engagement_entity_1.EngagementType.PRODUCT_VIEW,
                        timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    },
                });
                const addToCarts = await this.userEngagementRepository.count({
                    where: {
                        sessionId: sessionIds,
                        engagementType: user_engagement_entity_1.EngagementType.ADD_TO_CART,
                        timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    },
                });
                const checkoutStarts = await this.userEngagementRepository.count({
                    where: {
                        sessionId: sessionIds,
                        engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_START,
                        timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    },
                });
                const checkoutCompletions = await this.userEngagementRepository.count({
                    where: {
                        sessionId: sessionIds,
                        engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_COMPLETE,
                        timestamp: (0, typeorm_2.Between)(startDate, new Date()),
                    },
                });
                const addToCartRate = productViews > 0 ? addToCarts / productViews : 0;
                const checkoutStartRate = addToCarts > 0 ? checkoutStarts / addToCarts : 0;
                const checkoutCompletionRate = checkoutStarts > 0 ? checkoutCompletions / checkoutStarts : 0;
                const overallConversionRate = productViews > 0 ? checkoutCompletions / productViews : 0;
                return {
                    segment: segment.label,
                    sessionCount: sessionIds.length,
                    productViews,
                    addToCarts,
                    checkoutStarts,
                    checkoutCompletions,
                    addToCartRate,
                    checkoutStartRate,
                    checkoutCompletionRate,
                    overallConversionRate,
                };
            }));
            return {
                funnelData,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get vertical navigation funnel: ${error.message}`);
            throw error;
        }
    }
    async getScrollDepthConversionCorrelation(startDate) {
        try {
            const scrollSessions = await this.scrollAnalyticsRepository
                .createQueryBuilder('scroll')
                .select('scroll.sessionId', 'sessionId')
                .addSelect('MAX(scroll.maxScrollPercentage)', 'maxScrollPercentage')
                .where('scroll.timestamp >= :startDate', { startDate })
                .andWhere('scroll.direction = :direction', { direction: scroll_analytics_entity_1.ScrollDirection.VERTICAL })
                .groupBy('scroll.sessionId')
                .getRawMany();
            const sessionsWithConversion = await Promise.all(scrollSessions.map(async (session) => {
                const conversion = await this.userEngagementRepository.findOne({
                    where: {
                        sessionId: session.sessionId,
                        engagementType: user_engagement_entity_1.EngagementType.CHECKOUT_COMPLETE,
                        timestamp: (0, typeorm_2.MoreThan)(startDate),
                    },
                });
                return {
                    sessionId: session.sessionId,
                    maxScrollPercentage: parseFloat(session.maxScrollPercentage),
                    converted: !!conversion,
                };
            }));
            const scrollRanges = [
                { min: 0, max: 25, label: '0-25%' },
                { min: 25, max: 50, label: '25-50%' },
                { min: 50, max: 75, label: '50-75%' },
                { min: 75, max: 90, label: '75-90%' },
                { min: 90, max: 100, label: '90-100%' },
            ];
            const conversionByScrollDepth = scrollRanges.map(range => {
                const sessionsInRange = sessionsWithConversion.filter(s => s.maxScrollPercentage >= range.min && s.maxScrollPercentage < range.max);
                const conversionsInRange = sessionsInRange.filter(s => s.converted);
                return {
                    scrollDepthRange: range.label,
                    sessionCount: sessionsInRange.length,
                    conversionCount: conversionsInRange.length,
                    conversionRate: sessionsInRange.length > 0 ? conversionsInRange.length / sessionsInRange.length : 0,
                };
            });
            return conversionByScrollDepth;
        }
        catch (error) {
            this.logger.error(`Failed to get scroll depth conversion correlation: ${error.message}`);
            throw error;
        }
    }
};
exports.UserBehaviorAnalyticsService = UserBehaviorAnalyticsService;
exports.UserBehaviorAnalyticsService = UserBehaviorAnalyticsService = UserBehaviorAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scroll_analytics_entity_1.ScrollAnalytics)),
    __param(1, (0, typeorm_1.InjectRepository)(heatmap_data_entity_1.HeatmapData)),
    __param(2, (0, typeorm_1.InjectRepository)(user_engagement_entity_1.UserEngagement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserBehaviorAnalyticsService);
//# sourceMappingURL=user-behavior-analytics.service.js.map