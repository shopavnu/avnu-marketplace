import { Module } from '@nestjs/common';
import { MerchantAdMetricsService } from './services/merchant-ad-metrics.service';
import { MerchantAdMetricsResolver } from './resolvers/merchant-ad-metrics.resolver';

@Module({
  providers: [MerchantAdMetricsService, MerchantAdMetricsResolver],
  exports: [MerchantAdMetricsService],
})
export class AdvertisingModule {}
