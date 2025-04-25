import { Injectable } from '@nestjs/common';
import { AdPlacementService } from './ad-placement.service.mock';
import { AdPlacementOptions, AdPlacementResult } from './entity-mocks';

@Injectable()
export class AdPlacementResolver {
  constructor(private readonly adPlacementService: AdPlacementService) {}

  async getAdsForDiscoveryFeed(
    options: Partial<AdPlacementOptions>,
    user?: any,
  ): Promise<AdPlacementResult[]> {
    const userId = user?.id;
    const sessionId = !userId ? `anonymous-${Date.now()}` : undefined;

    return this.adPlacementService.getAdsForDiscoveryFeed({
      ...options,
      userId,
      sessionId,
    });
  }

  async recordAdClick(campaignId: string, user?: any): Promise<boolean> {
    const userId = user?.id;
    const sessionId = !userId ? `anonymous-${Date.now()}` : undefined;

    return this.adPlacementService.recordAdClick(campaignId, userId, sessionId);
  }

  async getRecommendedAdPlacements(user?: any, sessionId?: string): Promise<AdPlacementResult[]> {
    const userId = user?.id;
    return this.adPlacementService.getRecommendedAdPlacements(userId, sessionId);
  }
}
