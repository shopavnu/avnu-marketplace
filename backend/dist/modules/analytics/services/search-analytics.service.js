'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var SearchAnalyticsService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchAnalyticsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const search_analytics_entity_1 = require('../entities/search-analytics.entity');
let SearchAnalyticsService = (SearchAnalyticsService_1 = class SearchAnalyticsService {
  constructor(searchAnalyticsRepository) {
    this.searchAnalyticsRepository = searchAnalyticsRepository;
    this.logger = new common_1.Logger(SearchAnalyticsService_1.name);
  }
  async trackSearch(data) {
    try {
      const searchAnalytics = this.searchAnalyticsRepository.create(data);
      return this.searchAnalyticsRepository.save(searchAnalytics);
    } catch (error) {
      this.logger.error(`Failed to track search: ${error.message}`);
      throw error;
    }
  }
  async trackEvent(event, data) {
    try {
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
      const searchData = {
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
      if (entityType) {
        searchData.metadata.entityType = entityType;
      }
      if (entityBoosting) {
        searchData.metadata.entityBoosting = entityBoosting;
      }
      if (data.entityDistribution) {
        searchData.metadata.entityDistribution = data.entityDistribution;
      }
      if (data.relevanceScores) {
        searchData.metadata.relevanceScores = data.relevanceScores;
      }
      searchData.metadata.eventType = event;
      await this.trackSearch(searchData);
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
  async trackSearchResultClick(searchId) {
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
  async trackSearchConversion(searchId) {
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
  async getTopSearchQueries(limit = 10, period = 30) {
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
  async getZeroResultQueries(limit = 10, period = 30) {
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
  async getSearchConversionRate(period = 30) {
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
  async getSearchClickThroughRate(period = 30) {
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
  async getSearchAnalyticsByTimePeriod(period = 30, interval = 'day') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      let dateFormat;
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
  async getNlpVsRegularSearchAnalytics(period = 30) {
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
  async getEntitySearchAnalytics(entityType, period = 30) {
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
  async getPersonalizedVsRegularSearchAnalytics(period = 30) {
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
});
exports.SearchAnalyticsService = SearchAnalyticsService;
exports.SearchAnalyticsService =
  SearchAnalyticsService =
  SearchAnalyticsService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __param(0, (0, typeorm_1.InjectRepository)(search_analytics_entity_1.SearchAnalytics)),
        __metadata('design:paramtypes', [typeorm_2.Repository]),
      ],
      SearchAnalyticsService,
    );
//# sourceMappingURL=search-analytics.service.js.map
