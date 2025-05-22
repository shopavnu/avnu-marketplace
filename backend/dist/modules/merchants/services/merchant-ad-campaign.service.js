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
exports.MerchantAdCampaignService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const merchant_ad_campaign_entity_1 = require('../entities/merchant-ad-campaign.entity');
let MerchantAdCampaignService = class MerchantAdCampaignService {
  constructor(adCampaignRepository) {
    this.adCampaignRepository = adCampaignRepository;
  }
  async findAll(merchantId) {
    return this.adCampaignRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id, merchantId) {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id, merchantId },
    });
    if (!campaign) {
      throw new common_1.NotFoundException(
        `Ad campaign with ID ${id} not found for merchant ${merchantId}`,
      );
    }
    return campaign;
  }
  async create(merchantId, campaignData) {
    const campaign = this.adCampaignRepository.create({
      ...campaignData,
      merchantId,
      status: merchant_ad_campaign_entity_1.CampaignStatus.DRAFT,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      lastUpdatedByMerchantAt: new Date(),
    });
    return this.adCampaignRepository.save(campaign);
  }
  async update(id, merchantId, campaignData) {
    await this.findOne(id, merchantId);
    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        ...campaignData,
        lastUpdatedByMerchantAt: new Date(),
      },
    );
    return this.findOne(id, merchantId);
  }
  async updateStatus(id, merchantId, status) {
    await this.findOne(id, merchantId);
    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        status,
        lastUpdatedByMerchantAt: new Date(),
      },
    );
    return this.findOne(id, merchantId);
  }
  async delete(id, merchantId) {
    const result = await this.adCampaignRepository.delete({ id, merchantId });
    return result.affected > 0;
  }
  async getActiveCampaigns(merchantId) {
    return this.adCampaignRepository.find({
      where: {
        merchantId,
        status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE,
      },
    });
  }
  async getCampaignsByType(merchantId, type) {
    return this.adCampaignRepository.find({
      where: {
        merchantId,
        type,
      },
    });
  }
  async getCampaignsForProduct(merchantId, productId) {
    const campaigns = await this.adCampaignRepository.find({
      where: {
        merchantId,
      },
    });
    return campaigns.filter(campaign => campaign.productIds.includes(productId));
  }
  async recordCampaignImpression(id, merchantId) {
    const campaign = await this.findOne(id, merchantId);
    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        impressions: (campaign.impressions || 0) + 1,
      },
    );
  }
  async recordCampaignClick(id, merchantId) {
    const campaign = await this.findOne(id, merchantId);
    const newClicks = (campaign.clicks || 0) + 1;
    const clickThroughRate = campaign.impressions
      ? parseFloat((newClicks / campaign.impressions).toFixed(4))
      : 0;
    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        clicks: newClicks,
        clickThroughRate,
      },
    );
  }
  async recordCampaignConversion(id, merchantId, amount) {
    const campaign = await this.findOne(id, merchantId);
    const newConversions = (campaign.conversions || 0) + 1;
    const conversionRate = campaign.clicks
      ? parseFloat((newConversions / campaign.clicks).toFixed(4))
      : 0;
    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        conversions: newConversions,
        conversionRate,
        spent: campaign.spent + amount * 0.05,
      },
    );
  }
  async createRetargetingCampaign(merchantId, productIds, budget) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    return this.create(merchantId, {
      name: 'Retargeting Campaign',
      description:
        'Automatically created retargeting campaign for abandoned carts and product views',
      type: merchant_ad_campaign_entity_1.CampaignType.RETARGETING,
      status: merchant_ad_campaign_entity_1.CampaignStatus.ACTIVE,
      productIds,
      budget,
      startDate,
      endDate,
    });
  }
};
exports.MerchantAdCampaignService = MerchantAdCampaignService;
exports.MerchantAdCampaignService = MerchantAdCampaignService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_ad_campaign_entity_1.MerchantAdCampaign)),
    __metadata('design:paramtypes', [typeorm_2.Repository]),
  ],
  MerchantAdCampaignService,
);
//# sourceMappingURL=merchant-ad-campaign.service.js.map
