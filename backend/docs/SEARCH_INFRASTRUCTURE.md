# Avnu Marketplace Search Infrastructure

## Overview

The Avnu Marketplace Search Infrastructure provides a sophisticated, multi-entity search system that powers product discovery, personalization, and analytics. Built on Elasticsearch with NestJS and GraphQL, it supports advanced features like natural language processing, personalization, and A/B testing.

## Architecture

### Core Components

- **Elasticsearch Cluster**: Powers the search engine with multiple indices
- **NestJS Backend**: Provides the API layer and business logic
- **GraphQL API**: Exposes search functionality through a flexible API
- **Redis Cache**: Caches search results for performance
- **Analytics Pipeline**: Tracks search performance and user behavior

### Search Indices

- **Products Index**: Stores product data optimized for search
- **Merchants Index**: Stores merchant data for merchant search
- **Brands Index**: Stores brand data for brand search
- **Analytics Index**: Stores search analytics data
- **Suggestions Index**: Powers autocomplete and search suggestions

## Search Features

### Multi-Entity Search

The system supports searching across different entity types:

- **Products**: Search for products with advanced filtering
- **Merchants**: Search for merchants with specialized filters
- **Brands**: Search for brands with dedicated filters
- **Unified Search**: Search across all entity types simultaneously

### Advanced Search Capabilities

- **Faceted Search**: Dynamic facets based on search results
- **Filtering**: Advanced filtering options for each entity type
- **Sorting**: Multiple sorting options including relevance, price, etc.
- **Pagination**: Both offset-based and cursor-based pagination
- **Highlighting**: Highlighting of matching terms in results

### Natural Language Processing

- **Query Understanding**: Parsing and understanding natural language queries
- **Entity Recognition**: Identifying entities in search queries
- **Intent Recognition**: Identifying user intent in queries
- **Query Expansion**: Expanding queries with synonyms and related terms
- **Semantic Search**: Understanding the meaning behind queries

### Personalization

- **Preference-Based**: Personalizing based on user preferences
- **Behavior-Based**: Personalizing based on user behavior
- **Value Alignment**: Prioritizing results aligned with user values
- **Contextual**: Adapting to user context (time, device, location)
- **Hybrid Approaches**: Combining multiple personalization strategies

### Search Analytics

- **Performance Metrics**: Response time, result count, etc.
- **Relevance Metrics**: Click-through rate, conversion rate, etc.
- **User Behavior**: Search paths, refinements, abandonment
- **Zero-Result Searches**: Tracking searches with no results
- **Popular Searches**: Tracking most popular search terms

### A/B Testing

- **Experiment Framework**: Framework for running search experiments
- **Variant Testing**: Testing different search algorithms and parameters
- **Result Analysis**: Analyzing experiment results
- **Automatic Optimization**: Automatically optimizing based on results
- **Targeted Experiments**: Running experiments for specific user segments

## Technical Implementation

### Elasticsearch Configuration

The system uses a sophisticated Elasticsearch configuration:

- **Custom Analyzers**: Specialized analyzers for different fields
- **Synonym Expansion**: Expanding queries with synonyms
- **N-Gram Indexing**: Improved partial matching
- **Custom Scoring**: Advanced relevance scoring algorithms
- **Query Templates**: Reusable query templates for different search types

### Search Query Processing

The search query processing pipeline includes:

1. **Query Parsing**: Parsing the raw query string
2. **Query Preprocessing**: Cleaning and normalizing the query
3. **Query Understanding**: Applying NLP to understand the query
4. **Query Expansion**: Expanding the query with synonyms and related terms
5. **Query Execution**: Executing the query against Elasticsearch
6. **Result Processing**: Processing and formatting the results
7. **Result Enrichment**: Enriching results with additional data
8. **Response Formatting**: Formatting the response for the client

### Relevance Tuning

The system uses several techniques for relevance tuning:

- **Field Boosting**: Boosting specific fields in the search
- **Function Scoring**: Using functions to adjust relevance scores
- **Decay Functions**: Applying decay functions for factors like recency
- **Query-Time Boosting**: Adjusting boosting at query time
- **Personalized Boosting**: Boosting based on user preferences and behavior

## GraphQL Schema

The search system is exposed through a comprehensive GraphQL schema:

