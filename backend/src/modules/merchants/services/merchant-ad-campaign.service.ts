import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MerchantAdCampaign,
  CampaignStatus,
  CampaignType,
} from '../entities/merchant-ad-campaign.entity';

@Injectable()
export class MerchantAdCampaignService {
  constructor(
    @InjectRepository(MerchantAdCampaign)
    private adCampaignRepository: Repository<MerchantAdCampaign>,
  ) {}

  async findAll(merchantId: string): Promise<MerchantAdCampaign[]> {
    return this.adCampaignRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, merchantId: string): Promise<MerchantAdCampaign> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id, merchantId },
    });

    if (!campaign) {
      throw new NotFoundException(`Ad campaign with ID ${id} not found for merchant ${merchantId}`);
    }

    return campaign;
  }

  async create(
    merchantId: string,
    campaignData: Partial<MerchantAdCampaign>,
  ): Promise<MerchantAdCampaign> {
    const campaign = this.adCampaignRepository.create({
      ...campaignData,
      merchantId,
      status: CampaignStatus.DRAFT,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      lastUpdatedByMerchantAt: new Date(),
    });

    return this.adCampaignRepository.save(campaign);
  }

  async update(
    id: string,
    merchantId: string,
    campaignData: Partial<MerchantAdCampaign>,
  ): Promise<MerchantAdCampaign> {
    await this.findOne(id, merchantId); // Verify campaign exists

    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        ...campaignData,
        lastUpdatedByMerchantAt: new Date(),
      },
    );

    return this.findOne(id, merchantId);
  }

  async updateStatus(
    id: string,
    merchantId: string,
    status: CampaignStatus,
  ): Promise<MerchantAdCampaign> {
    await this.findOne(id, merchantId); // Verify campaign exists

    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        status,
        lastUpdatedByMerchantAt: new Date(),
      },
    );

    return this.findOne(id, merchantId);
  }

  async delete(id: string, merchantId: string): Promise<boolean> {
    const result = await this.adCampaignRepository.delete({ id, merchantId });
    return result.affected > 0;
  }

  async getActiveCampaigns(merchantId: string): Promise<MerchantAdCampaign[]> {
    return this.adCampaignRepository.find({
      where: {
        merchantId,
        status: CampaignStatus.ACTIVE,
      },
    });
  }

  async getCampaignsByType(merchantId: string, type: CampaignType): Promise<MerchantAdCampaign[]> {
    return this.adCampaignRepository.find({
      where: {
        merchantId,
        type,
      },
    });
  }

  async getCampaignsForProduct(
    merchantId: string,
    productId: string,
  ): Promise<MerchantAdCampaign[]> {
    const campaigns = await this.adCampaignRepository.find({
      where: {
        merchantId,
      },
    });

    // Filter campaigns that include this product
    return campaigns.filter(campaign => campaign.productIds.includes(productId));
  }

  async recordCampaignImpression(id: string, merchantId: string): Promise<void> {
    const campaign = await this.findOne(id, merchantId);

    await this.adCampaignRepository.update(
      { id, merchantId },
      {
        impressions: (campaign.impressions || 0) + 1,
      },
    );
  }

  async recordCampaignClick(id: string, merchantId: string): Promise<void> {
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

  async recordCampaignConversion(id: string, merchantId: string, amount: number): Promise<void> {
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
        spent: campaign.spent + amount * 0.05, // Assuming 5% of sale goes to ad spend
      },
    );
  }

  async createRetargetingCampaign(
    merchantId: string,
    productIds: string[],
    budget: number,
  ): Promise<MerchantAdCampaign> {
    const startDate = new Date();
    // Set end date to 30 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return this.create(merchantId, {
      name: 'Retargeting Campaign',
      description:
        'Automatically created retargeting campaign for abandoned carts and product views',
      type: CampaignType.RETARGETING,
      status: CampaignStatus.ACTIVE,
      productIds,
      budget,
      startDate,
      endDate,
    });
  }
}
