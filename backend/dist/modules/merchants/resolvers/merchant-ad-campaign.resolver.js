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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MerchantAdCampaignResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const merchant_ad_campaign_service_1 = require('../services/merchant-ad-campaign.service');
const merchant_service_1 = require('../services/merchant.service');
const merchant_ad_campaign_entity_1 = require('../entities/merchant-ad-campaign.entity');
const current_user_decorator_1 = require('../../auth/decorators/current-user.decorator');
const merchant_only_decorator_1 = require('../../auth/decorators/merchant-only.decorator');
const user_entity_1 = require('../../users/entities/user.entity');
const dto_1 = require('../dto');
let MerchantAdCampaignResolver = class MerchantAdCampaignResolver {
  constructor(adCampaignService, merchantService) {
    this.adCampaignService = adCampaignService;
    this.merchantService = merchantService;
  }
  async merchantAdCampaigns(merchantId, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.findAll(merchantId);
  }
  async merchantAdCampaign(id, merchantId, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.findOne(id, merchantId);
  }
  async activeMerchantAdCampaigns(merchantId, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.getActiveCampaigns(merchantId);
  }
  async merchantAdCampaignsByType(merchantId, type, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.getCampaignsByType(merchantId, type);
  }
  async merchantAdCampaignsForProduct(merchantId, productId, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.getCampaignsForProduct(merchantId, productId);
  }
  async createMerchantAdCampaign(merchantId, input, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.create(merchantId, input);
  }
  async updateMerchantAdCampaign(id, merchantId, input, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.update(id, merchantId, input);
  }
  async updateMerchantAdCampaignStatus(id, merchantId, status, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.updateStatus(id, merchantId, status);
  }
  async deleteMerchantAdCampaign(id, merchantId, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.delete(id, merchantId);
  }
  async createRetargetingCampaign(merchantId, productIds, budget, user) {
    await this.validateMerchantAccess(user, merchantId);
    return this.adCampaignService.createRetargetingCampaign(merchantId, productIds, budget);
  }
  async validateMerchantAccess(user, merchantId) {
    if (user.role === user_entity_1.UserRole.ADMIN) {
      return;
    }
    const merchants = await this.merchantService.findByUserId(user.id);
    const hasAccess = merchants.some(m => m.id === merchantId);
    if (!hasAccess) {
      throw new common_1.ForbiddenException('You do not have permission to access this merchant');
    }
  }
};
exports.MerchantAdCampaignResolver = MerchantAdCampaignResolver;
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_ad_campaign_entity_1.MerchantAdCampaign]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'merchantAdCampaigns',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'merchantAdCampaign',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_ad_campaign_entity_1.MerchantAdCampaign]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'activeMerchantAdCampaigns',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_ad_campaign_entity_1.MerchantAdCampaign]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(
      1,
      (0, graphql_1.Args)('type', { type: () => merchant_ad_campaign_entity_1.CampaignType }),
    ),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'merchantAdCampaignsByType',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Query)(() => [merchant_ad_campaign_entity_1.MerchantAdCampaign]),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'merchantAdCampaignsForProduct',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, dto_1.CreateAdCampaignInput, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'createMerchantAdCampaign',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('input')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      dto_1.UpdateAdCampaignInput,
      user_entity_1.User,
    ]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'updateMerchantAdCampaign',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(
      2,
      (0, graphql_1.Args)('status', { type: () => merchant_ad_campaign_entity_1.CampaignStatus }),
    ),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'updateMerchantAdCampaignStatus',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'deleteMerchantAdCampaign',
  null,
);
__decorate(
  [
    (0, merchant_only_decorator_1.MerchantOnly)(),
    (0, graphql_1.Mutation)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('productIds', { type: () => [graphql_1.ID] })),
    __param(2, (0, graphql_1.Args)('budget', { type: () => Number })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Array, Number, user_entity_1.User]),
    __metadata('design:returntype', Promise),
  ],
  MerchantAdCampaignResolver.prototype,
  'createRetargetingCampaign',
  null,
);
exports.MerchantAdCampaignResolver = MerchantAdCampaignResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => merchant_ad_campaign_entity_1.MerchantAdCampaign),
    __metadata('design:paramtypes', [
      merchant_ad_campaign_service_1.MerchantAdCampaignService,
      merchant_service_1.MerchantService,
    ]),
  ],
  MerchantAdCampaignResolver,
);
//# sourceMappingURL=merchant-ad-campaign.resolver.js.map
