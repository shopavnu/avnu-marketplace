import { MerchantAdCampaignService } from '../services/merchant-ad-campaign.service';
import { MerchantService } from '../services/merchant.service';
import {
  MerchantAdCampaign,
  CampaignStatus,
  CampaignType,
} from '../entities/merchant-ad-campaign.entity';
import { User } from '../../users/entities/user.entity';
import { CreateAdCampaignInput, UpdateAdCampaignInput } from '../dto';
export declare class MerchantAdCampaignResolver {
  private readonly adCampaignService;
  private readonly merchantService;
  constructor(adCampaignService: MerchantAdCampaignService, merchantService: MerchantService);
  merchantAdCampaigns(merchantId: string, user: User): Promise<MerchantAdCampaign[]>;
  merchantAdCampaign(id: string, merchantId: string, user: User): Promise<MerchantAdCampaign>;
  activeMerchantAdCampaigns(merchantId: string, user: User): Promise<MerchantAdCampaign[]>;
  merchantAdCampaignsByType(
    merchantId: string,
    type: CampaignType,
    user: User,
  ): Promise<MerchantAdCampaign[]>;
  merchantAdCampaignsForProduct(
    merchantId: string,
    productId: string,
    user: User,
  ): Promise<MerchantAdCampaign[]>;
  createMerchantAdCampaign(
    merchantId: string,
    input: CreateAdCampaignInput,
    user: User,
  ): Promise<MerchantAdCampaign>;
  updateMerchantAdCampaign(
    id: string,
    merchantId: string,
    input: UpdateAdCampaignInput,
    user: User,
  ): Promise<MerchantAdCampaign>;
  updateMerchantAdCampaignStatus(
    id: string,
    merchantId: string,
    status: CampaignStatus,
    user: User,
  ): Promise<MerchantAdCampaign>;
  deleteMerchantAdCampaign(id: string, merchantId: string, user: User): Promise<boolean>;
  createRetargetingCampaign(
    merchantId: string,
    productIds: string[],
    budget: number,
    user: User,
  ): Promise<MerchantAdCampaign>;
  private validateMerchantAccess;
}
