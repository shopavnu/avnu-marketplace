'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AdPlacementResolver = void 0;
const common_1 = require('@nestjs/common');
const ad_placement_service_mock_1 = require('./ad-placement.service.mock');
let AdPlacementResolver = class AdPlacementResolver {
  constructor(adPlacementService) {
    this.adPlacementService = adPlacementService;
  }
  async getAdsForDiscoveryFeed(options, user) {
    const userId = user?.id;
    const sessionId = !userId ? `anonymous-${Date.now()}` : undefined;
    return this.adPlacementService.getAdsForDiscoveryFeed({
      ...options,
      userId,
      sessionId,
    });
  }
  async recordAdClick(campaignId, user) {
    const userId = user?.id;
    const sessionId = !userId ? `anonymous-${Date.now()}` : undefined;
    return this.adPlacementService.recordAdClick(campaignId, userId, sessionId);
  }
  async getRecommendedAdPlacements(user, sessionId) {
    const userId = user?.id;
    return this.adPlacementService.getRecommendedAdPlacements(userId, sessionId);
  }
};
exports.AdPlacementResolver = AdPlacementResolver;
exports.AdPlacementResolver = AdPlacementResolver = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [ad_placement_service_mock_1.AdPlacementService]),
  ],
  AdPlacementResolver,
);
//# sourceMappingURL=ad-placement.resolver.mock.js.map
