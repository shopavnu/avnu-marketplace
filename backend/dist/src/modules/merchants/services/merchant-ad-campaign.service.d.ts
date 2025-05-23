import { Repository } from 'typeorm';
import { MerchantAdCampaign, CampaignStatus, CampaignType } from '../entities/merchant-ad-campaign.entity';
export declare class MerchantAdCampaignService {
    private adCampaignRepository;
    constructor(adCampaignRepository: Repository<MerchantAdCampaign>);
    findAll(merchantId: string): Promise<MerchantAdCampaign[]>;
    findOne(id: string, merchantId: string): Promise<MerchantAdCampaign>;
    create(merchantId: string, campaignData: Partial<MerchantAdCampaign>): Promise<MerchantAdCampaign>;
    update(id: string, merchantId: string, campaignData: Partial<MerchantAdCampaign>): Promise<MerchantAdCampaign>;
    updateStatus(id: string, merchantId: string, status: CampaignStatus): Promise<MerchantAdCampaign>;
    delete(id: string, merchantId: string): Promise<boolean>;
    getActiveCampaigns(merchantId: string): Promise<MerchantAdCampaign[]>;
    getCampaignsByType(merchantId: string, type: CampaignType): Promise<MerchantAdCampaign[]>;
    getCampaignsForProduct(merchantId: string, productId: string): Promise<MerchantAdCampaign[]>;
    recordCampaignImpression(id: string, merchantId: string): Promise<void>;
    recordCampaignClick(id: string, merchantId: string): Promise<void>;
    recordCampaignConversion(id: string, merchantId: string, amount: number): Promise<void>;
    createRetargetingCampaign(merchantId: string, productIds: string[], budget: number): Promise<MerchantAdCampaign>;
}
