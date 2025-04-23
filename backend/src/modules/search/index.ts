// Export main module
export * from './search.module';

// Export DTOs
export * from './dto/search-response.dto';

// Export enums
export { SearchEntityType } from './enums/search-entity-type.enum';

// Re-export DTO without the enum to avoid naming conflicts
export {
  SearchOptionsInput,
  FilterOption,
  RangeFilterOption,
  SortOption,
  SortOrder,
} from './dto/search-options.dto';

// Export services
export * from './services/search-cache.service';
export * from './services/search-experiment.service';
export * from './services/search-monitoring.service';
export * from './services/entity-relevance-scorer.service';
export * from './services/discovery-search.service';
export * from './services/autocomplete.service';
export * from './services/related-products.service';
export * from './services/nlp-search.service';

// Export elasticsearch configuration
export * from './elasticsearch/elasticsearch.module';
export * from './elasticsearch/indices.config';
