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
var AnalyticsDashboardService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.AnalyticsDashboardService = void 0;
const common_1 = require('@nestjs/common');
const search_analytics_service_1 = require('./search-analytics.service');
const session_analytics_service_1 = require('./session-analytics.service');
const user_preference_service_1 = require('../../search/services/user-preference.service');
const ab_testing_service_1 = require('../../search/services/ab-testing.service');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const config_1 = require('@nestjs/config');
const search_entity_type_enum_1 = require('../../search/enums/search-entity-type.enum');
let AnalyticsDashboardService = (AnalyticsDashboardService_1 = class AnalyticsDashboardService {
  constructor(
    searchAnalyticsService,
    sessionAnalyticsService,
    userPreferenceService,
    abTestingService,
    elasticsearchService,
    configService,
  ) {
    this.searchAnalyticsService = searchAnalyticsService;
    this.sessionAnalyticsService = sessionAnalyticsService;
    this.userPreferenceService = userPreferenceService;
    this.abTestingService = abTestingService;
    this.elasticsearchService = elasticsearchService;
    this.configService = configService;
    this.logger = new common_1.Logger(AnalyticsDashboardService_1.name);
    this.preferencesIndex = this.configService.get(
      'ELASTICSEARCH_USER_PREFERENCES_INDEX',
      'user_preferences',
    );
    this.interactionsIndex = this.configService.get(
      'ELASTICSEARCH_USER_INTERACTIONS_INDEX',
      'user_interactions',
    );
  }
  async getSearchPerformanceOverview(period = 30) {
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
  async getEntitySearchPerformance(period = 30) {
    try {
      const entityTypes = Object.values(search_entity_type_enum_1.SearchEntityType);
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
  async getUserPreferenceAnalytics(limit = 10) {
    try {
      const topCategories = await this.getTopPreferenceValues('categories', limit);
      const topBrands = await this.getTopPreferenceValues('brands', limit);
      const priceRangeDistribution = await this.getPriceRangeDistribution();
      const interactionStats = await this.getUserInteractionStats();
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
  async getABTestingAnalytics() {
    try {
      const activeTests = await this.abTestingService.getActiveTests();
      const testMetrics = await Promise.all(
        activeTests.map(test => this.abTestingService.getTestMetrics(test.id)),
      );
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
  async getPersonalizationEffectiveness(period = 30) {
    try {
      const personalizedVsRegular =
        await this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period);
      const clickThroughImprovement =
        personalizedVsRegular.personalized.clickThroughRate -
        personalizedVsRegular.regular.clickThroughRate;
      const conversionImprovement =
        personalizedVsRegular.personalized.conversionRate -
        personalizedVsRegular.regular.conversionRate;
      const personalizationUsage = await this.getPersonalizationUsageStats(period);
      const collaborativeFilteringStats = await this.getCollaborativeFilteringStats(period);
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
  async getDashboardOverview(period = 30) {
    try {
      const [conversionRate, clickThroughRate, personalizedVsRegular, topQueries] =
        await Promise.all([
          this.searchAnalyticsService.getSearchConversionRate(period),
          this.searchAnalyticsService.getSearchClickThroughRate(period),
          this.searchAnalyticsService.getPersonalizedVsRegularSearchAnalytics(period),
          this.searchAnalyticsService.getTopSearchQueries(5, period),
        ]);
      const userPreferenceMetrics = await this.getUserPreferenceMetrics();
      const abTestingSummary = await this.getABTestingSummary();
      const sessionAnalyticsOverview =
        await this.sessionAnalyticsService.getSessionAnalyticsOverview(period);
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
  async getTopPreferenceValues(field, limit) {
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
      const aggregations = result.aggregations;
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
  async getPriceRangeDistribution() {
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
      const aggregations = result.aggregations;
      const minBuckets = aggregations?.price_ranges?.min_ranges?.buckets || [];
      const maxBuckets = aggregations?.price_ranges?.max_ranges?.buckets || [];
      const minRanges = minBuckets.map(bucket => ({
        range: `$${bucket.key} - $${bucket.key + 100}`,
        count: bucket.doc_count,
        type: 'min',
      }));
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
  async getUserInteractionStats() {
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
      const aggregations = result.aggregations;
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
  async getPreferenceSourceDistribution() {
    try {
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
      const totalResult = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });
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
  async getPersonalizationUsageStats(period = 30) {
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
      const aggregations = result.aggregations;
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
  async getCollaborativeFilteringStats(_period = 30) {
    try {
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
      const aggregations = similarityResult.aggregations;
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
  async getUserPreferenceMetrics() {
    try {
      const totalUsers = await this.elasticsearchService.count({
        index: this.preferencesIndex,
      });
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
  async getABTestingSummary() {
    try {
      const activeTests = await this.abTestingService.getActiveTests();
      const totalTests = activeTests.length;
      const testMetrics = await Promise.all(
        activeTests.map(test => this.abTestingService.getTestMetrics(test.id)),
      );
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
});
exports.AnalyticsDashboardService = AnalyticsDashboardService;
exports.AnalyticsDashboardService =
  AnalyticsDashboardService =
  AnalyticsDashboardService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          search_analytics_service_1.SearchAnalyticsService,
          session_analytics_service_1.SessionAnalyticsService,
          user_preference_service_1.UserPreferenceService,
          ab_testing_service_1.ABTestingService,
          elasticsearch_1.ElasticsearchService,
          config_1.ConfigService,
        ]),
      ],
      AnalyticsDashboardService,
    );
//# sourceMappingURL=analytics-dashboard.service.js.map
