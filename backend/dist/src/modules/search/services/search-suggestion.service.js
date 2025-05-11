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
var SearchSuggestionService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchSuggestionService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const personalization_service_1 = require('../../personalization/services/personalization.service');
const search_analytics_service_1 = require('./search-analytics.service');
let SearchSuggestionService = (SearchSuggestionService_1 = class SearchSuggestionService {
  constructor(elasticsearchService, configService, personalizationService, searchAnalyticsService) {
    this.elasticsearchService = elasticsearchService;
    this.configService = configService;
    this.personalizationService = personalizationService;
    this.searchAnalyticsService = searchAnalyticsService;
    this.logger = new common_1.Logger(SearchSuggestionService_1.name);
    this.defaultLimit = 10;
    this.isFeatureEnabled = true;
    this.suggestionIndex = this.configService.get('ELASTICSEARCH_SUGGESTION_INDEX', 'suggestions');
    this.maxSuggestions = this.configService.get('MAX_SUGGESTIONS', 20);
  }
  async getSuggestions(input, user) {
    const {
      query,
      limit = this.defaultLimit,
      includePopular = true,
      includePersonalized = true,
    } = input;
    if (!query || query.length < 2) {
      this.logger.debug('Query too short, returning empty results');
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
      };
    }
    try {
      const prefixSuggestions = await this.getPrefixSuggestions(query, limit);
      const popularSuggestions = includePopular
        ? await this.getPopularSuggestions(query, limit)
        : [];
      const personalizedSuggestions =
        includePersonalized && user
          ? await this.getPersonalizedSuggestions(query, user, limit)
          : [];
      const combinedSuggestions = this.combineAndDeduplicate(
        prefixSuggestions,
        popularSuggestions,
        personalizedSuggestions,
        limit,
      );
      this.logger.debug(`Returning ${combinedSuggestions.length} suggestions`);
      if (combinedSuggestions.length > 0) {
        this.searchAnalyticsService
          .trackSuggestionImpression(query, combinedSuggestions.length, user)
          .catch(error => {
            this.logger.error(
              `Failed to track suggestion impression: ${error.message}`,
              error.stack,
            );
          });
      }
      return {
        suggestions: combinedSuggestions,
        total: combinedSuggestions.length,
        isPersonalized: personalizedSuggestions.length > 0,
        originalQuery: query,
      };
    } catch (error) {
      this.logger.error(`Error getting suggestions: ${error.message}`, error.stack);
      return {
        suggestions: [],
        total: 0,
        isPersonalized: false,
        originalQuery: query,
      };
    }
  }
  async getPrefixSuggestions(query, limit) {
    try {
      const response = await this.elasticsearchService.search({
        index: 'search_suggestions',
        body: {
          suggest: {
            completion: {
              prefix: query,
              completion: {
                field: 'text.completion',
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: 1,
                },
              },
            },
          },
        },
      });
      const options = response.suggest?.completion?.[0]?.options;
      let suggestions = Array.isArray(options) ? options : [];
      if (suggestions.length < limit) {
        const fallbackResponse = await this.elasticsearchService.search({
          index: 'products,merchants,brands',
          body: {
            suggest: {
              completion: {
                prefix: query,
                completion: {
                  field: 'name.completion',
                  size: limit - suggestions.length,
                  skip_duplicates: true,
                  fuzzy: {
                    fuzziness: 1,
                  },
                },
              },
            },
          },
        });
        const fallbackOptions = fallbackResponse.suggest?.completion?.[0]?.options;
        if (Array.isArray(fallbackOptions) && fallbackOptions.length > 0) {
          suggestions = [...suggestions, ...fallbackOptions];
        }
      }
      return suggestions.map(option => {
        const source = option._source;
        return {
          text: source.text || source.name,
          score: source.score || source.popularity || 1.0,
          category: source.category,
          type: source.type || option._index.replace(/s$/, ''),
          isPopular: false,
          isPersonalized: false,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error getting prefix suggestions for "${query}": ${error.message}`,
        error.stack,
        SearchSuggestionService_1.name,
      );
      return [];
    }
  }
  async getPopularSuggestions(query, limit = 5) {
    if (!this.isFeatureEnabled || !query || query.length < 2) {
      return [];
    }
    try {
      const popularQueries = await this.searchAnalyticsService.getPopularSearchQueries(7, 20);
      const matchingQueries = popularQueries
        .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        .map(item => ({
          text: item.query,
          score: Math.min(10, 5 + Math.log(item.count)),
          category: this.getCategoryFromQuery(item.query),
          type: 'search',
          isPopular: true,
          isPersonalized: false,
        }))
        .slice(0, limit);
      return matchingQueries;
    } catch (error) {
      this.logger.error(`Error getting popular suggestions: ${error.message}`, error.stack);
      return [];
    }
  }
  async getPersonalizedSuggestions(query, user, limit) {
    const userId = user.id;
    try {
      const personalizedSuggestions = await this.personalizationService.getPersonalizedSuggestions(
        query,
        userId,
        limit,
      );
      return personalizedSuggestions.map(suggestion => ({
        text: suggestion.text,
        score: suggestion.relevance,
        category: suggestion.category,
        type: suggestion.type,
        isPopular: false,
        isPersonalized: true,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting personalized suggestions for user ${userId}: ${error.message}`,
        error.stack,
        SearchSuggestionService_1.name,
      );
      return [];
    }
  }
  combineAndDeduplicate(prefixSuggestions, popularSuggestions, personalizedSuggestions, limit) {
    const _allSuggestions = [
      ...prefixSuggestions,
      ...popularSuggestions,
      ...personalizedSuggestions,
    ];
    const suggestionMap = new Map();
    for (const suggestion of personalizedSuggestions) {
      suggestionMap.set(suggestion.text.toLowerCase(), suggestion);
    }
    for (const suggestion of popularSuggestions) {
      const key = suggestion.text.toLowerCase();
      if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
        suggestionMap.set(key, suggestion);
      }
    }
    for (const suggestion of prefixSuggestions) {
      const key = suggestion.text.toLowerCase();
      if (!suggestionMap.has(key) || suggestion.score > suggestionMap.get(key).score) {
        suggestionMap.set(key, suggestion);
      }
    }
    const combinedSuggestions = Array.from(suggestionMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return combinedSuggestions;
  }
  getCategoryFromQuery(query) {
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery.includes('shirt') ||
      lowerQuery.includes('dress') ||
      lowerQuery.includes('cotton')
    ) {
      return 'clothing';
    }
    if (
      lowerQuery.includes('table') ||
      lowerQuery.includes('chair') ||
      lowerQuery.includes('sofa')
    ) {
      return 'furniture';
    }
    if (
      lowerQuery.includes('phone') ||
      lowerQuery.includes('laptop') ||
      lowerQuery.includes('camera')
    ) {
      return 'electronics';
    }
    if (
      lowerQuery.includes('eco') ||
      lowerQuery.includes('sustainable') ||
      lowerQuery.includes('organic')
    ) {
      return 'eco-friendly';
    }
    return undefined;
  }
});
exports.SearchSuggestionService = SearchSuggestionService;
exports.SearchSuggestionService =
  SearchSuggestionService =
  SearchSuggestionService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          elasticsearch_1.ElasticsearchService,
          config_1.ConfigService,
          personalization_service_1.PersonalizationService,
          search_analytics_service_1.SearchAnalyticsService,
        ]),
      ],
      SearchSuggestionService,
    );
//# sourceMappingURL=search-suggestion.service.js.map
