import { Injectable, Logger } from '@nestjs/common';
import { SearchAnalyticsService } from './search-analytics.service';
import { SessionAnalyticsService } from './session-analytics.service';
import { UserPreferenceService } from '../../search/services/user-preference.service';
import { ABTestingService } from '../../search/services/ab-testing.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '../../search/enums/search-entity-type.enum';

/**
 * Service for providing analytics dashboard data
 */
@Injectable()
export class AnalyticsDashboardService {
  private readonly logger = new Logger(AnalyticsDashboardService.name);
  private readonly preferencesIndex: string;
  private readonly interactionsIndex: string;

  constructor(
    private readonly searchAnalyticsService: SearchAnalyticsService,
    private readonly sessionAnalyticsService: SessionAnalyticsService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly abTestingService: ABTestingService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this.preferencesIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.interactionsIndex = this.configService.get<string>(
      'ELASTICSEARCH_USER_INTERACTIONS_INDEX',
      'user_interactions',
    );
  }

  /**
   * Get search performance overview
   *
   * @param period Period in days
   * @returns Search performance metrics
   */
  async getSearchPerformanceOverview(period = 30): Promise<any> {
    try {
      const [
        topQueries,
        zeroResultQueries,
        conversionRate,
        clickThroughRate,
        timeSeriesData,
        personalizedVsRegular,
        nlpVsRegular,
      ] = await Promise.all([
        this.searchAnalyticsService.getTopSearchQueries(10, period),
        this.searchAnalyticsService.getZeroResultQueries(10, period),
        this.searchAnalyticsService.getSearchConversionRate(period),
        this.searchAnalyticsService.getSearchClickThroughRate(period),
        this.searchAnalyticsService.getSearchAnalyticsByTimePeriod(period),
        this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period),
        this.searchAnalyticsService.getNlpVsRegularSearchAnalytics(period),
      ]);

      return {
        topQueries,
        zeroResultQueries,
        conversionRate,
        clickThroughRate,
        timeSeriesData,
        personalizedVsRegular,
        nlpVsRegular,
      };
    } catch (error) {
      this.logger.error(`Failed to get search performance overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get entity search performance
   *
   * @param period Period in days
   * @returns Entity search performance metrics
   */
  async getEntitySearchPerformance(period = 30): Promise<any> {
    try {
      const entityTypes = Object.values(SearchEntityType);

      const entityAnalytics = await Promise.all(
        entityTypes.map(entityType =>
          this.searchAnalyticsService.getEntitySearchAnalytics(entityType, period),
        ),
      );

      return entityAnalytics;
    } catch (error) {
      this.logger.error(`Failed to get entity search performance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user preference analytics
   *
   * @param limit Maximum number of items to return
   * @returns User preference analytics
   */
  async getUserPreferenceAnalytics(limit = 10): Promise<any> {
    try {
      // Get top categories
      const topCategories = await this.getTopPreferenceValues('categories', limit);

      // Get top brands
      const topBrands = await this.getTopPreferenceValues('brands', limit);

      // Get price range distribution
      const priceRangeDistribution = await this.getPriceRangeDistribution();

      // Get user interaction statistics
      const interactionStats = await this.getUserInteractionStats();

      // Get preference source distribution
      const preferenceSourceDistribution = await this.getPreferenceSourceDistribution();

      return {
        topCategories,
        topBrands,
        priceRangeDistribution,
        interactionStats,
        preferenceSourceDistribution,
      };
    } catch (error) {
      this.logger.error(`Failed to get user preference analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get A/B testing analytics
   *
   * @returns A/B testing analytics
   */
  async getABTestingAnalytics(): Promise<any> {
    try {
      // Get active tests
      const activeTests = await this.abTestingService.getActiveTests();

      // Get test metrics for each active test
      const testMetrics = await Promise.all(
        activeTests.map(test => this.abTestingService.getTestMetrics(test.id)),
      );

      // Combine test data with metrics
      const abTestAnalytics = activeTests.map((test, index) => ({
        ...test,
        metrics: testMetrics[index],
      }));

      return abTestAnalytics;
    } catch (error) {
      this.logger.error(`Failed to get A/B testing analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get personalization effectiveness metrics
   *
   * @param period Period in days
   * @returns Personalization effectiveness metrics
   */
  async getPersonalizationEffectiveness(period = 30): Promise<any> {
    try {
      // Get personalized vs regular search performance
      const personalizedVsRegular =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);

      // Calculate improvement metrics
      const clickThroughImprovement =
        personalizedVsRegular.personalized.clickThroughRate -
        personalizedVsRegular.regular.clickThroughRate;

      const conversionImprovement =
        personalizedVsRegular.personalized.conversionRate -
        personalizedVsRegular.regular.conversionRate;

      // Get personalization usage statistics
      const personalizationUsage = await this.getPersonalizationUsageStats(period);

      // Get collaborative filtering effectiveness
      const collaborativeFilteringStats = await this.getCollaborativeFilteringStats(period);

      // Get session-based personalization effectiveness
      const sessionPersonalizationEffectiveness =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(period);

      return {
        personalizedVsRegular,
        improvements: {
          clickThroughImprovement,
          conversionImprovement,
          clickThroughImprovementPercentage: personalizedVsRegular.regular.clickThroughRate
            ? (clickThroughImprovement / personalizedVsRegular.regular.clickThroughRate) * 100
            : 0,
          conversionImprovementPercentage: personalizedVsRegular.regular.conversionRate
            ? (conversionImprovement / personalizedVsRegular.regular.conversionRate) * 100
            : 0,
        },
        personalizationUsage,
        collaborativeFilteringStats,
        sessionPersonalization: {
          interactionTypeDistribution:
            sessionPersonalizationEffectiveness.interactionTypeDistribution,
          dwellTimeMetrics:
            sessionPersonalizationEffectiveness.personalizationEffectiveness.dwellTimeMetrics,
          clickThroughRates:
            sessionPersonalizationEffectiveness.personalizationEffectiveness.clickThroughRates,
          impressionToClickRates:
            sessionPersonalizationEffectiveness.personalizationEffectiveness.impressionToClickRates,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get personalization effectiveness: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get dashboard overview with key metrics
   *
   * @param period Period in days
   * @returns Dashboard overview metrics
   */
  async getDashboardOverview(period = 30): Promise<any> {
    try {
      // Get search metrics
      const [conversionRate, clickThroughRate, personalizedVsRegular, topQueries] =
        await Promise.all([
          this.searchAnalyticsService.getSearchConversionRate(period),
          this.searchAnalyticsService.getSearchClickThroughRate(period),
          this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period),
          this.searchAnalyticsService.getTopSearchQueries(5, period),
        ]);

      // Get user preference metrics
      const userPreferenceMetrics = await this.getUserPreferenceMetrics();

      // Get A/B testing summary
      const abTestingSummary = await this.getABTestingSummary();

      // Get session analytics overview
      const sessionAnalyticsOverview =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(period);

      // Calculate personalization impact
      const personalizationImpact = {
        clickThroughImprovement:
          personalizedVsRegular.personalized.clickThroughRate -
          personalizedVsRegular.regular.clickThroughRate,
        conversionImprovement:
          personalizedVsRegular.personalized.conversionRate -
          personalizedVsRegular.regular.conversionRate,
      };

      return {
        searchMetrics: {
          conversionRate,
          clickThroughRate,
          personalizedVsRegular,
          topQueries,
        },
        userPreferenceMetrics,
        abTestingSummary,
        personalizationImpact,
        sessionAnalytics: {
          totalSessions: sessionAnalyticsOverview.totalSessions,
          avgInteractionsPerSession: sessionAnalyticsOverview.avgInteractionsPerSession,
          avgSessionDuration: sessionAnalyticsOverview.avgSessionDuration,
          interactionTypeDistribution: sessionAnalyticsOverview.interactionTypeDistribution,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get top preference values for a specific field
   *
   * @param field Field name (categories, brands, etc.)
   * @param limit Maximum number of items to return
   * @returns Top preference values
   */
  private async getTopPreferenceValues(field: string, limit: number): Promise<any[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          size: 0,
          aggs: {
            all_preferences: {
              nested: {
                path: field,
              },
              aggs: {
                keys: {
                  terms: {
                    field: `${field}.key`,
                    size: limit,
                  },
                  aggs: {
                    avg_weight: {
                      avg: {
                        field: `${field}.value`,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const aggregations = result.aggregations as any;
      const buckets = aggregations?.all_preferences?.keys?.buckets || [];

      return buckets.map(bucket => ({
        name: bucket.key,
        count: bucket.doc_count,
        averageWeight: bucket.avg_weight.value,
      }));
    } catch (error) {
      this.logger.error(`Failed to get top preference values for ${field}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get price range distribution from user preferences
   *
   * @returns Price range distribution
   */
  private async getPriceRangeDistribution(): Promise<any[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          size: 0,
          aggs: {
            price_ranges: {
              nested: {
                path: 'priceRanges',
              },
              aggs: {
                min_ranges: {
                  histogram: {
                    field: 'priceRanges.min',
                    interval: 100,
                    min_doc_count: 1,
                  },
                },
                max_ranges: {
                  histogram: {
                    field: 'priceRanges.max',
                    interval: 100,
                    min_doc_count: 1,
                  },
                },
              },
            },
          },
        },
      });

      const aggregations = result.aggregations as any;
      const minBuckets = aggregations?.price_ranges?.min_ranges?.buckets || [];
      const maxBuckets = aggregations?.price_ranges?.max_ranges?.buckets || [];

      // Process min ranges
      const minRanges = minBuckets.map(bucket => ({
        range: `$${bucket.key} - $${bucket.key + 100}`,
        count: bucket.doc_count,
        type: 'min',
      }));

      // Process max ranges
      const maxRanges = maxBuckets.map(bucket => ({
        range: `$${bucket.key} - $${bucket.key + 100}`,
        count: bucket.doc_count,
        type: 'max',
      }));

      return [...minRanges, ...maxRanges];
    } catch (error) {
      this.logger.error(`Failed to get price range distribution: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user interaction statistics
   *
   * @returns User interaction statistics
   */
  private async getUserInteractionStats(): Promise<any> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.interactionsIndex,
        body: {
          size: 0,
          aggs: {
            interaction_types: {
              terms: {
                field: 'type',
                size: 10,
              },
            },
            interactions_over_time: {
              date_histogram: {
                field: 'timestamp',
                calendar_interval: 'day',
                format: 'yyyy-MM-dd',
              },
            },
            unique_users: {
              cardinality: {
                field: 'userId',
              },
            },
          },
        },
      });

      const aggregations = result.aggregations as any;

      return {
        interactionTypes: (aggregations?.interaction_types?.buckets || []).map(bucket => ({
          type: bucket.key,
          count: bucket.doc_count,
        })),
        interactionsOverTime: (aggregations?.interactions_over_time?.buckets || []).map(bucket => ({
          date: bucket.key_as_string,
          count: bucket.doc_count,
        })),
        uniqueUsers: aggregations?.unique_users?.value || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get user interaction stats: ${error.message}`);
      return {
        interactionTypes: [],
        interactionsOverTime: [],
        uniqueUsers: 0,
      };
    }
  }

  /**
   * Get preference source distribution
   *
   * @returns Preference source distribution
   */
  private async getPreferenceSourceDistribution(): Promise<any> {
    try {
      // Count preferences with survey data
      const surveyResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.shoppingFrequency',
                  },
                },
              ],
            },
          },
        },
      });

      // Count preferences with collaborative filtering
      const collaborativeResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.collaborativeFiltering',
                  },
                },
              ],
            },
          },
        },
      });

      // Count total preferences
      const totalResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });

      // Count preferences with behavior data (interactions)
      const behaviorResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    'recentSearches.length': {
                      gt: 0,
                    },
                  },
                },
              ],
            },
          },
        },
      });

      const surveyCount = surveyResult.count;
      const collaborativeCount = collaborativeResult.count;
      const behaviorCount = behaviorResult.count;
      const totalCount = totalResult.count;

      return {
        survey: {
          count: surveyCount,
          percentage: totalCount > 0 ? (surveyCount / totalCount) * 100 : 0,
        },
        collaborative: {
          count: collaborativeCount,
          percentage: totalCount > 0 ? (collaborativeCount / totalCount) * 100 : 0,
        },
        behavior: {
          count: behaviorCount,
          percentage: totalCount > 0 ? (behaviorCount / totalCount) * 100 : 0,
        },
        total: totalCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get preference source distribution: ${error.message}`);
      return {
        survey: { count: 0, percentage: 0 },
        collaborative: { count: 0, percentage: 0 },
        behavior: { count: 0, percentage: 0 },
        total: 0,
      };
    }
  }

  /**
   * Get personalization usage statistics
   *
   * @param period Period in days
   * @returns Personalization usage statistics
   */
  private async getPersonalizationUsageStats(period = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const result = await this.elasticsearchService.search({
        index: this.interactionsIndex,
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                {
                  range: {
                    timestamp: {
                      gte: startDate.toISOString(),
                    },
                  },
                },
                {
                  term: {
                    type: 'search',
                  },
                },
              ],
            },
          },
          aggs: {
            personalization_strength: {
              terms: {
                field: 'data.personalizationStrength',
                missing: 0,
              },
            },
            personalization_enabled: {
              filter: {
                term: {
                  'data.enablePersonalization': true,
                },
              },
            },
            collaborative_enabled: {
              filter: {
                term: {
                  'data.useCollaborativeFiltering': true,
                },
              },
            },
            total_searches: {
              value_count: {
                field: '_id',
              },
            },
          },
        },
      });

      const aggregations = result.aggregations as any;
      const totalSearches = aggregations?.total_searches?.value || 0;
      const personalizedSearches = aggregations?.personalization_enabled?.doc_count || 0;
      const collaborativeSearches = aggregations?.collaborative_enabled?.doc_count || 0;

      return {
        totalSearches,
        personalizedSearches,
        collaborativeSearches,
        personalizationRate: totalSearches > 0 ? (personalizedSearches / totalSearches) * 100 : 0,
        collaborativeRate:
          personalizedSearches > 0 ? (collaborativeSearches / personalizedSearches) * 100 : 0,
        strengthDistribution: (aggregations?.personalization_strength?.buckets || []).map(
          bucket => ({
            strength: bucket.key || 0,
            count: bucket.doc_count,
            percentage: totalSearches > 0 ? (bucket.doc_count / totalSearches) * 100 : 0,
          }),
        ),
      };
    } catch (error) {
      this.logger.error(`Failed to get personalization usage stats: ${error.message}`);
      return {
        totalSearches: 0,
        personalizedSearches: 0,
        collaborativeSearches: 0,
        personalizationRate: 0,
        collaborativeRate: 0,
        strengthDistribution: [],
      };
    }
  }

  /**
   * Get collaborative filtering statistics
   *
   * @param period Period in days
   * @returns Collaborative filtering statistics
   */
  private async getCollaborativeFilteringStats(_period = 30): Promise<any> {
    try {
      // Get users with collaborative filtering applied
      const usersWithCollaborative = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.collaborativeFiltering',
                  },
                },
              ],
            },
          },
        },
      });

      // Get average similarity score
      const similarityResult = await this.elasticsearchService.search({
        index: this.preferencesIndex,
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.collaborativeFiltering.averageSimilarity',
                  },
                },
              ],
            },
          },
          aggs: {
            avg_similarity: {
              avg: {
                field: 'additionalData.collaborativeFiltering.averageSimilarity',
              },
            },
            similarity_distribution: {
              histogram: {
                field: 'additionalData.collaborativeFiltering.averageSimilarity',
                interval: 0.1,
                min_doc_count: 1,
              },
            },
          },
        },
      });

      const aggregations = similarityResult.aggregations as any;

      return {
        usersWithCollaborative: usersWithCollaborative.count,
        averageSimilarity: aggregations?.avg_similarity?.value || 0,
        similarityDistribution: (aggregations?.similarity_distribution?.buckets || []).map(
          bucket => ({
            range: `${bucket.key.toFixed(1)} - ${(bucket.key + 0.1).toFixed(1)}`,
            count: bucket.doc_count,
          }),
        ),
      };
    } catch (error) {
      this.logger.error(`Failed to get collaborative filtering stats: ${error.message}`);
      return {
        usersWithCollaborative: 0,
        averageSimilarity: 0,
        similarityDistribution: [],
      };
    }
  }

  /**
   * Get user preference metrics
   *
   * @returns User preference metrics
   */
  private async getUserPreferenceMetrics(): Promise<any> {
    try {
      // Get total users with preferences
      const totalUsers = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });

      // Get users with survey data
      const surveyUsers = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.shoppingFrequency',
                  },
                },
              ],
            },
          },
        },
      });

      // Get users with collaborative filtering
      const collaborativeUsers = await this.elasticsearchService.count({
        index: this.preferencesIndex,
        body: {
          query: {
            bool: {
              must: [
                {
                  exists: {
                    field: 'additionalData.collaborativeFiltering',
                  },
                },
              ],
            },
          },
        },
      });

      // Get top 3 categories
      const topCategories = await this.getTopPreferenceValues('categories', 3);

      return {
        totalUsers: totalUsers.count,
        surveyUsers: surveyUsers.count,
        collaborativeUsers: collaborativeUsers.count,
        topCategories,
      };
    } catch (error) {
      this.logger.error(`Failed to get user preference metrics: ${error.message}`);
      return {
        totalUsers: 0,
        surveyUsers: 0,
        collaborativeUsers: 0,
        topCategories: [],
      };
    }
  }

  /**
   * Get A/B testing summary
   *
   * @returns A/B testing summary
   */
  private async getABTestingSummary(): Promise<any> {
    try {
      // Get active tests
      const activeTests = await this.abTestingService.getActiveTests();

      // Get total tests count
      const totalTests = activeTests.length;

      // Get test metrics for each active test
      const testMetrics = await Promise.all(
        activeTests.map(test => this.abTestingService.getTestMetrics(test.id)),
      );

      // Get tests with significant results
      const significantTests = testMetrics.filter(
        metrics => metrics && metrics.hasSignificantResult === true,
      );

      return {
        totalTests,
        activeTests: totalTests,
        significantTests: significantTests.length,
        topTest:
          testMetrics.length > 0
            ? {
                name: testMetrics[0].testName,
                improvement: testMetrics[0].bestVariant?.improvement || 0,
              }
            : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get A/B testing summary: ${error.message}`);
      return {
        totalTests: 0,
        activeTests: 0,
        significantTests: 0,
        topTest: null,
      };
    }
  }
}
