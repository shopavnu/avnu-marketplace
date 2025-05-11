import { EngagementTypeCount } from './engagement-type-count.dto';
import { ProductInteractionCount } from './product-interaction-count.dto';
export declare class UserEngagementSummaryDto {
  userEngagementByType?: EngagementTypeCount[];
  topViewedProducts?: ProductInteractionCount[];
  topFavoritedProducts?: ProductInteractionCount[];
  userEngagementFunnel?: any;
  userRetentionMetrics?: any;
}
