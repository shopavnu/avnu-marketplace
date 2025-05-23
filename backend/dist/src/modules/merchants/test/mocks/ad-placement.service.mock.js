"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdPlacementService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
let AdPlacementService = class AdPlacementService {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    async getAdsForDiscoveryFeed(_options) {
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
    async getRecommendedAdPlacements(_userId, _sessionId) {
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
    async recordAdClick(campaignId, _userId, _sessionId) {
        this.eventEmitter.emit('ad.click', {
            campaignId,
            _userId,
            _sessionId,
            timestamp: new Date(),
        });
        return true;
    }
};
exports.AdPlacementService = AdPlacementService;
exports.AdPlacementService = AdPlacementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], AdPlacementService);
//# sourceMappingURL=ad-placement.service.mock.js.map