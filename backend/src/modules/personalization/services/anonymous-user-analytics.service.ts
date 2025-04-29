import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import { SessionInteractionType } from './session.service';
import { AnonymousUserMetricsDto } from '../dto/anonymous-user-metrics.dto';
import { ProductsService } from '../../products/products.service';
import { CategoryService } from '../../products/services/category.service';
import { MerchantService } from '../../merchants/services/merchant.service';

@Injectable()
export class AnonymousUserAnalyticsService {
  private readonly logger = new Logger(AnonymousUserAnalyticsService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(SessionInteractionEntity)
    private readonly interactionRepository: Repository<SessionInteractionEntity>,
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly merchantService: MerchantService,
  ) {}

  /**
   * Get anonymous user metrics for the admin dashboard
   * @param period Number of days to analyze
   * @returns Anonymous user metrics
   */
  async getAnonymousUserMetrics(period: number): Promise<AnonymousUserMetricsDto> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Get all sessions in the period
      const sessions = await this.sessionRepository.find({
        where: {
          startTime: MoreThanOrEqual(startDate),
        },
        relations: ['interactions'],
      });

      // Get all interactions in the period
      const interactions = await this.interactionRepository.find({
        where: {
          timestamp: MoreThanOrEqual(startDate),
        },
        relations: ['session'],
      });

      // Calculate overview metrics
      const overview = await this.calculateOverviewMetrics(sessions, interactions, startDate);

      // Calculate interactions by type
      const interactionsByType = await this.calculateInteractionsByType(interactions);

      // Calculate top category preferences
      const topCategoryPreferences = await this.calculateTopCategoryPreferences(interactions);

      // Calculate top brand preferences
      const topBrandPreferences = await this.calculateTopBrandPreferences(interactions);

      // Calculate top search terms
      const topSearchTerms = await this.calculateTopSearchTerms(interactions);

      // Calculate metrics by timeframe
      const byTimeframe = await this.calculateMetricsByTimeframe(sessions, interactions, period);

