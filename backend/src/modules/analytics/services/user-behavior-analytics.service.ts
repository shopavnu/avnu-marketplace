import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { ScrollAnalytics, ScrollDirection } from '../entities/scroll-analytics.entity';
import { HeatmapData, InteractionType } from '../entities/heatmap-data.entity';
import { UserEngagement, EngagementType } from '../entities/user-engagement.entity';

@Injectable()
export class UserBehaviorAnalyticsService {
  private readonly logger = new Logger(UserBehaviorAnalyticsService.name);

  constructor(
    @InjectRepository(ScrollAnalytics)
    private readonly scrollAnalyticsRepository: Repository<ScrollAnalytics>,
    @InjectRepository(HeatmapData)
    private readonly heatmapDataRepository: Repository<HeatmapData>,
    @InjectRepository(UserEngagement)
    private readonly userEngagementRepository: Repository<UserEngagement>,
  ) {}

  /**
   * Track vertical scrolling patterns
   * @param data Scroll analytics data
   */
  async trackScrolling(data: Partial<ScrollAnalytics>): Promise<ScrollAnalytics> {
    try {
      // Set default direction to vertical if not specified
      if (!data.direction) {
        data.direction = ScrollDirection.VERTICAL;
      }

      // Calculate max scroll percentage if not provided
      if (!data.maxScrollPercentage && data.maxScrollDepth && data.pageHeight) {
        data.maxScrollPercentage = (data.maxScrollDepth / data.pageHeight) * 100;
      }

      const scrollAnalytics = this.scrollAnalyticsRepository.create(data);
      return this.scrollAnalyticsRepository.save(scrollAnalytics);
    } catch (error) {
      this.logger.error(`Failed to track scrolling: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track heatmap data
   * @param data Heatmap data
   */
  async trackHeatmapData(data: Partial<HeatmapData>): Promise<HeatmapData> {
    try {
      const heatmapData = this.heatmapDataRepository.create(data);
      return this.heatmapDataRepository.save(heatmapData);
    } catch (error) {
      this.logger.error(`Failed to track heatmap data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track batch heatmap data
   * @param dataItems Array of heatmap data items
   */
  async trackBatchHeatmapData(dataItems: Partial<HeatmapData>[]): Promise<HeatmapData[]> {
    try {
      if (!dataItems || dataItems.length === 0) {
        return [];
      }

      const heatmapDataItems = dataItems.map(data => this.heatmapDataRepository.create(data));
      return this.heatmapDataRepository.save(heatmapDataItems);
    } catch (error) {
      this.logger.error(`Failed to track batch heatmap data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get vertical scrolling analytics
   * @param period Period in days
   */
  async getVerticalScrollingAnalytics(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get average scroll depth by page
      const avgScrollDepthByPage = await this.scrollAnalyticsRepository
        .createQueryBuilder('scroll')
        .select('scroll.pagePath', 'pagePath')
        .addSelect('AVG(scroll.maxScrollPercentage)', 'avgScrollPercentage')
        .addSelect('AVG(scroll.scrollCount)', 'avgScrollCount')
        .addSelect('AVG(scroll.dwellTimeSeconds)', 'avgDwellTime')
        .addSelect('COUNT(scroll.id)', 'sessionCount')
        .where('scroll.timestamp >= :startDate', { startDate })
        .andWhere('scroll.direction = :direction', { direction: ScrollDirection.VERTICAL })
        .groupBy('scroll.pagePath')
        .orderBy('avgScrollPercentage', 'DESC')
        .getRawMany();

      // Get average scroll depth by device type
      const avgScrollDepthByDevice = await this.scrollAnalyticsRepository
        .createQueryBuilder('scroll')
        .select('scroll.deviceType', 'deviceType')
        .addSelect('AVG(scroll.maxScrollPercentage)', 'avgScrollPercentage')
        .addSelect('AVG(scroll.scrollCount)', 'avgScrollCount')
        .addSelect('AVG(scroll.dwellTimeSeconds)', 'avgDwellTime')
        .addSelect('COUNT(scroll.id)', 'sessionCount')
        .where('scroll.timestamp >= :startDate', { startDate })
        .andWhere('scroll.direction = :direction', { direction: ScrollDirection.VERTICAL })
        .groupBy('scroll.deviceType')
        .orderBy('avgScrollPercentage', 'DESC')
        .getRawMany();

      // Get scroll depth distribution
      const scrollDepthDistribution = await this.scrollAnalyticsRepository
        .createQueryBuilder('scroll')
        .select(
          'CASE ' +
            'WHEN scroll.maxScrollPercentage < 25 THEN \'0-25%\' ' +
            'WHEN scroll.maxScrollPercentage >= 25 AND scroll.maxScrollPercentage < 50 THEN \'25-50%\' ' +
            'WHEN scroll.maxScrollPercentage >= 50 AND scroll.maxScrollPercentage < 75 THEN \'50-75%\' ' +
            'WHEN scroll.maxScrollPercentage >= 75 AND scroll.maxScrollPercentage < 90 THEN \'75-90%\' ' +
            'ELSE \'90-100%\' ' +
            'END',
          'depthRange',
        )
        .addSelect('COUNT(scroll.id)', 'sessionCount')
        .where('scroll.timestamp >= :startDate', { startDate })
        .andWhere('scroll.direction = :direction', { direction: ScrollDirection.VERTICAL })
        .groupBy('depthRange')
        .orderBy('depthRange', 'ASC')
        .getRawMany();

      // Get correlation between scroll depth and conversion
      const scrollDepthConversionCorrelation = await this.getScrollDepthConversionCorrelation(
        startDate,
      );

      return {
        avgScrollDepthByPage,
        avgScrollDepthByDevice,
        scrollDepthDistribution,
        scrollDepthConversionCorrelation,
      };
    } catch (error) {
      this.logger.error(`Failed to get vertical scrolling analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get heatmap analytics
   * @param pagePath Page path to get heatmap data for
   * @param period Period in days
   * @param interactionType Optional interaction type filter
   */
  async getHeatmapAnalytics(
    pagePath: string,
    period = 30,
    interactionType?: InteractionType,
  ): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Create query builder
      let queryBuilder = this.heatmapDataRepository
        .createQueryBuilder('heatmap')
        .select('heatmap.xPosition', 'xPosition')
        .addSelect('heatmap.yPosition', 'yPosition')
        .addSelect('COUNT(heatmap.id)', 'interactionCount')
        .where('heatmap.timestamp >= :startDate', { startDate })
        .andWhere('heatmap.pagePath = :pagePath', { pagePath });

      // Add interaction type filter if provided
      if (interactionType) {
        queryBuilder = queryBuilder.andWhere('heatmap.interactionType = :interactionType', {
          interactionType,
        });
      }

      // Complete the query
      const heatmapData = await queryBuilder
        .groupBy('heatmap.xPosition')
        .addGroupBy('heatmap.yPosition')
        .orderBy('interactionCount', 'DESC')
        .getRawMany();

      // Get element interaction data
      let elementQueryBuilder = this.heatmapDataRepository
        .createQueryBuilder('heatmap')
        .select('heatmap.elementSelector', 'elementSelector')
        .addSelect('heatmap.elementId', 'elementId')
        .addSelect('heatmap.elementText', 'elementText')
        .addSelect('COUNT(heatmap.id)', 'interactionCount')
        .where('heatmap.timestamp >= :startDate', { startDate })
        .andWhere('heatmap.pagePath = :pagePath', { pagePath })
        .andWhere('heatmap.elementSelector IS NOT NULL');

      // Add interaction type filter if provided
      if (interactionType) {
        elementQueryBuilder = elementQueryBuilder.andWhere(
          'heatmap.interactionType = :interactionType',
          { interactionType },
        );
      }

      // Complete the element query
      const elementInteractions = await elementQueryBuilder
        .groupBy('heatmap.elementSelector')
        .addGroupBy('heatmap.elementId')
        .addGroupBy('heatmap.elementText')
        .orderBy('interactionCount', 'DESC')
        .limit(50)
        .getRawMany();

      // Get interaction counts by type
      const interactionsByType = await this.heatmapDataRepository
        .createQueryBuilder('heatmap')
        .select('heatmap.interactionType', 'interactionType')
        .addSelect('COUNT(heatmap.id)', 'interactionCount')
        .where('heatmap.timestamp >= :startDate', { startDate })
        .andWhere('heatmap.pagePath = :pagePath', { pagePath })
        .groupBy('heatmap.interactionType')
        .orderBy('interactionCount', 'DESC')
        .getRawMany();

      return {
        heatmapData,
        elementInteractions,
        interactionsByType,
      };
    } catch (error) {
      this.logger.error(`Failed to get heatmap analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get vertical navigation conversion funnel
   * @param period Period in days
   */
  async getVerticalNavigationFunnel(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Define scroll depth segments
      const scrollDepthSegments = [
        { min: 0, max: 25, label: '0-25%' },
        { min: 25, max: 50, label: '25-50%' },
        { min: 50, max: 75, label: '50-75%' },
        { min: 75, max: 90, label: '75-90%' },
        { min: 90, max: 100, label: '90-100%' },
      ];

      // Get conversion data for each scroll depth segment
      const funnelData = await Promise.all(
        scrollDepthSegments.map(async segment => {
          // Get sessions in this scroll depth segment
          const sessionsInSegment = await this.scrollAnalyticsRepository
            .createQueryBuilder('scroll')
            .select('DISTINCT scroll.sessionId', 'sessionId')
            .where('scroll.timestamp >= :startDate', { startDate })
            .andWhere('scroll.direction = :direction', { direction: ScrollDirection.VERTICAL })
            .andWhere('scroll.maxScrollPercentage >= :minDepth', { minDepth: segment.min })
            .andWhere('scroll.maxScrollPercentage < :maxDepth', { maxDepth: segment.max })
            .getRawMany();

          const sessionIds = sessionsInSegment.map(s => s.sessionId);

          if (sessionIds.length === 0) {
            return {
              segment: segment.label,
              sessionCount: 0,
              productViews: 0,
              addToCarts: 0,
              checkoutStarts: 0,
              checkoutCompletions: 0,
              addToCartRate: 0,
              checkoutStartRate: 0,
              checkoutCompletionRate: 0,
              overallConversionRate: 0,
            };
          }

          // Get product views for these sessions
          const productViews = await this.userEngagementRepository.count({
            where: {
              sessionId: sessionIds,
              engagementType: EngagementType.PRODUCT_VIEW,
              timestamp: Between(startDate, new Date()),
            },
          });

          // Get add to carts for these sessions
          const addToCarts = await this.userEngagementRepository.count({
            where: {
              sessionId: sessionIds,
              engagementType: EngagementType.ADD_TO_CART,
              timestamp: Between(startDate, new Date()),
            },
          });

          // Get checkout starts for these sessions
          const checkoutStarts = await this.userEngagementRepository.count({
            where: {
              sessionId: sessionIds,
              engagementType: EngagementType.CHECKOUT_START,
              timestamp: Between(startDate, new Date()),
            },
          });

          // Get checkout completions for these sessions
          const checkoutCompletions = await this.userEngagementRepository.count({
            where: {
              sessionId: sessionIds,
              engagementType: EngagementType.CHECKOUT_COMPLETE,
              timestamp: Between(startDate, new Date()),
            },
          });

          // Calculate conversion rates
          const addToCartRate = productViews > 0 ? addToCarts / productViews : 0;
          const checkoutStartRate = addToCarts > 0 ? checkoutStarts / addToCarts : 0;
          const checkoutCompletionRate =
            checkoutStarts > 0 ? checkoutCompletions / checkoutStarts : 0;
          const overallConversionRate = productViews > 0 ? checkoutCompletions / productViews : 0;

          return {
            segment: segment.label,
            sessionCount: sessionIds.length,
            productViews,
            addToCarts,
            checkoutStarts,
            checkoutCompletions,
            addToCartRate,
            checkoutStartRate,
            checkoutCompletionRate,
            overallConversionRate,
          };
        }),
      );

      return {
        funnelData,
      };
    } catch (error) {
      this.logger.error(`Failed to get vertical navigation funnel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to get correlation between scroll depth and conversion
   * @param startDate Start date for the analysis
   */
  private async getScrollDepthConversionCorrelation(startDate: Date): Promise<any> {
    try {
      // Get all scroll sessions with their max scroll percentage
      const scrollSessions = await this.scrollAnalyticsRepository
        .createQueryBuilder('scroll')
        .select('scroll.sessionId', 'sessionId')
        .addSelect('MAX(scroll.maxScrollPercentage)', 'maxScrollPercentage')
        .where('scroll.timestamp >= :startDate', { startDate })
        .andWhere('scroll.direction = :direction', { direction: ScrollDirection.VERTICAL })
        .groupBy('scroll.sessionId')
        .getRawMany();

      // For each session, check if there was a conversion
      const sessionsWithConversion = await Promise.all(
        scrollSessions.map(async session => {
          const conversion = await this.userEngagementRepository.findOne({
            where: {
              sessionId: session.sessionId,
              engagementType: EngagementType.CHECKOUT_COMPLETE,
              timestamp: MoreThan(startDate),
            },
          });

          return {
            sessionId: session.sessionId,
            maxScrollPercentage: parseFloat(session.maxScrollPercentage),
            converted: !!conversion,
          };
        }),
      );

      // Group sessions by scroll depth ranges and calculate conversion rate
      const scrollRanges = [
        { min: 0, max: 25, label: '0-25%' },
        { min: 25, max: 50, label: '25-50%' },
        { min: 50, max: 75, label: '50-75%' },
        { min: 75, max: 90, label: '75-90%' },
        { min: 90, max: 100, label: '90-100%' },
      ];

      const conversionByScrollDepth = scrollRanges.map(range => {
        const sessionsInRange = sessionsWithConversion.filter(
          s => s.maxScrollPercentage >= range.min && s.maxScrollPercentage < range.max,
        );
        const conversionsInRange = sessionsInRange.filter(s => s.converted);

        return {
          scrollDepthRange: range.label,
          sessionCount: sessionsInRange.length,
          conversionCount: conversionsInRange.length,
          conversionRate:
            sessionsInRange.length > 0 ? conversionsInRange.length / sessionsInRange.length : 0,
        };
      });

      return conversionByScrollDepth;
    } catch (error) {
      this.logger.error(`Failed to get scroll depth conversion correlation: ${error.message}`);
      throw error;
    }
  }
}
