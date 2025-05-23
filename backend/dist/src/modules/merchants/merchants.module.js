"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const merchant_entity_1 = require("./entities/merchant.entity");
const merchant_brand_entity_1 = require("./entities/merchant-brand.entity");
const merchant_product_entity_1 = require("./entities/merchant-product.entity");
const merchant_shipping_entity_1 = require("./entities/merchant-shipping.entity");
const merchant_ad_campaign_entity_1 = require("./entities/merchant-ad-campaign.entity");
const merchant_analytics_entity_1 = require("./entities/merchant-analytics.entity");
const merchant_service_1 = require("./services/merchant.service");
const merchant_ad_campaign_service_1 = require("./services/merchant-ad-campaign.service");
const merchant_analytics_service_1 = require("./services/merchant-analytics.service");
const merchant_dashboard_analytics_service_1 = require("./services/merchant-dashboard-analytics.service");
const merchant_data_aggregation_service_1 = require("./services/merchant-data-aggregation.service");
const merchant_analytics_filter_service_1 = require("./services/merchant-analytics-filter.service");
const merchant_revenue_analytics_service_1 = require("./services/merchant-revenue-analytics.service");
const merchant_demographic_analytics_service_1 = require("./services/merchant-demographic-analytics.service");
const ad_budget_management_service_1 = require("./services/ad-budget-management.service");
const ad_placement_service_1 = require("./services/ad-placement.service");
const merchant_resolver_1 = require("./resolvers/merchant.resolver");
const merchant_ad_campaign_resolver_1 = require("./resolvers/merchant-ad-campaign.resolver");
const merchant_analytics_resolver_1 = require("./resolvers/merchant-analytics.resolver");
const merchant_dashboard_analytics_resolver_1 = require("./resolvers/merchant-dashboard-analytics.resolver");
const ad_budget_management_resolver_1 = require("./resolvers/ad-budget-management.resolver");
const ad_placement_resolver_1 = require("./resolvers/ad-placement.resolver");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const products_module_1 = require("../products/products.module");
let MerchantsModule = class MerchantsModule {
};
exports.MerchantsModule = MerchantsModule;
exports.MerchantsModule = MerchantsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                merchant_entity_1.Merchant,
                merchant_brand_entity_1.MerchantBrand,
                merchant_product_entity_1.MerchantProduct,
                merchant_shipping_entity_1.MerchantShipping,
                merchant_ad_campaign_entity_1.MerchantAdCampaign,
                merchant_analytics_entity_1.MerchantAnalytics,
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => products_module_1.ProductsModule),
        ],
        providers: [
            merchant_service_1.MerchantService,
            merchant_ad_campaign_service_1.MerchantAdCampaignService,
            merchant_analytics_service_1.MerchantAnalyticsService,
            merchant_dashboard_analytics_service_1.MerchantDashboardAnalyticsService,
            merchant_data_aggregation_service_1.MerchantDataAggregationService,
            merchant_analytics_filter_service_1.MerchantAnalyticsFilterService,
            merchant_revenue_analytics_service_1.MerchantRevenueAnalyticsService,
            merchant_demographic_analytics_service_1.MerchantDemographicAnalyticsService,
            ad_budget_management_service_1.AdBudgetManagementService,
            ad_placement_service_1.AdPlacementService,
            merchant_resolver_1.MerchantResolver,
            merchant_ad_campaign_resolver_1.MerchantAdCampaignResolver,
            merchant_analytics_resolver_1.MerchantAnalyticsResolver,
            merchant_dashboard_analytics_resolver_1.MerchantDashboardAnalyticsResolver,
            ad_budget_management_resolver_1.AdBudgetManagementResolver,
            ad_placement_resolver_1.AdPlacementResolver,
        ],
        exports: [
            merchant_service_1.MerchantService,
            merchant_ad_campaign_service_1.MerchantAdCampaignService,
            merchant_analytics_service_1.MerchantAnalyticsService,
            ad_budget_management_service_1.AdBudgetManagementService,
            ad_placement_service_1.AdPlacementService,
        ],
    })
], MerchantsModule);
//# sourceMappingURL=merchants.module.js.map