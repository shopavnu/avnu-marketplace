import { AdPlacementService } from './ad-placement.service.mock';
import { AdPlacementOptions, AdPlacementResult } from './entity-mocks';
export declare class AdPlacementResolver {
  private readonly adPlacementService;
  constructor(adPlacementService: AdPlacementService);
  getAdsForDiscoveryFeed(
    options: Partial<AdPlacementOptions>,
    user?: any,
  ): Promise<AdPlacementResult[]>;
  recordAdClick(campaignId: string, user?: any): Promise<boolean>;
  getRecommendedAdPlacements(user?: any, sessionId?: string): Promise<AdPlacementResult[]>;
}
