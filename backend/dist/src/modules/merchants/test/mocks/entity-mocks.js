'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.BudgetAllocationStrategy = exports.CampaignType = exports.CampaignStatus = void 0;
var CampaignStatus;
(function (CampaignStatus) {
  CampaignStatus['DRAFT'] = 'DRAFT';
  CampaignStatus['ACTIVE'] = 'ACTIVE';
  CampaignStatus['PAUSED'] = 'PAUSED';
  CampaignStatus['COMPLETED'] = 'COMPLETED';
  CampaignStatus['ARCHIVED'] = 'ARCHIVED';
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var CampaignType;
(function (CampaignType) {
  CampaignType['PRODUCT_PROMOTION'] = 'PRODUCT_PROMOTION';
  CampaignType['BRAND_AWARENESS'] = 'BRAND_AWARENESS';
  CampaignType['RETARGETING'] = 'RETARGETING';
  CampaignType['SEASONAL'] = 'SEASONAL';
  CampaignType['CLEARANCE'] = 'CLEARANCE';
})(CampaignType || (exports.CampaignType = CampaignType = {}));
var BudgetAllocationStrategy;
(function (BudgetAllocationStrategy) {
  BudgetAllocationStrategy['EQUAL'] = 'equal';
  BudgetAllocationStrategy['PERFORMANCE_BASED'] = 'performance_based';
  BudgetAllocationStrategy['TIME_BASED'] = 'time_based';
})(BudgetAllocationStrategy || (exports.BudgetAllocationStrategy = BudgetAllocationStrategy = {}));
//# sourceMappingURL=entity-mocks.js.map
