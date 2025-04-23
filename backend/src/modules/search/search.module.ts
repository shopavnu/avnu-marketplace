import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Import modules using barrel files
import { ProductsModule } from '@modules/products';
import { NlpModule } from '@modules/nlp';
import { PersonalizationModule } from '@modules/personalization';
import { AbTestingModule } from '@modules/ab-testing';
import { AnalyticsModule } from '@modules/analytics';

// Import common services
import { LoggerService } from '@common/services/logger.service';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchResolver } from './search.resolver';
import { ElasticsearchService } from './services/elasticsearch.service';
import { ElasticsearchIndexingService } from './services/elasticsearch-indexing.service';
import { SearchIndexListener } from './services/search-index.listener';
import { PersonalizedSearchService } from './services/personalized-search.service';
import { DiscoverySearchService } from './services/discovery-search.service';
import { AutocompleteService } from './services/autocomplete.service';
import { RelatedProductsService } from './services/related-products.service';
import { NlpSearchService } from './services/nlp-search.service';
import { SimpleSearchService } from './services/simple-search.service';
import { EntityFacetGeneratorService } from './services/entity-facet-generator.service';
import { EntityRelevanceScorerService } from './services/entity-relevance-scorer.service';
import { SearchCacheService } from './services/search-cache.service';
import { SearchExperimentService } from './services/search-experiment.service';
import { SearchMonitoringService } from './services/search-monitoring.service';
import { PersonalizedSearchController } from './controllers/personalized-search.controller';
import { IndexingController } from './controllers/indexing.controller';
import { SearchDashboardController } from './controllers/search-dashboard.controller';
import { SearchDashboardResolver } from './resolvers/search-dashboard.resolver';
import { SearchApiController } from './controllers/search-api.controller';
import { MultiEntitySearchController } from './controllers/multi-entity-search.controller';
import { PersonalizedSearchResolver } from './resolvers/personalized-search.resolver';
import { DiscoverySearchResolver } from './resolvers/discovery-search.resolver';
import { AutocompleteResolver } from './resolvers/autocomplete.resolver';
import { RelatedProductsResolver } from './resolvers/related-products.resolver';
import { IndexingResolver } from './resolvers/indexing.resolver';
import { SearchApiResolver } from './resolvers/search-api.resolver';
import { MultiEntitySearchResolver } from './resolvers/multi-entity-search.resolver';
import { SearchSuggestionResolver } from './resolvers/search-suggestion.resolver';
import { SearchAnalyticsResolver } from './resolvers/search-analytics.resolver';
import { CursorSearchResolver } from './resolvers/cursor-search.resolver';
import { UserPreferenceResolver } from './resolvers/user-preference.resolver';
// Import entities using barrel files
import { Product, Brand } from '@modules/products';
import { Merchant } from '@modules/merchants';
import { ElasticsearchConfigModule } from './elasticsearch/elasticsearch.module';
import { SearchSuggestionService } from './services/search-suggestion.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { SearchRelevanceService } from './services/search-relevance.service';
import { UserPreferenceService } from './services/user-preference.service';
import { ABTestingService } from './services/ab-testing.service';
import { PreferenceCollectorService } from './services/preference-collector.service';
import { CollaborativeFilteringService } from './services/collaborative-filtering.service';
import { PreferenceDecayService } from './services/preference-decay.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    ElasticsearchConfigModule,
    TypeOrmModule.forFeature([Product, Merchant, Brand]),
    CacheModule.register({
      ttl: 300, // Default TTL: 5 minutes
      max: 1000, // Maximum number of items in cache
      isGlobal: false,
    }),
    ProductsModule,
    NlpModule,
    PersonalizationModule,
    AbTestingModule,
    AnalyticsModule,
  ],
  controllers: [
    SearchController,
    PersonalizedSearchController,
    IndexingController,
    SearchApiController,
    MultiEntitySearchController,
    SearchDashboardController,
  ],
  providers: [
    // Core services
    SearchService,
    ElasticsearchService,
    ElasticsearchIndexingService,
    SearchIndexListener,

    // NestJS built-in Logger
    Logger,

    // Search-related services
    PersonalizedSearchService,
    DiscoverySearchService,
    AutocompleteService,
    RelatedProductsService,
    NlpSearchService,
    SimpleSearchService,
    EntityFacetGeneratorService,
    EntityRelevanceScorerService,
    SearchCacheService,
    SearchExperimentService,
    SearchMonitoringService,
    SearchSuggestionService,
    SearchAnalyticsService,

    // Search relevance enhancement services
    SearchRelevanceService,
    UserPreferenceService,
    PreferenceCollectorService,
    CollaborativeFilteringService,
    PreferenceDecayService,
    ABTestingService,

    // Resolvers
    SearchResolver,
    PersonalizedSearchResolver,
    DiscoverySearchResolver,
    AutocompleteResolver,
    RelatedProductsResolver,
    IndexingResolver,
    SearchApiResolver,
    MultiEntitySearchResolver,
    SearchDashboardResolver,
    SearchSuggestionResolver,
    SearchAnalyticsResolver,
    CursorSearchResolver,
    UserPreferenceResolver,

    // Common services
    LoggerService,
  ],
  exports: [
    SearchService,
    ElasticsearchService,
    ElasticsearchIndexingService,
    PersonalizedSearchService,
    DiscoverySearchService,
    AutocompleteService,
    RelatedProductsService,
    NlpSearchService,
    SimpleSearchService,
    EntityFacetGeneratorService,
    EntityRelevanceScorerService,
    SearchCacheService,
    SearchExperimentService,
    SearchMonitoringService,
    SearchRelevanceService,
    UserPreferenceService,
    PreferenceCollectorService,
    PreferenceDecayService,
    ABTestingService,
  ],
})
export class SearchModule {}