```graphql
# Search response types
type SearchResponseType {
  query: String
  pagination: PaginationType!
  results: [SearchResult!]!
  highlightsEnabled: Boolean!
  facets: [FacetType!]
  relevanceScores: EntityRelevanceScoresType
  entityDistribution: EntityDistributionType
  isNlpEnabled: Boolean
  isPersonalized: Boolean
  experimentId: String
  appliedFilters: [String!]
}

# Entity-specific result types
type ProductResultType {
  id: ID!
  name: String!
  description: String!
  price: Float!
  salePrice: Float
  images: [String!]!
  categories: [String!]!
  values: [String!]!
  merchant: MerchantResultType!
  brand: BrandResultType
  rating: Float
  reviewCount: Int
  isSponsored: Boolean!
  score: Float!
  highlights: HighlightResultType
}

# Search input types
input SearchOptionsInput {
  entityType: SearchEntityType = PRODUCT
  page: Int = 1
  limit: Int = 20
  sort: SortInput
  filters: [FilterInput!]
  rangeFilters: [RangeFilterInput!]
  personalized: Boolean = true
  enablePersonalization: Boolean = false
  personalizationStrength: Float = 1.0
  enableNlp: Boolean = false
  nlpStrength: Float = 1.0
  boostByValues: Boolean = true
  includeSponsoredContent: Boolean = true
  experimentId: String
  enableABTesting: Boolean = false
  enableAnalytics: Boolean = false
  sessionId: String
  enableHighlighting: Boolean = false
  highlightFields: [String!]
}

# Search queries
type Query {
  search(query: String!, options: SearchOptionsInput): SearchResponseType!
  searchProducts(query: String!, options: SearchOptionsInput): SearchResponseType!
  searchMerchants(query: String!, options: SearchOptionsInput): SearchResponseType!
  searchBrands(query: String!, options: SearchOptionsInput): SearchResponseType!
  searchAll(query: String!, options: SearchOptionsInput): SearchResponseType!
  multiEntitySearch(input: EnhancedSearchInput!): SearchResponseType!
  cursorSearch(
    query: String
    cursor: String
    limit: Int = 20
    sessionId: String
  ): CursorSearchResponseType!
  autocompleteSuggestions(
    query: String!
    options: AutocompleteOptionsInput
  ): AutocompleteSuggestionsType!
  discoverySearch(query: String = "", options: SearchOptionsInput): SearchResponseType!
  discoverySuggestions(limit: Int): DiscoverySuggestionsType!
  discoveryHomepage: DiscoveryHomepageType!
  relatedProducts(productId: ID!, limit: Int): SearchResponseType!
  complementaryProducts(productId: ID!, limit: Int): SearchResponseType!
  frequentlyBoughtTogether(productId: ID!, limit: Int): SearchResponseType!
  productSuggestions(query: String!, limit: Int): [String!]!
}

# Search dashboard queries
type Query {
  searchPerformanceMetrics(timeframe: String): PerformanceMetricsType!
  searchRelevanceMetrics(timeframe: String): RelevanceMetricsType!
  popularSearches(limit: Int = 10, timeframe: String): [PopularSearchType!]!
  zeroResultSearches(limit: Int = 10): [ZeroResultSearchType!]!
  searchEntityDistribution(timeframe: String): EntityDistributionType!
  searchConversionRate(timeframe: String = "day"): ConversionRateType!
  searchDashboardExperiments: [ExperimentType!]!
  searchExperimentById(id: ID!): ExperimentType
  searchExperimentResults(id: ID!): ExperimentResultType!
  searchHealthStatus: HealthStatusType!
}

# Search indexing mutations
type Mutation {
  reindexAll(entityType: String = "all"): Boolean!
  bulkIndexProducts(productIds: [String!]!): Boolean!
  bulkIndexMerchants(merchantIds: [String!]!): Boolean!
  bulkIndexBrands(brandIds: [String!]!): Boolean!
  trackSuggestionSelection(query: String!, suggestion: String!, position: Int!): Boolean!
}
```

## Integration Points

The search infrastructure integrates with several other systems:

- **Product Catalog**: Indexes product data for search
- **Merchant System**: Indexes merchant data for search
- **Brand System**: Indexes brand data for search
- **User System**: Integrates user data for personalization
- **Analytics System**: Provides data for search analytics
- **Recommendation System**: Powers recommendation features

## Performance Optimization

The system includes several performance optimizations:

- **Query Caching**: Caching common queries in Redis
- **Result Caching**: Caching search results for performance
- **Index Optimization**: Optimizing indices for search performance
- **Query Optimization**: Optimizing queries for performance
- **Asynchronous Processing**: Processing heavy tasks asynchronously
- **Distributed Execution**: Distributing search across multiple nodes

## Monitoring and Observability

The system includes comprehensive monitoring:

- **Performance Metrics**: Response time, throughput, etc.
- **Error Tracking**: Tracking and alerting on errors
- **User Behavior**: Tracking user interactions with search
- **Search Quality**: Monitoring search quality metrics
- **System Health**: Monitoring overall system health

## Future Enhancements

Planned enhancements for the search infrastructure include:

- **Advanced NLP**: More sophisticated natural language understanding
- **Vector Search**: Implementing vector-based semantic search
- **Multi-modal Search**: Supporting image and voice search
- **Federated Search**: Searching across multiple data sources
- **Real-time Personalization**: More responsive personalization
- **Explainable Search**: Better explanations for search results
