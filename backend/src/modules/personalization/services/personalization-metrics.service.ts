import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import {
  PersonalizationMetricsDto,
  MetricComparisonDto,
  HistoricalDataDto,
  CategoryPercentageDto,
} from '../dto/personalization-metrics.dto';
import { CategoryService } from '../../products/services/category.service';

@Injectable()
export class PersonalizationMetricsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionInteractionEntity)
    private readonly interactionRepository: Repository<SessionInteractionEntity>,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   * Get personalization metrics for the admin dashboard
   * @param days Number of days to analyze
   * @returns PersonalizationMetricsDto with metrics data
   */
  async getPersonalizationMetrics(days: number = 30): Promise<PersonalizationMetricsDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all sessions and interactions within the time period
    const sessions = await this.sessionRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      relations: ['interactions'],
    });

    // Get all interactions within the time period
    const interactions = await this.interactionRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      relations: ['session'],
    });

    // Calculate metrics
    const conversionRate = await this.calculateConversionRate(sessions, interactions);
    const clickThroughRate = await this.calculateClickThroughRate(sessions, interactions);
    const averageOrderValue = await this.calculateAverageOrderValue(sessions, interactions);
    const timeOnSite = await this.calculateTimeOnSite(sessions);
    const recommendationAccuracy = await this.calculateRecommendationAccuracy(interactions);
    const userSatisfaction = await this.calculateUserSatisfaction(interactions);
    const historicalData = await this.getHistoricalData(days);
    const topRecommendationCategories = await this.getTopRecommendationCategories(interactions);

    return {
      conversionRate,
      clickThroughRate,
      averageOrderValue,
      timeOnSite,
      recommendationAccuracy,
      userSatisfaction,
      historicalData,
      topRecommendationCategories,
    };
  }

  /**
   * Calculate conversion rate comparison between personalized and non-personalized experiences
   */
  private async calculateConversionRate(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
  ): Promise<MetricComparisonDto> {
    // In a real implementation, this would analyze actual conversion data
    // For this example, we'll return sample data
    return {
      personalized: 4.8,
      nonPersonalized: 3.2,
      improvement: 50.0,
      trend: 12.5,
    };
  }

  /**
   * Calculate click-through rate comparison between personalized and non-personalized experiences
   */
  private async calculateClickThroughRate(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
  ): Promise<MetricComparisonDto> {
    // Filter for click interactions
    const clickInteractions = interactions.filter(interaction => interaction.type === 'CLICK');

    // In a real implementation, this would analyze actual click data
    // For this example, we'll return sample data
    return {
      personalized: 18.5,
      nonPersonalized: 12.7,
      improvement: 45.7,
      trend: 8.3,
    };
  }

  /**
   * Calculate average order value comparison between personalized and non-personalized experiences
   */
  private async calculateAverageOrderValue(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
  ): Promise<MetricComparisonDto> {
    // Filter for purchase interactions
    const purchaseInteractions = interactions.filter(
      interaction => interaction.type === 'PURCHASE',
    );

    // In a real implementation, this would analyze actual purchase data
    // For this example, we'll return sample data
    return {
      personalized: 87.45,
      nonPersonalized: 72.3,
      improvement: 21.0,
      trend: 5.2,
    };
  }

  /**
   * Calculate time on site comparison between personalized and non-personalized experiences
   */
  private async calculateTimeOnSite(sessions: SessionEntity[]): Promise<MetricComparisonDto> {
    // Calculate average session duration
    const personalizedSessions = sessions.filter(
      session => session.duration && session.anonymousUserId,
    );
    const nonPersonalizedSessions = sessions.filter(
      session => session.duration && !session.anonymousUserId,
    );

    // In a real implementation, this would analyze actual session duration data
    // For this example, we'll return sample data
    return {
      personalized: 320, // in minutes
      nonPersonalized: 210,
      improvement: 52.4,
      trend: 10.1,
    };
  }

  /**
   * Calculate recommendation accuracy based on interaction data
   */
  private async calculateRecommendationAccuracy(
    interactions: SessionInteractionEntity[],
  ): Promise<number> {
    // Filter for recommendation click interactions
    const recommendationInteractions = interactions.filter(
      interaction => interaction.type === 'CLICK' && interaction.data?.source === 'recommendation',
    );

    // In a real implementation, this would analyze actual recommendation data
    // For this example, we'll return sample data
    return 78.5;
  }

  /**
   * Calculate user satisfaction based on feedback data
   */
  private async calculateUserSatisfaction(
    interactions: SessionInteractionEntity[],
  ): Promise<number> {
    // Filter for feedback interactions
    const feedbackInteractions = interactions.filter(
      interaction => interaction.type === 'FEEDBACK',
    );

    // In a real implementation, this would analyze actual feedback data
    // For this example, we'll return sample data
    return 8.7;
  }

  /**
   * Get historical data for conversion rate over time
   */
  private async getHistoricalData(days: number): Promise<HistoricalDataDto> {
    // Generate date ranges
    const dates: string[] = [];
    const personalizedData: number[] = [];
    const nonPersonalizedData: number[] = [];

    // Calculate number of weeks to show
    const weeks = Math.ceil(days / 7);

    // Generate data for each week
    for (let i = 0; i < weeks; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (weeks - i - 1) * 7);
      dates.push(date.toISOString().split('T')[0]);

      // In a real implementation, this would fetch actual historical data
      // For this example, we'll generate sample data
      personalizedData.push(3.2 + i * 0.4);
      nonPersonalizedData.push(3.1 + i * 0.05);
    }

    return {
      dates,
      personalized: personalizedData,
      nonPersonalized: nonPersonalizedData,
    };
  }

  /**
   * Get top recommendation categories based on interaction data
   */
  private async getTopRecommendationCategories(
    interactions: SessionInteractionEntity[],
  ): Promise<CategoryPercentageDto[]> {
    // Filter for product view interactions from recommendations
    const recommendationInteractions = interactions.filter(
      interaction =>
        interaction.type === 'PRODUCT_VIEW' &&
        interaction.data?.source === 'recommendation' &&
        interaction.data?.categoryId,
    );

    // Count category views
    const categoryCounts = new Map<string, number>();

    recommendationInteractions.forEach(interaction => {
      const categoryId = interaction.data.categoryId;
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
    });

    // Sort categories by count
    const sortedCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Calculate total count for percentage calculation
    const totalCount = sortedCategories.reduce((sum, [_, count]) => sum + count, 0);

    // Get category names and calculate percentages
    const topCategories = await Promise.all(
      sortedCategories.map(async ([categoryId, count]) => {
        const percentage = (count / totalCount) * 100;

        try {
          const category = await this.categoryService.findOne(categoryId);
          return {
            name: category?.name || 'Unknown Category',
            percentage,
          };
        } catch (error) {
          return {
            name: 'Unknown Category',
            percentage,
          };
        }
      }),
    );

    // Add "Other" category for remaining percentage
    const topCategoriesSum = topCategories.reduce((sum, category) => sum + category.percentage, 0);

    if (topCategoriesSum < 100) {
      topCategories.push({
        name: 'Other',
        percentage: 100 - topCategoriesSum,
      });
    }

    return topCategories;
  }
}
