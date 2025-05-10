import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SessionEntity } from '../../personalization/entities/session.entity';
import { SessionInteractionEntity } from '../../personalization/entities/session-interaction.entity';
import { SessionInteractionType } from '../../personalization/enums/session-interaction-type.enum';

/**
 * Service for analyzing session-based personalization metrics
 */
@Injectable()
export class SessionAnalyticsService {
  private readonly logger = new Logger(SessionAnalyticsService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionInteractionEntity)
    private readonly interactionRepository: Repository<SessionInteractionEntity>,
  ) {}

  /**
   * Get session analytics overview
   * @param period Period in days
   */
  async getSessionAnalyticsOverview(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get total sessions
      const totalSessions = await this.sessionRepository.count({
        where: {
          startTime: Between(startDate, new Date()),
        },
      });

      // Get total interactions
      const totalInteractions = await this.interactionRepository.count({
        where: {
          timestamp: Between(startDate, new Date()),
        },
      });

      // Get average interactions per session
      const avgInteractionsPerSession = totalSessions > 0 ? totalInteractions / totalSessions : 0;

      // Get interaction type distribution
      const interactionTypeDistribution = await this.getInteractionTypeDistribution(startDate);

      // Get average session duration
      const avgSessionDuration = await this.getAverageSessionDuration(startDate);

      // Get personalization effectiveness
      const personalizationEffectiveness = await this.getPersonalizationEffectiveness(startDate);

      return {
        totalSessions,
        totalInteractions,
        avgInteractionsPerSession,
        interactionTypeDistribution,
        avgSessionDuration,
        personalizationEffectiveness,
      };
    } catch (error) {
      this.logger.error(`Failed to get session analytics overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get interaction type distribution
   * @param startDate Start date for the period
   */
  private async getInteractionTypeDistribution(startDate: Date): Promise<any> {
    try {
      const result = await this.interactionRepository
        .createQueryBuilder('interaction')
        .select('interaction.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('interaction.timestamp >= :startDate', { startDate })
        .groupBy('interaction.type')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Convert to object with type as key
      const distribution = {};
      let total = 0;

      result.forEach(item => {
        distribution[item.type] = parseInt(item.count);
        total += parseInt(item.count);
      });

      // Add percentage
      Object.keys(distribution).forEach(key => {
        distribution[`${key}Percentage`] = total > 0 ? (distribution[key] / total) * 100 : 0;
      });

      return distribution;
    } catch (error) {
      this.logger.error(`Failed to get interaction type distribution: ${error.message}`);
      return {};
    }
  }

  /**
   * Get average session duration
   * @param startDate Start date for the period
   */
  private async getAverageSessionDuration(startDate: Date): Promise<number> {
    try {
      const sessions = await this.sessionRepository.find({
        where: {
          startTime: Between(startDate, new Date()),
        },
        select: ['startTime', 'lastActivityTime'],
      });

      if (sessions.length === 0) {
        return 0;
      }

      // Calculate duration in minutes for each session
      const durations = sessions.map(session => {
        const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
        return duration / (1000 * 60); // Convert to minutes
      });

      // Calculate average duration
      const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

      return avgDuration;
    } catch (error) {
      this.logger.error(`Failed to get average session duration: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get personalization effectiveness metrics
   * @param startDate Start date for the period
   */
  private async getPersonalizationEffectiveness(startDate: Date): Promise<any> {
    try {
      // Get click-through rates for personalized vs non-personalized searches
      const clickThroughRates = await this.getPersonalizedVsRegularClickThroughRates(startDate);

      // Get dwell time metrics
      const dwellTimeMetrics = await this.getDwellTimeMetrics(startDate);

      // Get impression to click conversion rates
      const impressionToClickRates = await this.getImpressionToClickRates(startDate);

      return {
        clickThroughRates,
        dwellTimeMetrics,
        impressionToClickRates,
      };
    } catch (error) {
      this.logger.error(`Failed to get personalization effectiveness: ${error.message}`);
      return {};
    }
  }

  /**
   * Get personalized vs regular click-through rates
   * @param startDate Start date for the period
   */
  private async getPersonalizedVsRegularClickThroughRates(startDate: Date): Promise<any> {
    try {
      // Get clicks with session personalization
      const personalizedClicks = await this.interactionRepository.count({
        where: {
          type: SessionInteractionType.CLICK,
          timestamp: Between(startDate, new Date()),
          data: { hasPersonalization: true },
        },
      });

      // Get impressions with session personalization
      const personalizedImpressions = await this.interactionRepository.count({
        where: {
          type: SessionInteractionType.IMPRESSION,
          timestamp: Between(startDate, new Date()),
          data: { hasPersonalization: true },
        },
      });

      // Get clicks without session personalization
      const regularClicks = await this.interactionRepository.count({
        where: {
          type: SessionInteractionType.CLICK,
          timestamp: Between(startDate, new Date()),
          data: { hasPersonalization: false },
        },
      });

      // Get impressions without session personalization
      const regularImpressions = await this.interactionRepository.count({
        where: {
          type: SessionInteractionType.IMPRESSION,
          timestamp: Between(startDate, new Date()),
          data: { hasPersonalization: false },
        },
      });

      // Calculate click-through rates
      const personalizedCTR =
        personalizedImpressions > 0 ? personalizedClicks / personalizedImpressions : 0;
      const regularCTR = regularImpressions > 0 ? regularClicks / regularImpressions : 0;
      const improvement = personalizedCTR - regularCTR;
      const improvementPercentage = regularCTR > 0 ? (improvement / regularCTR) * 100 : 0;

      return {
        personalized: {
          clicks: personalizedClicks,
          impressions: personalizedImpressions,
          clickThroughRate: personalizedCTR,
        },
        regular: {
          clicks: regularClicks,
          impressions: regularImpressions,
          clickThroughRate: regularCTR,
        },
        improvement,
        improvementPercentage,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get personalized vs regular click-through rates: ${error.message}`,
      );
      return {
        personalized: { clickThroughRate: 0 },
        regular: { clickThroughRate: 0 },
        improvement: 0,
        improvementPercentage: 0,
      };
    }
  }

  /**
   * Get dwell time metrics
   * @param startDate Start date for the period
   */
  private async getDwellTimeMetrics(startDate: Date): Promise<any> {
    try {
      // Get dwell time interactions
      const dwellTimeInteractions = await this.interactionRepository.find({
        where: {
          type: SessionInteractionType.DWELL,
          timestamp: Between(startDate, new Date()),
        },
        select: ['data', 'durationMs'],
      });

      if (dwellTimeInteractions.length === 0) {
        return {
          avgDwellTime: 0,
          personalized: { avgDwellTime: 0 },
          regular: { avgDwellTime: 0 },
          improvement: 0,
          improvementPercentage: 0,
        };
      }

      // Separate personalized and regular interactions
      const personalizedInteractions = dwellTimeInteractions.filter(
        interaction => interaction.data?.hasPersonalization === true,
      );
      const regularInteractions = dwellTimeInteractions.filter(
        interaction => interaction.data?.hasPersonalization === false,
      );

      // Calculate average dwell times
      const avgDwellTime =
        dwellTimeInteractions.reduce((sum, interaction) => sum + (interaction.durationMs || 0), 0) /
        dwellTimeInteractions.length;

      const avgPersonalizedDwellTime =
        personalizedInteractions.length > 0
          ? personalizedInteractions.reduce(
              (sum, interaction) => sum + (interaction.durationMs || 0),
              0,
            ) / personalizedInteractions.length
          : 0;

      const avgRegularDwellTime =
        regularInteractions.length > 0
          ? regularInteractions.reduce(
              (sum, interaction) => sum + (interaction.durationMs || 0),
              0,
            ) / regularInteractions.length
          : 0;

      // Calculate improvement
      const improvement = avgPersonalizedDwellTime - avgRegularDwellTime;
      const improvementPercentage =
        avgRegularDwellTime > 0 ? (improvement / avgRegularDwellTime) * 100 : 0;

      return {
        avgDwellTime,
        personalized: {
          avgDwellTime: avgPersonalizedDwellTime,
          count: personalizedInteractions.length,
        },
        regular: {
          avgDwellTime: avgRegularDwellTime,
          count: regularInteractions.length,
        },
        improvement,
        improvementPercentage,
      };
    } catch (error) {
      this.logger.error(`Failed to get dwell time metrics: ${error.message}`);
      return {
        avgDwellTime: 0,
        personalized: { avgDwellTime: 0 },
        regular: { avgDwellTime: 0 },
        improvement: 0,
        improvementPercentage: 0,
      };
    }
  }

  /**
   * Get impression to click conversion rates
   * @param startDate Start date for the period
   */
  private async getImpressionToClickRates(startDate: Date): Promise<any> {
    try {
      // Group sessions by whether they have personalization
      const sessions = await this.sessionRepository.find({
        where: {
          startTime: Between(startDate, new Date()),
        },
        relations: ['interactions'],
      });

      // Initialize metrics
      const metrics = {
        personalized: {
          sessions: 0,
          impressions: 0,
          clicks: 0,
          conversionRate: 0,
        },
        regular: {
          sessions: 0,
          impressions: 0,
          clicks: 0,
          conversionRate: 0,
        },
        improvement: 0,
        improvementPercentage: 0,
      };

      // Process each session
      sessions.forEach(session => {
        // Check if session has personalization
        const hasPersonalization = session.interactions.some(
          interaction => interaction.data?.hasPersonalization === true,
        );

        // Count impressions and clicks
        const impressions = session.interactions.filter(
          interaction => interaction.type === SessionInteractionType.IMPRESSION,
        ).length;
        const clicks = session.interactions.filter(
          interaction => interaction.type === SessionInteractionType.CLICK,
        ).length;

        // Update metrics
        if (hasPersonalization) {
          metrics.personalized.sessions++;
          metrics.personalized.impressions += impressions;
          metrics.personalized.clicks += clicks;
        } else {
          metrics.regular.sessions++;
          metrics.regular.impressions += impressions;
          metrics.regular.clicks += clicks;
        }
      });

      // Calculate conversion rates
      metrics.personalized.conversionRate =
        metrics.personalized.impressions > 0
          ? metrics.personalized.clicks / metrics.personalized.impressions
          : 0;
      metrics.regular.conversionRate =
        metrics.regular.impressions > 0 ? metrics.regular.clicks / metrics.regular.impressions : 0;

      // Calculate improvement
      metrics.improvement = metrics.personalized.conversionRate - metrics.regular.conversionRate;
      metrics.improvementPercentage =
        metrics.regular.conversionRate > 0
          ? (metrics.improvement / metrics.regular.conversionRate) * 100
          : 0;

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to get impression to click conversion rates: ${error.message}`);
      return {
        personalized: { conversionRate: 0 },
        regular: { conversionRate: 0 },
        improvement: 0,
        improvementPercentage: 0,
      };
    }
  }

  /**
   * Get time series data for session metrics
   * @param period Period in days
   * @param interval Interval in days
   */
  async getSessionTimeSeriesData(period = 30, interval = 1): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const timeSeriesData = [];

      // Generate time intervals
      for (let i = 0; i < period; i += interval) {
        const intervalStartDate = new Date(startDate);
        intervalStartDate.setDate(intervalStartDate.getDate() + i);

        const intervalEndDate = new Date(intervalStartDate);
        intervalEndDate.setDate(intervalEndDate.getDate() + interval);

        // Ensure end date doesn't exceed current date
        if (intervalEndDate > endDate) {
          intervalEndDate.setTime(endDate.getTime());
        }

        // Get session count for this interval
        const sessionCount = await this.sessionRepository.count({
          where: {
            startTime: Between(intervalStartDate, intervalEndDate),
          },
        });

        // Get interaction count for this interval
        const interactionCount = await this.interactionRepository.count({
          where: {
            timestamp: Between(intervalStartDate, intervalEndDate),
          },
        });

        // Get personalized interaction count
        const personalizedInteractionCount = await this.interactionRepository.count({
          where: {
            timestamp: Between(intervalStartDate, intervalEndDate),
            data: { hasPersonalization: true },
          },
        });

        timeSeriesData.push({
          date: intervalStartDate.toISOString().split('T')[0],
          sessionCount,
          interactionCount,
          personalizedInteractionCount,
          personalizationRate:
            interactionCount > 0 ? personalizedInteractionCount / interactionCount : 0,
        });
      }

      return timeSeriesData;
    } catch (error) {
      this.logger.error(`Failed to get session time series data: ${error.message}`);
      return [];
    }
  }

  /**
   * Get top personalized entities
   * @param limit Maximum number of entities to return
   * @param period Period in days
   */
  async getTopPersonalizedEntities(limit = 10, period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get click interactions with entity data
      const clickInteractions = await this.interactionRepository.find({
        where: {
          type: SessionInteractionType.CLICK,
          timestamp: Between(startDate, new Date()),
        },
        select: ['data'],
      });

      // Extract entity IDs and count occurrences
      const entityCounts = {};

      clickInteractions.forEach(interaction => {
        const entityId = interaction.data?.resultId;
        if (entityId) {
          entityCounts[entityId] = (entityCounts[entityId] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const sortedEntities = Object.entries(entityCounts)
        .map(([entityId, count]) => ({
          entityId,
          count,
        }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, limit);

      return sortedEntities;
    } catch (error) {
      this.logger.error(`Failed to get top personalized entities: ${error.message}`);
      return [];
    }
  }
}
