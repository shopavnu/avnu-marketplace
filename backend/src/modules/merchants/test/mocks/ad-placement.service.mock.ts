import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdPlacementOptions, AdPlacementResult } from './entity-mocks';

@Injectable()
export class AdPlacementService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async getAdsForDiscoveryFeed(options: AdPlacementOptions): Promise<AdPlacementResult[]> {
    return [
      {
        campaignId: '1',
        merchantId: 'merchant1',
        productIds: ['product1', 'product2'],
        type: 'PRODUCT_PROMOTION',
        relevanceScore: 0.85,
        isSponsored: true,
        impressionCost: 0.25,
      },
      {
        campaignId: '2',
        merchantId: 'merchant1',
        productIds: ['product3'],
        type: 'BRAND_AWARENESS',
        relevanceScore: 0.75,
        isSponsored: true,
        impressionCost: 0.2,
      },
    ];
  }

  async getRecommendedAdPlacements(
    userId: string,
    sessionId?: string,
  ): Promise<AdPlacementResult[]> {
    return [
      {
        campaignId: '1',
        merchantId: 'merchant1',
        productIds: ['product1', 'product2'],
        type: 'PRODUCT_PROMOTION',
        relevanceScore: 0.85,
        isSponsored: true,
        impressionCost: 0.25,
      },
    ];
  }

  async recordAdClick(campaignId: string, userId?: string, sessionId?: string): Promise<boolean> {
    this.eventEmitter.emit('ad.click', {
      campaignId,
      userId,
      sessionId,
      timestamp: new Date(),
    });
    return true;
  }
}
