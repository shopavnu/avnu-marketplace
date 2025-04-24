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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdBudgetManagementResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const ad_budget_management_service_1 = require("../services/ad-budget-management.service");
const merchant_service_1 = require("../services/merchant.service");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const merchant_only_decorator_1 = require("../../auth/decorators/merchant-only.decorator");
const user_entity_1 = require("../../users/entities/user.entity");
const graphql_2 = require("@nestjs/graphql");
(0, graphql_2.registerEnumType)(ad_budget_management_service_1.BudgetAllocationStrategy, { name: 'BudgetAllocationStrategy' });
const graphql_3 = require("@nestjs/graphql");
let BudgetUtilizationReport = class BudgetUtilizationReport {
};
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], BudgetUtilizationReport.prototype, "totalBudget", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], BudgetUtilizationReport.prototype, "totalSpent", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], BudgetUtilizationReport.prototype, "utilizationRate", void 0);
__decorate([
    (0, graphql_3.Field)(() => [CampaignUtilization]),
    __metadata("design:type", Array)
], BudgetUtilizationReport.prototype, "campaignUtilization", void 0);
BudgetUtilizationReport = __decorate([
    (0, graphql_3.ObjectType)()
], BudgetUtilizationReport);
let CampaignUtilization = class CampaignUtilization {
};
__decorate([
    (0, graphql_3.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CampaignUtilization.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_3.Field)(),
    __metadata("design:type", String)
], CampaignUtilization.prototype, "name", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignUtilization.prototype, "budget", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignUtilization.prototype, "spent", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignUtilization.prototype, "utilizationRate", void 0);
CampaignUtilization = __decorate([
    (0, graphql_3.ObjectType)()
], CampaignUtilization);
let CampaignForecast = class CampaignForecast {
};
__decorate([
    (0, graphql_3.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CampaignForecast.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignForecast.prototype, "remainingBudget", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignForecast.prototype, "dailySpendRate", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CampaignForecast.prototype, "estimatedDaysRemaining", void 0);
__decorate([
    (0, graphql_3.Field)(),
    __metadata("design:type", Date)
], CampaignForecast.prototype, "estimatedEndDate", void 0);
CampaignForecast = __decorate([
    (0, graphql_3.ObjectType)()
], CampaignForecast);
let BudgetAllocation = class BudgetAllocation {
};
__decorate([
    (0, graphql_3.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BudgetAllocation.prototype, "campaignId", void 0);
__decorate([
    (0, graphql_3.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], BudgetAllocation.prototype, "allocatedBudget", void 0);
BudgetAllocation = __decorate([
    (0, graphql_3.ObjectType)()
], BudgetAllocation);
let AdBudgetManagementResolver = class AdBudgetManagementResolver {
    constructor(budgetService, merchantService) {
        this.budgetService = budgetService;
        this.merchantService = merchantService;
    }
    async merchantBudgetUtilization(merchantId, user) {
        await this.validateMerchantAccess(user, merchantId);
        return this.budgetService.getBudgetUtilizationReport(merchantId);
    }
    async campaignBudgetForecast(campaignId, merchantId, user) {
        await this.validateMerchantAccess(user, merchantId);
        return this.budgetService.forecastRemainingDuration(campaignId);
    }
    async campaignDailyBudget(campaignId, merchantId, user) {
        await this.validateMerchantAccess(user, merchantId);
        return this.budgetService.calculateDailyBudget(campaignId);
    }
    async allocateBudgetAcrossCampaigns(merchantId, totalBudget, campaignIds, strategy, user) {
        await this.validateMerchantAccess(user, merchantId);
        const allocation = await this.budgetService.allocateBudgetAcrossCampaigns(merchantId, totalBudget, campaignIds, strategy);
        return Object.entries(allocation).map(([campaignId, allocatedBudget]) => ({
            campaignId,
            allocatedBudget,
        }));
    }
    async validateMerchantAccess(user, merchantId) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return;
        }
        const merchants = await this.merchantService.findByUserId(user.id);
        const hasAccess = merchants.some(m => m.id === merchantId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have permission to access this merchant');
        }
    }
};
exports.AdBudgetManagementResolver = AdBudgetManagementResolver;
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => BudgetUtilizationReport),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdBudgetManagementResolver.prototype, "merchantBudgetUtilization", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => CampaignForecast),
    __param(0, (0, graphql_1.Args)('campaignId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdBudgetManagementResolver.prototype, "campaignBudgetForecast", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => graphql_1.Float),
    __param(0, (0, graphql_1.Args)('campaignId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdBudgetManagementResolver.prototype, "campaignDailyBudget", null);
__decorate([
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => [BudgetAllocation]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('totalBudget', { type: () => graphql_1.Float })),
    __param(2, (0, graphql_1.Args)('campaignIds', { type: () => [graphql_1.ID] })),
    __param(3, (0, graphql_1.Args)('strategy', { type: () => ad_budget_management_service_1.BudgetAllocationStrategy, defaultValue: ad_budget_management_service_1.BudgetAllocationStrategy.EQUAL })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Array, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AdBudgetManagementResolver.prototype, "allocateBudgetAcrossCampaigns", null);
exports.AdBudgetManagementResolver = AdBudgetManagementResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [ad_budget_management_service_1.AdBudgetManagementService,
        merchant_service_1.MerchantService])
], AdBudgetManagementResolver);
//# sourceMappingURL=ad-budget-management.resolver.js.map