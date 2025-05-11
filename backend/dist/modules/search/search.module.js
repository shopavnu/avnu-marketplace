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
Object.defineProperty(exports, '__esModule', { value: true });
exports.SearchModule = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const event_emitter_1 = require('@nestjs/event-emitter');
const typeorm_1 = require('@nestjs/typeorm');
const cache_manager_1 = require('@nestjs/cache-manager');
const products_1 = require('../products');
const nlp_1 = require('../nlp');
const personalization_1 = require('../personalization');
const ab_testing_1 = require('../ab-testing');
const analytics_1 = require('../analytics');
const logger_service_1 = require('../../common/services/logger.service');
const search_service_1 = require('./search.service');
const search_controller_1 = require('./search.controller');
const search_resolver_1 = require('./search.resolver');
const elasticsearch_service_1 = require('./services/elasticsearch.service');
const elasticsearch_indexing_service_1 = require('./services/elasticsearch-indexing.service');
const search_index_listener_1 = require('./services/search-index.listener');
const personalized_search_service_1 = require('./services/personalized-search.service');
const discovery_search_service_1 = require('./services/discovery-search.service');
const autocomplete_service_1 = require('./services/autocomplete.service');
const related_products_service_1 = require('./services/related-products.service');
const nlp_search_service_1 = require('./services/nlp-search.service');
const simple_search_service_1 = require('./services/simple-search.service');
const entity_facet_generator_service_1 = require('./services/entity-facet-generator.service');
const entity_relevance_scorer_service_1 = require('./services/entity-relevance-scorer.service');
const search_cache_service_1 = require('./services/search-cache.service');
const search_experiment_service_1 = require('./services/search-experiment.service');
const search_monitoring_service_1 = require('./services/search-monitoring.service');
const personalized_search_controller_1 = require('./controllers/personalized-search.controller');
const indexing_controller_1 = require('./controllers/indexing.controller');
const search_dashboard_controller_1 = require('./controllers/search-dashboard.controller');
const search_dashboard_resolver_1 = require('./resolvers/search-dashboard.resolver');
const search_api_controller_1 = require('./controllers/search-api.controller');
const multi_entity_search_controller_1 = require('./controllers/multi-entity-search.controller');
const personalized_search_resolver_1 = require('./resolvers/personalized-search.resolver');
const discovery_search_resolver_1 = require('./resolvers/discovery-search.resolver');
const autocomplete_resolver_1 = require('./resolvers/autocomplete.resolver');
const related_products_resolver_1 = require('./resolvers/related-products.resolver');
const indexing_resolver_1 = require('./resolvers/indexing.resolver');
const search_api_resolver_1 = require('./resolvers/search-api.resolver');
const multi_entity_search_resolver_1 = require('./resolvers/multi-entity-search.resolver');
const search_suggestion_resolver_1 = require('./resolvers/search-suggestion.resolver');
const search_analytics_resolver_1 = require('./resolvers/search-analytics.resolver');
const cursor_search_resolver_1 = require('./resolvers/cursor-search.resolver');
const user_preference_resolver_1 = require('./resolvers/user-preference.resolver');
const products_2 = require('../products');
const merchants_1 = require('../merchants');
const elasticsearch_module_1 = require('./elasticsearch/elasticsearch.module');
const search_suggestion_service_1 = require('./services/search-suggestion.service');
const search_analytics_service_1 = require('./services/search-analytics.service');
const search_relevance_service_1 = require('./services/search-relevance.service');
const user_preference_service_1 = require('./services/user-preference.service');
const ab_testing_service_1 = require('./services/ab-testing.service');
const preference_collector_service_1 = require('./services/preference-collector.service');
const collaborative_filtering_service_1 = require('./services/collaborative-filtering.service');
const preference_decay_service_1 = require('./services/preference-decay.service');
let SearchModule = class SearchModule {};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        config_1.ConfigModule,
        event_emitter_1.EventEmitterModule.forRoot(),
        elasticsearch_module_1.ElasticsearchConfigModule,
        typeorm_1.TypeOrmModule.forFeature([
          products_2.Product,
          merchants_1.Merchant,
          products_2.Brand,
        ]),
        cache_manager_1.CacheModule.register({
          ttl: 300,
          max: 1000,
          isGlobal: false,
        }),
        products_1.ProductsModule,
        nlp_1.NlpModule,
        personalization_1.PersonalizationModule,
        ab_testing_1.AbTestingModule,
        analytics_1.AnalyticsModule,
      ],
      controllers: [
        search_controller_1.SearchController,
        personalized_search_controller_1.PersonalizedSearchController,
        indexing_controller_1.IndexingController,
        search_api_controller_1.SearchApiController,
        multi_entity_search_controller_1.MultiEntitySearchController,
        search_dashboard_controller_1.SearchDashboardController,
      ],
      providers: [
        search_service_1.SearchService,
        elasticsearch_service_1.ElasticsearchService,
        elasticsearch_indexing_service_1.ElasticsearchIndexingService,
        search_index_listener_1.SearchIndexListener,
        common_1.Logger,
        personalized_search_service_1.PersonalizedSearchService,
        discovery_search_service_1.DiscoverySearchService,
        autocomplete_service_1.AutocompleteService,
        related_products_service_1.RelatedProductsService,
        nlp_search_service_1.NlpSearchService,
        simple_search_service_1.SimpleSearchService,
        entity_facet_generator_service_1.EntityFacetGeneratorService,
        entity_relevance_scorer_service_1.EntityRelevanceScorerService,
        search_cache_service_1.SearchCacheService,
        search_experiment_service_1.SearchExperimentService,
        search_monitoring_service_1.SearchMonitoringService,
        search_suggestion_service_1.SearchSuggestionService,
        search_analytics_service_1.SearchAnalyticsService,
        search_relevance_service_1.SearchRelevanceService,
        user_preference_service_1.UserPreferenceService,
        preference_collector_service_1.PreferenceCollectorService,
        collaborative_filtering_service_1.CollaborativeFilteringService,
        preference_decay_service_1.PreferenceDecayService,
        ab_testing_service_1.ABTestingService,
        search_resolver_1.SearchResolver,
        personalized_search_resolver_1.PersonalizedSearchResolver,
        discovery_search_resolver_1.DiscoverySearchResolver,
        autocomplete_resolver_1.AutocompleteResolver,
        related_products_resolver_1.RelatedProductsResolver,
        indexing_resolver_1.IndexingResolver,
        search_api_resolver_1.SearchApiResolver,
        multi_entity_search_resolver_1.MultiEntitySearchResolver,
        search_dashboard_resolver_1.SearchDashboardResolver,
        search_suggestion_resolver_1.SearchSuggestionResolver,
        search_analytics_resolver_1.SearchAnalyticsResolver,
        cursor_search_resolver_1.CursorSearchResolver,
        user_preference_resolver_1.UserPreferenceResolver,
        logger_service_1.LoggerService,
      ],
      exports: [
        search_service_1.SearchService,
        elasticsearch_service_1.ElasticsearchService,
        elasticsearch_indexing_service_1.ElasticsearchIndexingService,
        personalized_search_service_1.PersonalizedSearchService,
        discovery_search_service_1.DiscoverySearchService,
        autocomplete_service_1.AutocompleteService,
        related_products_service_1.RelatedProductsService,
        nlp_search_service_1.NlpSearchService,
        simple_search_service_1.SimpleSearchService,
        entity_facet_generator_service_1.EntityFacetGeneratorService,
        entity_relevance_scorer_service_1.EntityRelevanceScorerService,
        search_cache_service_1.SearchCacheService,
        search_experiment_service_1.SearchExperimentService,
        search_monitoring_service_1.SearchMonitoringService,
        search_relevance_service_1.SearchRelevanceService,
        user_preference_service_1.UserPreferenceService,
        preference_collector_service_1.PreferenceCollectorService,
        preference_decay_service_1.PreferenceDecayService,
        ab_testing_service_1.ABTestingService,
      ],
    }),
  ],
  SearchModule,
);
//# sourceMappingURL=search.module.js.map
