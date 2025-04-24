"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adServiceProviders = void 0;
const ad_budget_management_service_1 = require("../services/ad-budget-management.service");
const ad_placement_service_1 = require("../services/ad-placement.service");
exports.adServiceProviders = [
    ad_budget_management_service_1.AdBudgetManagementService,
    ad_placement_service_1.AdPlacementService,
];
//# sourceMappingURL=ad-services.providers.js.map