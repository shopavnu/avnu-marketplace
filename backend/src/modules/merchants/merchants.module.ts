import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Entities
import { Merchant } from './entities/merchant.entity';
import { MerchantBrand } from './entities/merchant-brand.entity';
import { MerchantProduct } from './entities/merchant-product.entity';
import { MerchantShipping } from './entities/merchant-shipping.entity';
import { MerchantAdCampaign } from './entities/merchant-ad-campaign.entity';
import { MerchantAnalytics } from './entities/merchant-analytics.entity';

// Services
import { MerchantService } from './services/merchant.service';
import { MerchantAdCampaignService } from './services/merchant-ad-campaign.service';
import { MerchantAnalyticsService } from './services/merchant-analytics.service';
import { MerchantDashboardAnalyticsService } from './services/merchant-dashboard-analytics.service';
import { MerchantDataAggregationService } from './services/merchant-data-aggregation.service';
import { MerchantAnalyticsFilterService } from './services/merchant-analytics-filter.service';
import { MerchantRevenueAnalyticsService } from './services/merchant-revenue-analytics.service';
import { MerchantDemographicAnalyticsService } from './services/merchant-demographic-analytics.service';
import { AdBudgetManagementService } from './services/ad-budget-management.service';
import { AdPlacementService } from './services/ad-placement.service';

// Resolvers
import { MerchantResolver } from './resolvers/merchant.resolver';
import { MerchantAdCampaignResolver } from './resolvers/merchant-ad-campaign.resolver';
import { MerchantAnalyticsResolver } from './resolvers/merchant-analytics.resolver';
import { MerchantDashboardAnalyticsResolver } from './resolvers/merchant-dashboard-analytics.resolver';
import { AdBudgetManagementResolver } from './resolvers/ad-budget-management.resolver';
import { AdPlacementResolver } from './resolvers/ad-placement.resolver';

// Related modules
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      MerchantBrand,
      MerchantProduct,
      MerchantShipping,
      MerchantAdCampaign,
      MerchantAnalytics,
    ]),
    EventEmitterModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ProductsModule),
  ],
  providers: [
    // Services
    MerchantService,
    MerchantAdCampaignService,
    MerchantAnalyticsService,
    MerchantDashboardAnalyticsService,
    MerchantDataAggregationService,
    MerchantAnalyticsFilterService,
    MerchantRevenueAnalyticsService,
    MerchantDemographicAnalyticsService,
    AdBudgetManagementService,
    AdPlacementService,

    // Resolvers
    MerchantResolver,
    MerchantAdCampaignResolver,
    MerchantAnalyticsResolver,
    MerchantDashboardAnalyticsResolver,
    AdBudgetManagementResolver,
    AdPlacementResolver,
  ],
  exports: [
    MerchantService,
    MerchantAdCampaignService,
    MerchantAnalyticsService,
    AdBudgetManagementService,
    AdPlacementService,
  ],
})
export class MerchantsModule {}
