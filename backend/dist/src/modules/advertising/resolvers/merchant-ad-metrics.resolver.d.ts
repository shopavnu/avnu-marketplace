import { MerchantAdMetrics } from '../dto/merchant-ad-metrics.dto';
import { MerchantAdMetricsService } from '../services/merchant-ad-metrics.service';
export declare class MerchantAdMetricsResolver {
    private merchantAdMetricsService;
    constructor(merchantAdMetricsService: MerchantAdMetricsService);
    merchantAdMetrics(period?: number, merchantId?: string): Promise<MerchantAdMetrics>;
}
