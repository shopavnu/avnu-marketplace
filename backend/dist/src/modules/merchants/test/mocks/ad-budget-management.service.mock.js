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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdBudgetManagementService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const entity_mocks_1 = require("./entity-mocks");
let AdBudgetManagementService = class AdBudgetManagementService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    async getBudgetUtilization(_merchantId) {
        return {
            totalBudget: 1500,
            totalSpent: 500,
            remainingBudget: 1000,
            utilizationRate: 0.33,
            campaignBreakdown: {
                campaign1: 300,
                campaign2: 200,
            },
        };
    }
    async getBudgetForecast(_merchantId) {
        return {
            projectedSpend: 1000,
            daysRemaining: 15,
            dailyBudget: 66.67,
            projectedExhaustionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            campaignProjections: {
                campaign1: 600,
                campaign2: 400,
            },
        };
    }
    async getDailyBudget(_merchantId) {
        return 66.67;
    }
    async allocateBudgetAcrossCampaigns(_merchantId, campaignIds, totalBudget, strategy = entity_mocks_1.BudgetAllocationStrategy.EQUAL) {
        if (strategy === entity_mocks_1.BudgetAllocationStrategy.EQUAL) {
            const perCampaignBudget = totalBudget / campaignIds.length;
            return campaignIds.reduce((acc, id) => {
                acc[id] = perCampaignBudget;
                return acc;
            }, {});
        }
        else if (strategy === entity_mocks_1.BudgetAllocationStrategy.PERFORMANCE_BASED) {
            return {
                campaign1: 600,
                campaign2: 400,
            };
        }
        else {
            return {
                campaign1: 500,
                campaign2: 500,
            };
        }
    }
    async recordAdSpend(campaignId, amount, _impressionCount = 1) {
        return {
            campaignId,
            previousSpent: 100,
            currentSpent: 100 + amount,
            remainingBudget: 900 - amount,
            budgetExhausted: false,
        };
    }
};
exports.AdBudgetManagementService = AdBudgetManagementService;
exports.AdBudgetManagementService = AdBudgetManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], AdBudgetManagementService);
//# sourceMappingURL=ad-budget-management.service.mock.js.map