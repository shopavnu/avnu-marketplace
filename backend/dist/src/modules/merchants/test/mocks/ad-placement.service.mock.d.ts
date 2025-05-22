import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdPlacementOptions, AdPlacementResult } from './entity-mocks';
export declare class AdPlacementService {
  private readonly eventEmitter;
  constructor(eventEmitter: EventEmitter2);
  getAdsForDiscoveryFeed(_options: AdPlacementOptions): Promise<AdPlacementResult[]>;
  getRecommendedAdPlacements(_userId: string, _sessionId?: string): Promise<AdPlacementResult[]>;
  recordAdClick(campaignId: string, _userId?: string, _sessionId?: string): Promise<boolean>;
}
