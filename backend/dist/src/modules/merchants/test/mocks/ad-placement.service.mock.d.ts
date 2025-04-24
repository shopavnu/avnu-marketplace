import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdPlacementOptions, AdPlacementResult } from './entity-mocks';
export declare class AdPlacementService {
    private readonly eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    getAdsForDiscoveryFeed(options: AdPlacementOptions): Promise<AdPlacementResult[]>;
    getRecommendedAdPlacements(userId: string, sessionId?: string): Promise<AdPlacementResult[]>;
    recordAdClick(campaignId: string, userId?: string, sessionId?: string): Promise<boolean>;
}
