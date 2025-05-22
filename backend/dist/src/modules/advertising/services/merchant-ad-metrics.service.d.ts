import { MerchantAdMetrics } from '../dto/merchant-ad-metrics.dto';
export declare class MerchantAdMetricsService {
  getMerchantAdMetrics(period?: number, merchantId?: string): Promise<MerchantAdMetrics>;
  private generateMockCampaigns;
  private generateHistoricalMetrics;
  private generateDailyMetrics;
}
