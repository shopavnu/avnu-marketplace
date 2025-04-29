import { AdPlacementService } from '../services/ad-placement.service';
import { User } from '../../users/entities/user.entity';
declare class AdPlacement {
    campaignId: string;
    merchantId: string;
    productIds: string[];
    type: string;
    relevanceScore: number;
    isSponsored: boolean;
    impressionCost: number;
}
declare class ProductAdRecommendation {
    productId: string;
    recommendedBudget: number;
    estimatedImpressions: number;
    estimatedClicks: number;
    estimatedConversions: number;
}
declare class AdPlacementOptionsInput {
    location?: string;
    interests?: string[];
    demographics?: string[];
    previouslyViewedProductIds?: string[];
    cartProductIds?: string[];
    purchasedProductIds?: string[];
    maxAds?: number;
}
export declare class AdPlacementResolver {
    private readonly adPlacementService;
    constructor(adPlacementService: AdPlacementService);
    getAdsForDiscoveryFeed(options?: AdPlacementOptionsInput, user?: User): Promise<AdPlacement[]>;
    recordAdClick(campaignId: string, user?: User): Promise<boolean>;
    getRecommendedAdPlacements(merchantId: string, _user: User): Promise<ProductAdRecommendation[]>;
}
export {};
