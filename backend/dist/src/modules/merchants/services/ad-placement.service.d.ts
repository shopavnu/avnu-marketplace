import { Repository } from 'typeorm';
import { MerchantAdCampaign } from '../entities/merchant-ad-campaign.entity';
import { AdBudgetManagementService } from './ad-budget-management.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface AdPlacementOptions {
  userId?: string;
  sessionId?: string;
  location?: string;
  interests?: string[];
  demographics?: string[];
  previouslyViewedProductIds?: string[];
  cartProductIds?: string[];
  purchasedProductIds?: string[];
  maxAds?: number;
}
export interface AdPlacementResult {
  campaignId: string;
  merchantId: string;
  productIds: string[];
  type: string;
  relevanceScore: number;
  isSponsored: boolean;
  impressionCost: number;
}
export declare class AdPlacementService {
  private adCampaignRepository;
  private budgetService;
  private eventEmitter;
  private readonly logger;
  constructor(
    adCampaignRepository: Repository<MerchantAdCampaign>,
    budgetService: AdBudgetManagementService,
    eventEmitter: EventEmitter2,
  );
  getAdsForDiscoveryFeed(options: AdPlacementOptions): Promise<AdPlacementResult[]>;
  private calculateRelevanceScore;
  recordAdClick(campaignId: string, userId?: string, sessionId?: string): Promise<void>;
  getRecommendedPlacements(merchantId: string): Promise<
    {
      productId: string;
      recommendedBudget: number;
      estimatedImpressions: number;
      estimatedClicks: number;
      estimatedConversions: number;
    }[]
  >;
}
