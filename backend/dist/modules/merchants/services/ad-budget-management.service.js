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
var AdBudgetManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdBudgetManagementService = exports.BudgetAllocationStrategy = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_ad_campaign_entity_1 = require("../entities/merchant-ad-campaign.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
var BudgetAllocationStrategy;
(function (BudgetAllocationStrategy) {
    BudgetAllocationStrategy["EQUAL"] = "equal";
    BudgetAllocationStrategy["PERFORMANCE_BASED"] = "performance_based";
    BudgetAllocationStrategy["TIME_BASED"] = "time_based";
})(BudgetAllocationStrategy || (exports.BudgetAllocationStrategy = BudgetAllocationStrategy = {}));
let AdBudgetManagementService = AdBudgetManagementService_1 = class AdBudgetManagementService {
    constructor(adCampaignRepository, eventEmitter) {
        this.adCampaignRepository = adCampaignRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AdBudgetManagementService_1.name);
    }
    async calculateDailyBudget(campaignId) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        if (!campaign.endDate) {
            return campaign.budget / 30;
        }
        const startDate = new Date(campaign.startDate);
        const endDate = new Date(campaign.endDate);
        const durationInDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        return campaign.budget / durationInDays;
    }
    async recordAdSpend(campaignId, amount, impressionCount = 1) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        const previousSpent = campaign.spent || 0;
        const currentSpent = previousSpent + amount;
        const remainingBudget = campaign.budget - currentSpent;
        const budgetExhausted = remainingBudget <= 0;
        await this.adCampaignRepository.update({ id: campaignId }, {
            spent: currentSpent,
            impressions: (campaign.impressions || 0) + impressionCount,
        });
        if (budgetExhausted && campaign.status === merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE) {
            await this.adCampaignRepository.update({ id: campaignId }, { status: merchant_ad_campaign_entity_1.CampaignStatus.PAUSED });
            this.logger.log(`Campaign ${campaignId} paused due to budget exhaustion`);
            this.eventEmitter.emit('campaign.budget.exhausted', {
                campaignId,
                merchantId: campaign.merchantId
            });
        }
        return {
            campaignId,
            previousSpent,
            currentSpent,
            remainingBudget,
            budgetExhausted,
        };
    }
    async calculateCostPerImpression(campaignId) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        const targetImpressions = 100 / 0.001;
        return campaign.budget / targetImpressions;
    }
    async calculateCostPerClick(campaignId) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        if (!campaign.clicks || campaign.clicks === 0) {
            return campaign.budget / 100;
        }
        return campaign.spent / campaign.clicks;
    }
    async allocateBudgetAcrossCampaigns(merchantId, totalBudget, campaignIds, strategy = BudgetAllocationStrategy.EQUAL) {
        const campaigns = await this.adCampaignRepository.find({
            where: { id: { in: campaignIds }, merchantId },
        });
        if (campaigns.length === 0) {
            throw new Error('No valid campaigns found for budget allocation');
        }
        const allocation = {};
        switch (strategy) {
            case BudgetAllocationStrategy.PERFORMANCE_BASED:
                const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.clicks || 0), 0);
                if (totalClicks === 0) {
                    const equalBudget = totalBudget / campaigns.length;
                    campaigns.forEach(campaign => {
                        allocation[campaign.id] = equalBudget;
                    });
                }
                else {
                    campaigns.forEach(campaign => {
                        const performanceRatio = (campaign.clicks || 0) / totalClicks;
                        allocation[campaign.id] = totalBudget * performanceRatio;
                    });
                }
                break;
            case BudgetAllocationStrategy.TIME_BASED:
                const now = new Date();
                const totalDaysActive = campaigns.reduce((sum, campaign) => {
                    const startDate = new Date(campaign.startDate);
                    const daysActive = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(1, daysActive);
                }, 0);
                campaigns.forEach(campaign => {
                    const startDate = new Date(campaign.startDate);
                    const daysActive = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const inverseTimeRatio = (totalDaysActive - daysActive + 1) / totalDaysActive;
                    allocation[campaign.id] = totalBudget * (inverseTimeRatio / campaigns.length);
                });
                break;
            case BudgetAllocationStrategy.EQUAL:
            default:
                const equalBudget = totalBudget / campaigns.length;
                campaigns.forEach(campaign => {
                    allocation[campaign.id] = equalBudget;
                });
                break;
        }
        for (const campaignId in allocation) {
            await this.adCampaignRepository.update({ id: campaignId }, { budget: allocation[campaignId] });
        }
        return allocation;
    }
    async getBudgetUtilizationReport(merchantId) {
        const campaigns = await this.adCampaignRepository.find({
            where: { merchantId },
        });
        const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
        const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0);
        const utilizationRate = totalBudget > 0 ? totalSpent / totalBudget : 0;
        const campaignUtilization = campaigns.map(campaign => ({
            campaignId: campaign.id,
            name: campaign.name,
            budget: campaign.budget,
            spent: campaign.spent || 0,
            utilizationRate: campaign.budget > 0 ? (campaign.spent || 0) / campaign.budget : 0,
        }));
        return {
            totalBudget,
            totalSpent,
            utilizationRate,
            campaignUtilization,
        };
    }
    async forecastRemainingDuration(campaignId) {
        const campaign = await this.adCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        const remainingBudget = campaign.budget - (campaign.spent || 0);
        const startDate = new Date(campaign.startDate);
        const now = new Date();
        const daysActive = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const dailySpendRate = (campaign.spent || 0) / daysActive;
        const estimatedDaysRemaining = dailySpendRate > 0 ? Math.ceil(remainingBudget / dailySpendRate) : 0;
        const estimatedEndDate = new Date();
        estimatedEndDate.setDate(estimatedEndDate.getDate() + estimatedDaysRemaining);
        return {
            campaignId,
            remainingBudget,
            dailySpendRate,
            estimatedDaysRemaining,
            estimatedEndDate,
        };
    }
};
exports.AdBudgetManagementService = AdBudgetManagementService;
exports.AdBudgetManagementService = AdBudgetManagementService = AdBudgetManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_ad_campaign_entity_1.MerchantAdCampaign)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], AdBudgetManagementService);
//# sourceMappingURL=ad-budget-management.service.js.map