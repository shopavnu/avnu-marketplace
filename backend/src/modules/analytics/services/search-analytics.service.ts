import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchAnalytics } from '../entities/search-analytics.entity';
import { SearchEntityType } from '../../search/enums/search-entity-type.enum'; // Updated import path

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);

  constructor(
    @InjectRepository(SearchAnalytics)
    private readonly searchAnalyticsRepository: Repository<SearchAnalytics>,
  ) {}

  /**
   * Track a search query
   * @param data Search analytics data
   */
  async trackSearch(data: Partial<SearchAnalytics>): Promise<SearchAnalytics> {
    try {
      const searchAnalytics = this.searchAnalyticsRepository.create(data);
      return this.searchAnalyticsRepository.save(searchAnalytics);
    } catch (error) {
      this.logger.error(`Failed to track search: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track an entity-specific search event
   * @param event Event name
   * @param data Event data
   */
  async trackEvent(event: string, data: any): Promise<void> {
    try {
      // Extract common search data
      const {
        query,
        entityType,
        resultCount,
        enableNlp,
        personalized,
        filters,
        rangeFilters,
        userId,
        sessionId,
        userAgent,
        timestamp,
        entityBoosting,
        experimentId,
      } = data;

      // Create base search analytics record
      const searchData: Partial<SearchAnalytics> = {
        query,
        resultCount: resultCount || 0,
        isNlpEnhanced: enableNlp || false,
        isPersonalized: personalized || false,
        filterCount: (filters?.length || 0) + (rangeFilters?.length || 0),
        userId,
        sessionId,
        userAgent,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        experimentId,
        metadata: {},
      };

      // Add entity-specific data
      if (entityType) {
        searchData.metadata.entityType = entityType;
      }

      // Add entity boosting data if available
      if (entityBoosting) {
        searchData.metadata.entityBoosting = entityBoosting;
      }

      // Add entity distribution if available
      if (data.entityDistribution) {
        searchData.metadata.entityDistribution = data.entityDistribution;
      }

      // Add relevance scores if available
      if (data.relevanceScores) {
        searchData.metadata.relevanceScores = data.relevanceScores;
      }

      // Add event-specific data
      searchData.metadata.eventType = event;

      // Track the search
      await this.trackSearch(searchData);

      // Log event for monitoring
      this.logger.debug(`Tracked search event: ${event}`, {
        query,
        entityType,
        resultCount,
        event,
      });
    } catch (error) {
      this.logger.error(`Failed to track search event: ${error.message}`);
    }
  }

  /**
   * Track a search result click
   * @param searchId Search ID
   */
  async trackSearchResultClick(searchId: string): Promise<SearchAnalytics> {
    try {
      const searchAnalytics = await this.searchAnalyticsRepository.findOne({
        where: { id: searchId },
      });

      if (!searchAnalytics) {
        throw new Error(`Search analytics not found for ID ${searchId}`);
      }

      searchAnalytics.clickCount += 1;
      return this.searchAnalyticsRepository.save(searchAnalytics);
    } catch (error) {
      this.logger.error(`Failed to track search result click: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track a search conversion (purchase from search)
   * @param searchId Search ID
   */
  async trackSearchConversion(searchId: string): Promise<SearchAnalytics> {
    try {
      const searchAnalytics = await this.searchAnalyticsRepository.findOne({
        where: { id: searchId },
      });

      if (!searchAnalytics) {
        throw new Error(`Search analytics not found for ID ${searchId}`);
      }

      searchAnalytics.conversionCount += 1;
      return this.searchAnalyticsRepository.save(searchAnalytics);
    } catch (error) {
      this.logger.error(`Failed to track search conversion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top search queries
   * @param limit Limit
   * @param period Period in days
   */
  async getTopSearchQueries(limit = 10, period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('search.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .where('search.timestamp >= :startDate', { startDate })
        .groupBy('search.query')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get top search queries: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search queries with no results
   * @param limit Limit
   * @param period Period in days
   */
  async getZeroResultQueries(limit = 10, period = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('search.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere('search.resultCount = 0')
        .groupBy('search.query')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get zero result queries: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search conversion rate
   * @param period Period in days
   */
  async getSearchConversionRate(period = 30): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('SUM(search.conversionCount)', 'conversions')
        .addSelect('COUNT(*)', 'searches')
        .where('search.timestamp >= :startDate', { startDate })
        .getRawOne();

      if (!result || !result.searches || parseInt(result.searches) === 0) {
        return 0;
      }

      const conversionRate = (parseInt(result.conversions) || 0) / parseInt(result.searches);
      return conversionRate;
    } catch (error) {
      this.logger.error(`Failed to get search conversion rate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search click-through rate
   * @param period Period in days
   */
  async getSearchClickThroughRate(period = 30): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('SUM(search.clickCount)', 'clicks')
        .addSelect('COUNT(*)', 'searches')
        .where('search.timestamp >= :startDate', { startDate })
        .getRawOne();

      if (!result || !result.searches || parseInt(result.searches) === 0) {
        return 0;
      }

      const clickThroughRate = (parseInt(result.clicks) || 0) / parseInt(result.searches);
      return clickThroughRate;
    } catch (error) {
      this.logger.error(`Failed to get search click-through rate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search analytics by time period
   * @param period Period in days
   * @param interval Interval (day, week, month)
   */
  async getSearchAnalyticsByTimePeriod(
    period = 30,
    interval: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      let dateFormat: string;
      switch (interval) {
        case 'week':
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'day':
        default:
          dateFormat = 'YYYY-MM-DD';
          break;
      }

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select(`TO_CHAR(search.timestamp, '${dateFormat}')`, 'period')
        .addSelect('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .where('search.timestamp >= :startDate', { startDate })
        .groupBy('period')
        .orderBy('period', 'ASC')
        .getRawMany();

      return result;
    } catch (error) {
      this.logger.error(`Failed to get search analytics by time period: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search analytics for NLP vs non-NLP searches
   * @param period Period in days
   */
  async getNlpVsRegularSearchAnalytics(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const nlpResult = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere('search.isNlpEnhanced = true')
        .getRawOne();

      const regularResult = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere('search.isNlpEnhanced = false')
        .getRawOne();

      return {
        nlp: {
          searches: parseInt(nlpResult?.searches || '0'),
          clicks: parseInt(nlpResult?.clicks || '0'),
          conversions: parseInt(nlpResult?.conversions || '0'),
          clickThroughRate: nlpResult?.searches
            ? parseInt(nlpResult.clicks || '0') / parseInt(nlpResult.searches)
            : 0,
          conversionRate: nlpResult?.searches
            ? parseInt(nlpResult.conversions || '0') / parseInt(nlpResult.searches)
            : 0,
        },
        regular: {
          searches: parseInt(regularResult?.searches || '0'),
          clicks: parseInt(regularResult?.clicks || '0'),
          conversions: parseInt(regularResult?.conversions || '0'),
          clickThroughRate: regularResult?.searches
            ? parseInt(regularResult.clicks || '0') / parseInt(regularResult.searches)
            : 0,
          conversionRate: regularResult?.searches
            ? parseInt(regularResult.conversions || '0') / parseInt(regularResult.searches)
            : 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get NLP vs regular search analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get entity-specific search analytics
   * @param entityType Entity type
   * @param period Period in days
   */
  async getEntitySearchAnalytics(entityType: SearchEntityType, period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .addSelect('AVG(search.resultCount)', 'avgResultCount')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere(`search.metadata->>'entityType' = :entityType`, { entityType })
        .getRawOne();

      return {
        entityType,
        searches: parseInt(result?.searches || '0'),
        clicks: parseInt(result?.clicks || '0'),
        conversions: parseInt(result?.conversions || '0'),
        avgResultCount: parseFloat(result?.avgResultCount || '0'),
        clickThroughRate: result?.searches
          ? parseInt(result.clicks || '0') / parseInt(result.searches)
          : 0,
        conversionRate: result?.searches
          ? parseInt(result.conversions || '0') / parseInt(result.searches)
          : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get entity search analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search analytics for personalized vs non-personalized searches
   * @param period Period in days
   */
  async getPersonalizedVsRegularSearchAnalytics(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const personalizedResult = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere('search.isPersonalized = true')
        .getRawOne();

      const regularResult = await this.searchAnalyticsRepository
        .createQueryBuilder('search')
        .select('COUNT(*)', 'searches')
        .addSelect('SUM(search.clickCount)', 'clicks')
        .addSelect('SUM(search.conversionCount)', 'conversions')
        .where('search.timestamp >= :startDate', { startDate })
        .andWhere('search.isPersonalized = false')
        .getRawOne();

      return {
        personalized: {
          searches: parseInt(personalizedResult?.searches || '0'),
          clicks: parseInt(personalizedResult?.clicks || '0'),
          conversions: parseInt(personalizedResult?.conversions || '0'),
          clickThroughRate: personalizedResult?.searches
            ? parseInt(personalizedResult.clicks || '0') / parseInt(personalizedResult.searches)
            : 0,
          conversionRate: personalizedResult?.searches
            ? parseInt(personalizedResult.conversions || '0') /
              parseInt(personalizedResult.searches)
            : 0,
        },
        regular: {
          searches: parseInt(regularResult?.searches || '0'),
          clicks: parseInt(regularResult?.clicks || '0'),
          conversions: parseInt(regularResult?.conversions || '0'),
          clickThroughRate: regularResult?.searches
            ? parseInt(regularResult.clicks || '0') / parseInt(regularResult.searches)
            : 0,
          conversionRate: regularResult?.searches
            ? parseInt(regularResult.conversions || '0') / parseInt(regularResult.searches)
            : 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get personalized vs regular search analytics: ${error.message}`);
      throw error;
    }
  }
}
