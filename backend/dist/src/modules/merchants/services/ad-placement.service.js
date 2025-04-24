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
var AdPlacementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdPlacementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_ad_campaign_entity_1 = require("../entities/merchant-ad-campaign.entity");
const ad_budget_management_service_1 = require("./ad-budget-management.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let AdPlacementService = AdPlacementService_1 = class AdPlacementService {
    constructor(adCampaignRepository, budgetService, eventEmitter) {
        this.adCampaignRepository = adCampaignRepository;
        this.budgetService = budgetService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AdPlacementService_1.name);
    }
    async getAdsForDiscoveryFeed(options) {
        const { maxAds = 2 } = options;
        const activeCampaigns = await this.adCampaignRepository.find({
            where: { status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE },
        });
        if (activeCampaigns.length === 0) {
            return [];
        }
        const scoredCampaigns = await Promise.all(activeCampaigns.map(async (campaign) => {
            const relevanceScore = await this.calculateRelevanceScore(campaign, options);
            const impressionCost = await this.budgetService.calculateCostPerImpression(campaign.id);
            return {
                campaign,
                relevanceScore,
                impressionCost,
            };
        }));
        scoredCampaigns.sort((a, b) => b.relevanceScore - a.relevanceScore);
        const selectedCampaigns = scoredCampaigns.slice(0, maxAds);
        const results = [];
        for (const { campaign, relevanceScore, impressionCost } of selectedCampaigns) {
            try {
                const budgetResult = await this.budgetService.recordAdSpend(campaign.id, impressionCost, 1);
                if (!budgetResult.budgetExhausted) {
                    results.push({
                        campaignId: campaign.id,
                        merchantId: campaign.merchantId,
                        productIds: campaign.productIds,
                        type: campaign.type,
                        relevanceScore,
                        isSponsored: true,
                        impressionCost,
                    });
                }
                this.eventEmitter.emit('ad.impression', {
                    campaignId: campaign.id,
                    merchantId: campaign.merchantId,
                    userId: options.userId,
                    sessionId: options.sessionId,
                    timestamp: new Date(),
                    relevanceScore,
                    impressionCost,
                });
            }
            catch (error) {
                this.logger.error(`Error recording ad impression for campaign ${campaign.id}`, error);
            }
        }
        return results;
    }
    async calculateRelevanceScore(campaign, options) {
        let score = 1.0;
        if (campaign.targetAudience !== merchant_ad_campaign_entity_1.TargetAudience.ALL && options.userId) {
            switch (campaign.targetAudience) {
                case merchant_ad_campaign_entity_1.TargetAudience.PREVIOUS_VISITORS:
                    if (!options.previouslyViewedProductIds?.some(id => campaign.productIds.includes(id))) {
                        score *= 0.5;
                    }
                    else {
                        score *= 1.5;
                    }
                    break;
                case merchant_ad_campaign_entity_1.TargetAudience.CART_ABANDONERS:
                    if (!options.cartProductIds?.some(id => campaign.productIds.includes(id))) {
                        score *= 0.3;
                    }
                    else {
                        score *= 2.0;
                    }
                    break;
                case merchant_ad_campaign_entity_1.TargetAudience.PREVIOUS_CUSTOMERS:
                    if (!options.purchasedProductIds?.some(id => campaign.productIds.includes(id))) {
                        score *= 0.4;
                    }
                    else {
                        score *= 1.8;
                    }
                    break;
            }
        }
        if (campaign.targetLocations?.length && options.location) {
            const locationMatch = campaign.targetLocations.some(location => options.location?.toLowerCase().includes(location.toLowerCase()));
            if (!locationMatch) {
                score *= 0.7;
            }
            else {
                score *= 1.2;
            }
        }
        if (campaign.targetInterests?.length && options.interests?.length) {
            const interestMatches = campaign.targetInterests.filter(interest => options.interests?.some(userInterest => userInterest.toLowerCase().includes(interest.toLowerCase())));
            if (interestMatches.length === 0) {
                score *= 0.6;
            }
            else {
                const matchRatio = interestMatches.length / campaign.targetInterests.length;
                score *= (1 + matchRatio);
            }
        }
        if (campaign.targetDemographics?.length && options.demographics?.length) {
            const demographicMatches = campaign.targetDemographics.filter(demographic => options.demographics?.some(userDemographic => userDemographic.toLowerCase().includes(demographic.toLowerCase())));
            if (demographicMatches.length === 0) {
                score *= 0.8;
            }
            else {
                const matchRatio = demographicMatches.length / campaign.targetDemographics.length;
                score *= (1 + matchRatio * 0.5);
            }
        }
        const randomFactor = 0.95 + Math.random() * 0.1;
        score *= randomFactor;
        return Math.max(0.1, Math.min(10, score));
    }
    async recordAdClick(campaignId, userId, sessionId) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        const newClicks = (campaign.clicks || 0) + 1;
        const clickThroughRate = campaign.impressions
            ? parseFloat((newClicks / campaign.impressions).toFixed(4))
            : 0;
        await this.adCampaignRepository.update({ id: campaignId }, {
            clicks: newClicks,
            clickThroughRate,
        });
        const costPerClick = await this.budgetService.calculateCostPerClick(campaignId);
        await this.budgetService.recordAdSpend(campaignId, costPerClick, 0);
        this.eventEmitter.emit('ad.click', {
            campaignId,
            merchantId: campaign.merchantId,
            userId,
            sessionId,
            timestamp: new Date(),
            costPerClick,
        });
    }
    async getRecommendedPlacements(merchantId) {
        const activeCampaigns = await this.adCampaignRepository.find({
            where: { merchantId, status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE },
        });
        const allProductIds = new Set();
        activeCampaigns.forEach(campaign => {
            campaign.productIds.forEach(id => allProductIds.add(id));
        });
        const recommendations = Array.from(allProductIds).map(productId => {
            const productCampaigns = activeCampaigns.filter(campaign => campaign.productIds.includes(productId));
            const totalImpressions = productCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
            const totalClicks = productCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
            const totalConversions = productCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
            const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0.01;
            const avgCVR = totalClicks > 0 ? totalConversions / totalClicks : 0.02;
            const performanceScore = (avgCTR * 0.6) + (avgCVR * 0.4);
            const baseRecommendedBudget = 100;
            const recommendedBudget = baseRecommendedBudget * (1 + performanceScore * 10);
            const estimatedImpressions = recommendedBudget / 0.01;
            const estimatedClicks = estimatedImpressions * avgCTR;
            const estimatedConversions = estimatedClicks * avgCVR;
            return {
                productId,
                recommendedBudget: Math.round(recommendedBudget * 100) / 100,
                estimatedImpressions: Math.round(estimatedImpressions),
                estimatedClicks: Math.round(estimatedClicks),
                estimatedConversions: Math.round(estimatedConversions),
            };
        });
        return recommendations;
    }
};
exports.AdPlacementService = AdPlacementService;
exports.AdPlacementService = AdPlacementService = AdPlacementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_ad_campaign_entity_1.MerchantAdCampaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ad_budget_management_service_1.AdBudgetManagementService,
        event_emitter_1.EventEmitter2])
], AdPlacementService);
//# sourceMappingURL=ad-placement.service.js.map