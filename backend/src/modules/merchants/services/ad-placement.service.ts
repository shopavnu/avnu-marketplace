import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MerchantAdCampaign,
  CampaignStatus,
  TargetAudience,
} from '../entities/merchant-ad-campaign.entity';
import { AdBudgetManagementService } from './ad-budget-management.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface AdPlacementOptions {
  userId?: string;
  sessionId?: string;
  location?: string;
  interests?: string[];
  demographics?: string[];
  previouslyViewedProductIds?: string[];
  cartProductIds?: string[];
  purchasedProductIds?: string[];
  maxAds?: number;
}

export interface AdPlacementResult {
  campaignId: string;
  merchantId: string;
  productIds: string[];
  type: string;
  relevanceScore: number;
  isSponsored: boolean;
  impressionCost: number;
}

@Injectable()
export class AdPlacementService {
  private readonly logger = new Logger(AdPlacementService.name);

  constructor(
    @InjectRepository(MerchantAdCampaign)
    private adCampaignRepository: Repository<MerchantAdCampaign>,
    private budgetService: AdBudgetManagementService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get ads for the discovery feed based on user context and targeting
   */
  async getAdsForDiscoveryFeed(options: AdPlacementOptions): Promise<AdPlacementResult[]> {
    const { maxAds = 2 } = options;

    // Get all active campaigns
    const activeCampaigns = await this.adCampaignRepository.find({
      where: { status: CampaignStatus.ACTIVE },
    });

    if (activeCampaigns.length === 0) {
      return [];
    }

    // Score campaigns based on targeting relevance
    const scoredCampaigns = await Promise.all(
      activeCampaigns.map(async campaign => {
        const relevanceScore = await this.calculateRelevanceScore(campaign, options);
        const impressionCost = await this.budgetService.calculateCostPerImpression(campaign.id);

        return {
          campaign,
          relevanceScore,
          impressionCost,
        };
      }),
    );

    // Sort by relevance score (descending)
    scoredCampaigns.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Select top N campaigns
    const selectedCampaigns = scoredCampaigns.slice(0, maxAds);

    // Record impressions and budget spend
    const results: AdPlacementResult[] = [];

    for (const { campaign, relevanceScore, impressionCost } of selectedCampaigns) {
      try {
        // Record the ad spend
        const budgetResult = await this.budgetService.recordAdSpend(
          campaign.id,
          impressionCost,
          1, // 1 impression
        );

        // If budget is not exhausted, include the ad
        if (!budgetResult.budgetExhausted) {
          results.push({
            campaignId: campaign.id,
            merchantId: campaign.merchantId,
            productIds: campaign.productIds,
            type: campaign.type,
            relevanceScore,
            isSponsored: true,
            impressionCost,
          });
        }

        // Emit event for analytics
        this.eventEmitter.emit('ad.impression', {
          campaignId: campaign.id,
          merchantId: campaign.merchantId,
          userId: options.userId,
          sessionId: options.sessionId,
          timestamp: new Date(),
          relevanceScore,
          impressionCost,
        });
      } catch (error) {
        this.logger.error(`Error recording ad impression for campaign ${campaign.id}`, error);
      }
    }

    return results;
  }

  /**
   * Calculate relevance score for a campaign based on targeting criteria
   */
  private async calculateRelevanceScore(
    campaign: MerchantAdCampaign,
    options: AdPlacementOptions,
  ): Promise<number> {
    let score = 1.0; // Base score

    // Target audience matching
    if (campaign.targetAudience !== TargetAudience.ALL && options.userId) {
      switch (campaign.targetAudience) {
        case TargetAudience.PREVIOUS_VISITORS:
          if (!options.previouslyViewedProductIds?.some(id => campaign.productIds.includes(id))) {
            score *= 0.5; // Reduce score if user hasn't viewed these products
          } else {
            score *= 1.5; // Boost score for previous visitors
          }
          break;

        case TargetAudience.CART_ABANDONERS:
          if (!options.cartProductIds?.some(id => campaign.productIds.includes(id))) {
            score *= 0.3; // Significantly reduce score if user doesn't have these products in cart
          } else {
            score *= 2.0; // Significantly boost score for cart abandoners
          }
          break;

        case TargetAudience.PREVIOUS_CUSTOMERS:
          if (!options.purchasedProductIds?.some(id => campaign.productIds.includes(id))) {
            score *= 0.4; // Reduce score if user hasn't purchased from this merchant
          } else {
            score *= 1.8; // Boost score for previous customers
          }
          break;
      }
    }

    // Location targeting
    if (campaign.targetLocations?.length && options.location) {
      const locationMatch = campaign.targetLocations.some(location =>
        options.location?.toLowerCase().includes(location.toLowerCase()),
      );

      if (!locationMatch) {
        score *= 0.7; // Reduce score if location doesn't match
      } else {
        score *= 1.2; // Boost score for location match
      }
    }

    // Interest targeting
    if (campaign.targetInterests?.length && options.interests?.length) {
      const interestMatches = campaign.targetInterests.filter(interest =>
        options.interests?.some(userInterest =>
          userInterest.toLowerCase().includes(interest.toLowerCase()),
        ),
      );

      if (interestMatches.length === 0) {
        score *= 0.6; // Reduce score if no interests match
      } else {
        // Boost score based on percentage of matching interests
        const matchRatio = interestMatches.length / campaign.targetInterests.length;
        score *= 1 + matchRatio;
      }
    }

    // Demographic targeting
    if (campaign.targetDemographics?.length && options.demographics?.length) {
      const demographicMatches = campaign.targetDemographics.filter(demographic =>
        options.demographics?.some(userDemographic =>
          userDemographic.toLowerCase().includes(demographic.toLowerCase()),
        ),
      );

      if (demographicMatches.length === 0) {
        score *= 0.8; // Reduce score if no demographics match
      } else {
        // Boost score based on percentage of matching demographics
        const matchRatio = demographicMatches.length / campaign.targetDemographics.length;
        score *= 1 + matchRatio * 0.5;
      }
    }

    // Apply a small random factor to prevent identical scores
    const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
    score *= randomFactor;

    return Math.max(0.1, Math.min(10, score)); // Clamp score between 0.1 and 10
  }

  /**
   * Record a click on an ad
   */
  async recordAdClick(campaignId: string, userId?: string, sessionId?: string): Promise<void> {
    const campaign = await this.adCampaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found`);
    }

    const newClicks = (campaign.clicks || 0) + 1;
    const clickThroughRate = campaign.impressions
      ? parseFloat((newClicks / campaign.impressions).toFixed(4))
      : 0;

    await this.adCampaignRepository.update(
      { id: campaignId },
      {
        clicks: newClicks,
        clickThroughRate,
      },
    );

    // Calculate cost per click
    const costPerClick = await this.budgetService.calculateCostPerClick(campaignId);

    // Record additional spend for the click
    await this.budgetService.recordAdSpend(campaignId, costPerClick, 0);

    // Emit event for analytics
    this.eventEmitter.emit('ad.click', {
      campaignId,
      merchantId: campaign.merchantId,
      userId,
      sessionId,
      timestamp: new Date(),
      costPerClick,
    });
  }

  /**
   * Get recommended ad placements for a merchant's products
   */
  async getRecommendedPlacements(merchantId: string): Promise<
    {
      productId: string;
      recommendedBudget: number;
      estimatedImpressions: number;
      estimatedClicks: number;
      estimatedConversions: number;
    }[]
  > {
    // Get merchant's active campaigns
    const activeCampaigns = await this.adCampaignRepository.find({
      where: { merchantId, status: CampaignStatus.ACTIVE },
    });

    // Get all product IDs from campaigns
    const allProductIds = new Set<string>();
    activeCampaigns.forEach(campaign => {
      campaign.productIds.forEach(id => allProductIds.add(id));
    });

    // Calculate performance metrics for each product
    const recommendations = Array.from(allProductIds).map(productId => {
      // Find campaigns featuring this product
      const productCampaigns = activeCampaigns.filter(campaign =>
        campaign.productIds.includes(productId),
      );

      // Calculate average metrics
      const totalImpressions = productCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const totalClicks = productCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const totalConversions = productCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

      const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0.01; // Default 1% if no data
      const avgCVR = totalClicks > 0 ? totalConversions / totalClicks : 0.02; // Default 2% if no data

      // Calculate recommended budget based on performance
      const performanceScore = avgCTR * 0.6 + avgCVR * 0.4; // Weight CTR and CVR
      const baseRecommendedBudget = 100; // Base budget of $100
      const recommendedBudget = baseRecommendedBudget * (1 + performanceScore * 10);

      // Estimate future performance
      const estimatedImpressions = recommendedBudget / 0.01; // Assuming $0.01 per impression
      const estimatedClicks = estimatedImpressions * avgCTR;
      const estimatedConversions = estimatedClicks * avgCVR;

      return {
        productId,
        recommendedBudget: Math.round(recommendedBudget * 100) / 100, // Round to 2 decimal places
        estimatedImpressions: Math.round(estimatedImpressions),
        estimatedClicks: Math.round(estimatedClicks),
        estimatedConversions: Math.round(estimatedConversions),
      };
    });

    return recommendations;
  }
}