      return {
        overview,
        interactionsByType,
        topCategoryPreferences,
        topBrandPreferences,
        topSearchTerms,
        byTimeframe,
      };
    } catch (error) {
      this.logger.error(`Failed to get anonymous user metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate overview metrics for anonymous users
   * @param sessions All sessions in the period
   * @param interactions All interactions in the period
   * @param startDate Start date for the period
   * @returns Overview metrics
   */
  private async calculateOverviewMetrics(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
    startDate: Date,
  ) {
    // Count total anonymous users (unique session IDs)
    const totalAnonymousUsers = sessions.length;

    // Count active anonymous users (sessions with at least one interaction)
    const activeSessionIds = new Set(
      interactions.map(interaction => interaction.session.sessionId),
    );
    const activeAnonymousUsers = activeSessionIds.size;

    // Calculate conversion rate (users who added to cart or purchased)
    const conversionInteractions = interactions.filter(
      interaction =>
        interaction.type === SessionInteractionType.ADD_TO_CART ||
        interaction.type === SessionInteractionType.PURCHASE,
    );
    const conversionSessionIds = new Set(
      conversionInteractions.map(interaction => interaction.session.sessionId),
    );
    const conversionRate =
      activeAnonymousUsers > 0 ? conversionSessionIds.size / activeAnonymousUsers : 0;

    // Calculate average session duration
    let totalDuration = 0;
    let sessionsWithDuration = 0;

    sessions.forEach(session => {
      if (session.lastActivityTime && session.startTime) {
        const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
        if (duration > 0 && duration < 24 * 60 * 60 * 1000) {
          // Exclude sessions longer than 24 hours
          totalDuration += duration;
          sessionsWithDuration++;
        }
      }
    });

    const avgSessionDuration = sessionsWithDuration > 0 ? totalDuration / sessionsWithDuration : 0;

    // Calculate returning user rate
    // Group sessions by day to identify returning users
    const sessionsByDay = new Map<string, Set<string>>();

    sessions.forEach(session => {
      const day = session.startTime.toISOString().split('T')[0];
      if (!sessionsByDay.has(day)) {
        sessionsByDay.set(day, new Set());
      }
      sessionsByDay.get(day).add(session.sessionId);
    });

    // Count unique sessions and returning sessions
    const uniqueSessionIds = new Set<string>();
    let returningSessionCount = 0;

    sessionsByDay.forEach((sessionsInDay, day) => {
      sessionsInDay.forEach(sessionId => {
        if (uniqueSessionIds.has(sessionId)) {
          returningSessionCount++;
        } else {
          uniqueSessionIds.add(sessionId);
        }
      });
    });

    const returningUserRate =
      totalAnonymousUsers > 0 ? returningSessionCount / totalAnonymousUsers : 0;

    return {
      totalAnonymousUsers,
      activeAnonymousUsers,
      conversionRate,
      avgSessionDuration,
      returningUserRate,
    };
  }

  /**
   * Calculate interaction metrics by type
   * @param interactions All interactions in the period
   * @returns Interaction metrics by type
   */
  private async calculateInteractionsByType(interactions: SessionInteractionEntity[]) {
    // Count interactions by type
    const interactionCounts = new Map<string, number>();

    interactions.forEach(interaction => {
      const count = interactionCounts.get(interaction.type) || 0;
      interactionCounts.set(interaction.type, count + 1);
    });

    // Calculate percentages
    const totalInteractions = interactions.length;
    const result = [];

    interactionCounts.forEach((count, type) => {
      result.push({
        type,
        count,
        percentage: totalInteractions > 0 ? count / totalInteractions : 0,
      });
    });

    // Sort by count descending
    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate top category preferences
   * @param interactions All interactions in the period
   * @returns Top category preferences
   */
  private async calculateTopCategoryPreferences(interactions: SessionInteractionEntity[]) {
    // Extract category interactions
    const categoryInteractions = interactions.filter(
      interaction =>
        (interaction.type === SessionInteractionType.VIEW &&
          interaction.data?.type === 'category') ||
        (interaction.type === SessionInteractionType.FILTER &&
          interaction.data?.filterType === 'category') ||
        (interaction.type === SessionInteractionType.PRODUCT_VIEW && interaction.data?.categoryId),
    );

    // Count interactions by category
    const categoryData = new Map<
      string,
      { id: string; name: string; count: number; weight: number }
    >();

    for (const interaction of categoryInteractions) {
      let categoryId = '';
      let categoryName = '';

      if (
        interaction.type === SessionInteractionType.VIEW &&
        interaction.data?.type === 'category'
      ) {
        categoryId = interaction.data.categoryId;
        categoryName = interaction.data.categoryName || (await this.getCategoryName(categoryId));
      } else if (
        interaction.type === SessionInteractionType.FILTER &&
        interaction.data?.filterType === 'category'
      ) {
        categoryId = interaction.data.filterValue;
        categoryName = await this.getCategoryName(categoryId);
      } else if (
        interaction.type === SessionInteractionType.PRODUCT_VIEW &&
        interaction.data?.categoryId
      ) {
        categoryId = interaction.data.categoryId;
        categoryName = await this.getCategoryName(categoryId);
      }

      if (categoryId) {
        const existingData = categoryData.get(categoryId) || {
          id: categoryId,
          name: categoryName,
          count: 0,
          weight: 0,
        };

        existingData.count += 1;

        // Calculate weight based on interaction type
        let interactionWeight = 0;
        if (interaction.type === SessionInteractionType.PRODUCT_VIEW) {
          interactionWeight = 0.8;
        } else if (interaction.type === SessionInteractionType.FILTER) {
          interactionWeight = 0.6;
        } else if (interaction.type === SessionInteractionType.VIEW) {
          interactionWeight = 0.4;
        }

        existingData.weight += interactionWeight;

        categoryData.set(categoryId, existingData);
      }
    }

    // Convert to array and sort by weight
    const result = Array.from(categoryData.values()).map(item => ({
      categoryId: item.id,
      categoryName: item.name,
      weight: item.weight,
      interactionCount: item.count,
    }));

    // Sort by weight descending and limit to top 10
    return result.sort((a, b) => b.weight - a.weight).slice(0, 10);
  }

  /**
   * Calculate top brand preferences
   * @param interactions All interactions in the period
   * @returns Top brand preferences
   */
  private async calculateTopBrandPreferences(interactions: SessionInteractionEntity[]) {
    // Extract brand interactions
    const brandInteractions = interactions.filter(
      interaction =>
        (interaction.type === SessionInteractionType.VIEW && interaction.data?.type === 'brand') ||
        (interaction.type === SessionInteractionType.FILTER &&
          interaction.data?.filterType === 'brand') ||
        (interaction.type === SessionInteractionType.PRODUCT_VIEW && interaction.data?.brandId),
    );

    // Count interactions by brand
    const brandData = new Map<
      string,
      { id: string; name: string; count: number; weight: number }
    >();

    for (const interaction of brandInteractions) {
      let brandId = '';
      let brandName = '';

      if (interaction.type === SessionInteractionType.VIEW && interaction.data?.type === 'brand') {
        brandId = interaction.data.brandId;
        brandName = interaction.data.brandName || (await this.getMerchantName(brandId));
      } else if (
        interaction.type === SessionInteractionType.FILTER &&
        interaction.data?.filterType === 'brand'
      ) {
        brandId = interaction.data.filterValue;
        brandName = await this.getMerchantName(brandId);
      } else if (
        interaction.type === SessionInteractionType.PRODUCT_VIEW &&
        interaction.data?.brandId
      ) {
        brandId = interaction.data.brandId;
        brandName = await this.getMerchantName(brandId);
      }

      if (brandId) {
        const existingData = brandData.get(brandId) || {
          id: brandId,
          name: brandName,
          count: 0,
          weight: 0,
        };

        existingData.count += 1;

        // Calculate weight based on interaction type
        let interactionWeight = 0;
        if (interaction.type === SessionInteractionType.PRODUCT_VIEW) {
          interactionWeight = 0.8;
        } else if (interaction.type === SessionInteractionType.FILTER) {
          interactionWeight = 0.6;
        } else if (interaction.type === SessionInteractionType.VIEW) {
          interactionWeight = 0.4;
        }

        existingData.weight += interactionWeight;

        brandData.set(brandId, existingData);
      }
    }

    // Convert to array and sort by weight
    const result = Array.from(brandData.values()).map(item => ({
      brandId: item.id,
      brandName: item.name,
      weight: item.weight,
      interactionCount: item.count,
    }));

    // Sort by weight descending and limit to top 10
    return result.sort((a, b) => b.weight - a.weight).slice(0, 10);
  }

  /**
   * Calculate top search terms
   * @param interactions All interactions in the period
   * @returns Top search terms
   */
  private async calculateTopSearchTerms(interactions: SessionInteractionEntity[]) {
    // Extract search interactions
    const searchInteractions = interactions.filter(
      interaction => interaction.type === SessionInteractionType.SEARCH,
    );

    // Group by search query
    const searchData = new Map<string, { query: string; count: number; sessions: Set<string> }>();

    searchInteractions.forEach(interaction => {
      const query = interaction.data?.query?.toLowerCase();
      if (query) {
        const existingData = searchData.get(query) || {
          query,
          count: 0,
          sessions: new Set<string>(),
        };

        existingData.count += 1;
        existingData.sessions.add(interaction.session.sessionId);

        searchData.set(query, existingData);
      }
    });

    // Calculate conversion rate for each search term
    const result = [];

    for (const [query, data] of searchData.entries()) {
      // Find sessions that searched for this term
      const searchSessionIds = data.sessions;

      // Find conversion interactions (add to cart or purchase) for these sessions
      const conversionInteractions = interactions.filter(
        interaction =>
          searchSessionIds.has(interaction.session.sessionId) &&
          (interaction.type === SessionInteractionType.ADD_TO_CART ||
            interaction.type === SessionInteractionType.PURCHASE),
      );

      // Count unique sessions with conversions
      const conversionSessionIds = new Set(
        conversionInteractions.map(interaction => interaction.session.sessionId),
      );

      // Calculate conversion rate
      const conversionRate =
        searchSessionIds.size > 0 ? conversionSessionIds.size / searchSessionIds.size : 0;

      result.push({
        query: data.query,
        count: data.count,
        conversionRate,
      });
    }

    // Sort by count descending and limit to top 20
    return result.sort((a, b) => b.count - a.count).slice(0, 20);
  }

  /**
   * Calculate metrics by timeframe
   * @param sessions All sessions in the period
   * @param interactions All interactions in the period
   * @param period Number of days to analyze
   * @returns Metrics by timeframe
   */
  private async calculateMetricsByTimeframe(
    sessions: SessionEntity[],
    interactions: SessionInteractionEntity[],
    period: number,
  ) {
    // Create a map of dates for the period
    const timeframeData = new Map<
      string,
      {
        date: string;
        anonymousUsers: number;
        newUsers: number;
        returningUsers: Set<string>;
        sessionDurations: number[];
      }
    >();

    // Initialize the map with all dates in the period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      timeframeData.set(dateString, {
        date: dateString,
        anonymousUsers: 0,
        newUsers: 0,
        returningUsers: new Set<string>(),
        sessionDurations: [],
      });
    }

    // Track all seen session IDs to determine new vs returning
    const seenSessionIds = new Set<string>();

    // Process sessions
    sessions.forEach(session => {
      const dateString = session.startTime.toISOString().split('T')[0];
      const data = timeframeData.get(dateString);

      if (data) {
        // Count anonymous users
        data.anonymousUsers++;

        // Check if new or returning user
        if (seenSessionIds.has(session.sessionId)) {
          data.returningUsers.add(session.sessionId);
        } else {
          data.newUsers++;
          seenSessionIds.add(session.sessionId);
        }

        // Calculate session duration
        if (session.lastActivityTime && session.startTime) {
          const duration = session.lastActivityTime.getTime() - session.startTime.getTime();
          if (duration > 0 && duration < 24 * 60 * 60 * 1000) {
            // Exclude sessions longer than 24 hours
            data.sessionDurations.push(duration);
          }
        }
      }
    });

    // Convert to array and calculate averages
    const result = Array.from(timeframeData.values()).map(data => ({
      date: data.date,
      anonymousUsers: data.anonymousUsers,
      newUsers: data.newUsers,
      returningUsers: data.returningUsers.size,
      avgSessionDuration:
        data.sessionDurations.length > 0
          ? data.sessionDurations.reduce((sum, duration) => sum + duration, 0) /
            data.sessionDurations.length
          : 0,
    }));

    // Sort by date ascending
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get category name by ID
   * @param categoryId Category ID
   * @returns Category name
   */
  private async getCategoryName(categoryId: string): Promise<string> {
    try {
      const category = await this.categoryService.findOne(categoryId);
      return category?.name || 'Unknown Category';
    } catch (error) {
      return 'Unknown Category';
    }
  }

  /**
   * Get merchant name by ID
   * @param merchantId Merchant ID
   * @returns Merchant name
   */
  private async getMerchantName(merchantId: string): Promise<string> {
    try {
      const merchant = await this.merchantService.findOne(merchantId);
      return merchant?.name || 'Unknown Brand';
    } catch (error) {
      return 'Unknown Brand';
    }
  }
}
