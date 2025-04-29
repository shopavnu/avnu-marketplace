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
var AnonymousUserAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousUserAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../entities/session.entity");
const session_interaction_entity_1 = require("../entities/session-interaction.entity");
const session_service_1 = require("./session.service");
const products_service_1 = require("../../products/products.service");
const category_service_1 = require("../../products/services/category.service");
const merchant_service_1 = require("../../merchants/services/merchant.service");
let AnonymousUserAnalyticsService = AnonymousUserAnalyticsService_1 = class AnonymousUserAnalyticsService {
    constructor(sessionRepository, interactionRepository, productsService, categoryService, merchantService) {
        this.sessionRepository = sessionRepository;
        this.interactionRepository = interactionRepository;
        this.productsService = productsService;
        this.categoryService = categoryService;
        this.merchantService = merchantService;
        this.logger = new common_1.Logger(AnonymousUserAnalyticsService_1.name);
    }
    async getAnonymousUserMetrics(period) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);
            const sessions = await this.sessionRepository.find({
                where: {
                    startTime: (0, typeorm_2.MoreThanOrEqual)(startDate),
                },
                relations: ['interactions'],
            });
            const interactions = await this.interactionRepository.find({
                where: {
                    timestamp: (0, typeorm_2.MoreThanOrEqual)(startDate),
                },
                relations: ['session'],
            });
            const overview = await this.calculateOverviewMetrics(sessions, interactions, startDate);
            const interactionsByType = await this.calculateInteractionsByType(interactions);
            const topCategoryPreferences = await this.calculateTopCategoryPreferences(interactions);
            const topBrandPreferences = await this.calculateTopBrandPreferences(interactions);
            const topSearchTerms = await this.calculateTopSearchTerms(interactions);
            const byTimeframe = await this.calculateMetricsByTimeframe(sessions, interactions, period);
            return {
                overview,
                interactionsByType,
                topCategoryPreferences,
                topBrandPreferences,
                topSearchTerms,
                byTimeframe,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get anonymous user metrics: ${error.message}`);
            throw error;
        }
    }
    async calculateOverviewMetrics(sessions, interactions, startDate) {
        const totalAnonymousUsers = sessions.length;
        const activeSessionIds = new Set(interactions.map(interaction => interaction.session.sessionId));
        const activeAnonymousUsers = activeSessionIds.size;
        const conversionInteractions = interactions.filter(interaction => interaction.type === session_service_1.SessionInteractionType.ADD_TO_CART ||
            interaction.type === session_service_1.SessionInteractionType.PURCHASE);
        const conversionSessionIds = new Set(conversionInteractions.map(interaction => interaction.session.sessionId));
        const conversionRate = activeAnonymousUsers > 0 ? conversionSessionIds.size / activeAnonymousUsers : 0;
        let totalDuration = 0;
        let sessionsWithDuration = 0;
        sessions.forEach(session => {
            if (session.lastActivityTime && session.startTime) {
                const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
                if (duration > 0 && duration < 24 * 60 * 60 * 1000) {
                    totalDuration += duration;
                    sessionsWithDuration++;
                }
            }
        });
        const avgSessionDuration = sessionsWithDuration > 0 ? totalDuration / sessionsWithDuration : 0;
        const sessionsByDay = new Map();
        sessions.forEach(session => {
            const day = session.startTime.toISOString().split('T')[0];
            if (!sessionsByDay.has(day)) {
                sessionsByDay.set(day, new Set());
            }
            sessionsByDay.get(day).add(session.sessionId);
        });
        const uniqueSessionIds = new Set();
        let returningSessionCount = 0;
        sessionsByDay.forEach((sessionsInDay, day) => {
            sessionsInDay.forEach(sessionId => {
                if (uniqueSessionIds.has(sessionId)) {
                    returningSessionCount++;
                }
                else {
                    uniqueSessionIds.add(sessionId);
                }
            });
        });
        const returningUserRate = totalAnonymousUsers > 0 ? returningSessionCount / totalAnonymousUsers : 0;
        return {
            totalAnonymousUsers,
            activeAnonymousUsers,
            conversionRate,
            avgSessionDuration,
            returningUserRate,
        };
    }
    async calculateInteractionsByType(interactions) {
        const interactionCounts = new Map();
        interactions.forEach(interaction => {
            const count = interactionCounts.get(interaction.type) || 0;
            interactionCounts.set(interaction.type, count + 1);
        });
        const totalInteractions = interactions.length;
        const result = [];
        interactionCounts.forEach((count, type) => {
            result.push({
                type,
                count,
                percentage: totalInteractions > 0 ? count / totalInteractions : 0,
            });
        });
        return result.sort((a, b) => b.count - a.count);
    }
    async calculateTopCategoryPreferences(interactions) {
        const categoryInteractions = interactions.filter(interaction => (interaction.type === session_service_1.SessionInteractionType.VIEW &&
            interaction.data?.type === 'category') ||
            (interaction.type === session_service_1.SessionInteractionType.FILTER &&
                interaction.data?.filterType === 'category') ||
            (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW && interaction.data?.categoryId));
        const categoryData = new Map();
        for (const interaction of categoryInteractions) {
            let categoryId = '';
            let categoryName = '';
            if (interaction.type === session_service_1.SessionInteractionType.VIEW &&
                interaction.data?.type === 'category') {
                categoryId = interaction.data.categoryId;
                categoryName = interaction.data.categoryName || (await this.getCategoryName(categoryId));
            }
            else if (interaction.type === session_service_1.SessionInteractionType.FILTER &&
                interaction.data?.filterType === 'category') {
                categoryId = interaction.data.filterValue;
                categoryName = await this.getCategoryName(categoryId);
            }
            else if (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW &&
                interaction.data?.categoryId) {
                categoryId = interaction.data.categoryId;
                categoryName = await this.getCategoryName(categoryId);
            }
            if (categoryId) {
                const existingData = categoryData.get(categoryId) || {
                    id: categoryId,
                    name: categoryName,
                    count: 0,
                    weight: 0,
                };
                existingData.count += 1;
                let interactionWeight = 0;
                if (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW) {
                    interactionWeight = 0.8;
                }
                else if (interaction.type === session_service_1.SessionInteractionType.FILTER) {
                    interactionWeight = 0.6;
                }
                else if (interaction.type === session_service_1.SessionInteractionType.VIEW) {
                    interactionWeight = 0.4;
                }
                existingData.weight += interactionWeight;
                categoryData.set(categoryId, existingData);
            }
        }
        const result = Array.from(categoryData.values()).map(item => ({
            categoryId: item.id,
            categoryName: item.name,
            weight: item.weight,
            interactionCount: item.count,
        }));
        return result.sort((a, b) => b.weight - a.weight).slice(0, 10);
    }
    async calculateTopBrandPreferences(interactions) {
        const brandInteractions = interactions.filter(interaction => (interaction.type === session_service_1.SessionInteractionType.VIEW && interaction.data?.type === 'brand') ||
            (interaction.type === session_service_1.SessionInteractionType.FILTER &&
                interaction.data?.filterType === 'brand') ||
            (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW && interaction.data?.brandId));
        const brandData = new Map();
        for (const interaction of brandInteractions) {
            let brandId = '';
            let brandName = '';
            if (interaction.type === session_service_1.SessionInteractionType.VIEW && interaction.data?.type === 'brand') {
                brandId = interaction.data.brandId;
                brandName = interaction.data.brandName || (await this.getMerchantName(brandId));
            }
            else if (interaction.type === session_service_1.SessionInteractionType.FILTER &&
                interaction.data?.filterType === 'brand') {
                brandId = interaction.data.filterValue;
                brandName = await this.getMerchantName(brandId);
            }
            else if (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW &&
                interaction.data?.brandId) {
                brandId = interaction.data.brandId;
                brandName = await this.getMerchantName(brandId);
            }
            if (brandId) {
                const existingData = brandData.get(brandId) || {
                    id: brandId,
                    name: brandName,
                    count: 0,
                    weight: 0,
                };
                existingData.count += 1;
                let interactionWeight = 0;
                if (interaction.type === session_service_1.SessionInteractionType.PRODUCT_VIEW) {
                    interactionWeight = 0.8;
                }
                else if (interaction.type === session_service_1.SessionInteractionType.FILTER) {
                    interactionWeight = 0.6;
                }
                else if (interaction.type === session_service_1.SessionInteractionType.VIEW) {
                    interactionWeight = 0.4;
                }
                existingData.weight += interactionWeight;
                brandData.set(brandId, existingData);
            }
        }
        const result = Array.from(brandData.values()).map(item => ({
            brandId: item.id,
            brandName: item.name,
            weight: item.weight,
            interactionCount: item.count,
        }));
        return result.sort((a, b) => b.weight - a.weight).slice(0, 10);
    }
    async calculateTopSearchTerms(interactions) {
        const searchInteractions = interactions.filter(interaction => interaction.type === session_service_1.SessionInteractionType.SEARCH);
        const searchData = new Map();
        searchInteractions.forEach(interaction => {
            const query = interaction.data?.query?.toLowerCase();
            if (query) {
                const existingData = searchData.get(query) || {
                    query,
                    count: 0,
                    sessions: new Set(),
                };
                existingData.count += 1;
                existingData.sessions.add(interaction.session.sessionId);
                searchData.set(query, existingData);
            }
        });
        const result = [];
        for (const [query, data] of searchData.entries()) {
            const searchSessionIds = data.sessions;
            const conversionInteractions = interactions.filter(interaction => searchSessionIds.has(interaction.session.sessionId) &&
                (interaction.type === session_service_1.SessionInteractionType.ADD_TO_CART ||
                    interaction.type === session_service_1.SessionInteractionType.PURCHASE));
            const conversionSessionIds = new Set(conversionInteractions.map(interaction => interaction.session.sessionId));
            const conversionRate = searchSessionIds.size > 0 ? conversionSessionIds.size / searchSessionIds.size : 0;
            result.push({
                query: data.query,
                count: data.count,
                conversionRate,
            });
        }
        return result.sort((a, b) => b.count - a.count).slice(0, 20);
    }
    async calculateMetricsByTimeframe(sessions, interactions, period) {
        const timeframeData = new Map();
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            timeframeData.set(dateString, {
                date: dateString,
                anonymousUsers: 0,
                newUsers: 0,
                returningUsers: new Set(),
                sessionDurations: [],
            });
        }
        const seenSessionIds = new Set();
        sessions.forEach(session => {
            const dateString = session.startTime.toISOString().split('T')[0];
            const data = timeframeData.get(dateString);
            if (data) {
                data.anonymousUsers++;
                if (seenSessionIds.has(session.sessionId)) {
                    data.returningUsers.add(session.sessionId);
                }
                else {
                    data.newUsers++;
                    seenSessionIds.add(session.sessionId);
                }
                if (session.lastActivityTime && session.startTime) {
                    const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
                    if (duration > 0 && duration < 24 * 60 * 60 * 1000) {
                        data.sessionDurations.push(duration);
                    }
                }
            }
        });
        const result = Array.from(timeframeData.values()).map(data => ({
            date: data.date,
            anonymousUsers: data.anonymousUsers,
            newUsers: data.newUsers,
            returningUsers: data.returningUsers.size,
            avgSessionDuration: data.sessionDurations.length > 0
                ? data.sessionDurations.reduce((sum, duration) => sum + duration, 0) /
                    data.sessionDurations.length
                : 0,
        }));
        return result.sort((a, b) => a.date.localeCompare(b.date));
    }
    async getCategoryName(categoryId) {
        try {
            const category = await this.categoryService.findOne(categoryId);
            return category?.name || 'Unknown Category';
        }
        catch (error) {
            return 'Unknown Category';
        }
    }
    async getMerchantName(merchantId) {
        try {
            const merchant = await this.merchantService.findOne(merchantId);
            return merchant?.name || 'Unknown Brand';
        }
        catch (error) {
            return 'Unknown Brand';
        }
    }
};
exports.AnonymousUserAnalyticsService = AnonymousUserAnalyticsService;
exports.AnonymousUserAnalyticsService = AnonymousUserAnalyticsService = AnonymousUserAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(session_interaction_entity_1.SessionInteractionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        category_service_1.CategoryService,
        merchant_service_1.MerchantService])
], AnonymousUserAnalyticsService);
//# sourceMappingURL=anonymous-user-analytics.service.js.map