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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AdBudgetManagementResolver = void 0;
const common_1 = require('@nestjs/common');
const ad_budget_management_service_mock_1 = require('./ad-budget-management.service.mock');
const entity_mocks_1 = require('./entity-mocks');
let AdBudgetManagementResolver = class AdBudgetManagementResolver {
  constructor(budgetService) {
    this.budgetService = budgetService;
  }
  async merchantBudgetUtilization(merchantId, _user) {
    return this.budgetService.getBudgetUtilization(merchantId);
  }
  async merchantBudgetForecast(merchantId, _user) {
    return this.budgetService.getBudgetForecast(merchantId);
  }
  async merchantDailyBudget(merchantId, _user) {
    return this.budgetService.getDailyBudget(merchantId);
  }
  async allocateBudgetAcrossCampaigns(
    merchantId,
    totalBudget,
    campaignIds,
    strategy = entity_mocks_1.BudgetAllocationStrategy.EQUAL,
    _user,
  ) {
    return this.budgetService.allocateBudgetAcrossCampaigns(
      merchantId,
      campaignIds,
      totalBudget,
      strategy,
    );
  }
};
exports.AdBudgetManagementResolver = AdBudgetManagementResolver;
exports.AdBudgetManagementResolver = AdBudgetManagementResolver = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [
      ad_budget_management_service_mock_1.AdBudgetManagementService,
    ]),
  ],
  AdBudgetManagementResolver,
);
//# sourceMappingURL=ad-budget-management.resolver.mock.js.map
