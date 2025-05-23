import { CampaignType, TargetAudience } from '../entities/merchant-ad-campaign.entity';
export declare class UpdateAdCampaignInput {
    name?: string;
    description?: string;
    type?: CampaignType;
    productIds?: string[];
    budget?: number;
    targetAudience?: TargetAudience;
    targetDemographics?: string[];
    targetLocations?: string[];
    targetInterests?: string[];
    startDate?: Date;
    endDate?: Date;
}
