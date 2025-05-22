import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MerchantAdMetrics } from '../dto/merchant-ad-metrics.dto';
import { MerchantAdMetricsService } from '../services/merchant-ad-metrics.service';

@Resolver(() => MerchantAdMetrics)
export class MerchantAdMetricsResolver {
  constructor(private merchantAdMetricsService: MerchantAdMetricsService) {}

  @Query(() => MerchantAdMetrics)
  async merchantAdMetrics(
    @Args('period', { type: () => Int, nullable: true }) period?: number,
    @Args('merchantId', { nullable: true }) merchantId?: string,
  ): Promise<MerchantAdMetrics> {
    return this.merchantAdMetricsService.getMerchantAdMetrics(period, merchantId);
  }
}
