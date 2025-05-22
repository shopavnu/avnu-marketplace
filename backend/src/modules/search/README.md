# Avnu Marketplace Search Infrastructure

## Overview

The Avnu marketplace search infrastructure provides a comprehensive, discovery-focused search experience that goes beyond traditional keyword matching. It supports multi-entity search across products, merchants, and brands with advanced filtering, personalization, and natural language processing capabilities. The system emphasizes discovery, personalization, and value alignment for independent brands.

## Key Components

### Entity-Specific Search

The search system supports specialized search for different entity types:

- **Products**: Search for products with filters for categories, tags, price ranges, ratings, availability, and more
- **Merchants**: Search for merchants with filters for categories, values, locations, and verification status
- **Brands**: Search for brands with filters for categories, values, locations, founding year, and more

### Multi-Entity Search

The system provides unified search across all entity types with:

- Entity boosting to control the prominence of different entity types in results
- Entity relevance scoring to determine which entity types are most relevant to a query
- Normalized scoring to ensure fair comparison across entity types
- Entity distribution metrics to understand the composition of search results
- Type-safe implementation with comprehensive TypeScript interfaces

### Advanced Search Features

- **Natural Language Processing**: Intelligent query processing with entity recognition and query expansion
- **Personalization**: User-specific result boosting based on preferences and history
- **Value Alignment**: Boosting products and merchants that align with user values
- **Faceted Search**: Dynamic facet generation for different entity types
- **A/B Testing**: Support for experimentation with different search algorithms
- **Caching**: Intelligent caching of search results for performance optimization
- **Monitoring**: Comprehensive search performance and relevance monitoring
- **Analytics**: Detailed search analytics with user behavior tracking
- **Discovery-Focused**: Mixed result types for enhanced discovery experience
- **Autocomplete**: Rich suggestions combining multiple data sources
- **Type Safety**: Comprehensive TypeScript interfaces for robust development
- **Error Handling**: Robust error handling for search queries and indexing operations

## API Endpoints

### REST API

#### Search Dashboard

```
GET /api/search/dashboard/performance
GET /api/search/dashboard/relevance
GET /api/search/dashboard/popular-searches
GET /api/search/dashboard/zero-results
GET /api/search/dashboard/entity-distribution
GET /api/search/dashboard/conversion-rate
GET /api/search/dashboard/experiments
GET /api/search/dashboard/experiments/:id
GET /api/search/dashboard/experiments/:id/results
GET /api/search/dashboard/health
GET /api/search/dashboard/analytics/search-paths
GET /api/search/dashboard/analytics/search-refinements
GET /api/search/dashboard/analytics/value-alignment
```

Provides comprehensive search analytics, monitoring, and experimentation data for administrators and merchants.

#### Enhanced Search

```
POST /api/multi-search
```

Performs an enhanced search across products, merchants, and brands with entity-specific filters.

#### Product Search

```
GET /api/multi-search/products
```

Performs an enhanced product search with specialized filters.

#### Merchant Search

```
GET /api/multi-search/merchants
```

Performs an enhanced merchant search with specialized filters.

#### Brand Search

```
GET /api/multi-search/brands
```

Performs an enhanced brand search with specialized filters.

#### Multi-Entity Search

```
GET /api/multi-search/all
```

Performs an enhanced search across all entity types with entity boosting.

### GraphQL API

#### Schema Structure

The GraphQL schema follows a schema-first approach and includes:

- **Search Response Types**: `SearchResponseType`, `SearchResponse`, `CursorSearchResponseType`
- **Entity Result Types**: `ProductResultType`, `MerchantResultType`, `BrandResultType`
- **Search Input Types**: `SearchOptionsInput`, `EnhancedSearchInput`, `EntitySpecificFilters`
- **Facet Types**: `FacetType`, `FacetValueType`, `PriceFacetType`
- **Dashboard Types**: `PerformanceMetricsType`, `RelevanceMetricsType`, `PopularSearchType`
- **Personalization Types**: `UserPreferences`, `UserBehavior`, `BehaviorType`

#### Search Queries

```graphql
# Multi-entity search with advanced options
query {
  multiEntitySearch(
    input: {
      query: "sustainable fashion"
      enableNlp: true
      personalized: true
      page: 0
      limit: 20
      productFilters: { categories: ["clothing"], minPrice: 50, maxPrice: 200, inStock: true }
      entityBoosting: { productBoost: 1.2, merchantBoost: 0.8, brandBoost: 1.0 }
      sortOptions: [{ field: "relevance", order: DESC }]
      enableHighlighting: true
    }
  ) {
    query
    pagination {
      page
      limit
      total
      pages
      hasNext
      hasPrevious
    }
    results {
      ... on ProductResultType {
        id
        name
        description
        price
        images
        categories
        values
        score
      }
      ... on MerchantResultType {
        id
        name
        description
        logo
        categories
        values
        score
      }
      ... on BrandResultType {
        id
        name
        description
        logo
        categories
        values
        score
      }
    }
    facets {
      name
      values {
        value
        count
      }
    }
    isNlpEnabled
    isPersonalized
    # Entity-specific result arrays
    products {
      id
      name
      description
      price
    }
    merchants {
      id
      name
      description
    }
    brands {
      id
      name
      description
    }
  }
}
```

#### Search Dashboard

```graphql
query {
  searchPerformanceMetrics(timeframe: "week") {
    averageResponseTime
    totalSearches
    slowSearches
    responseTimeDistribution {
      timestamp
      value
    }
    searchVolumeByHour {
      timestamp
      value
    }
    p95ResponseTime
    p99ResponseTime
  }

  searchRelevanceMetrics(timeframe: "week") {
    averageRelevanceScore
    clickThroughRate
    zeroResultRate
    entityRelevanceScores {
      entityType
      averageScore
    }
    relevanceScoreByDay {
      timestamp
      value
    }
    averageResultCount
  }

  popularSearches(limit: 10) {
    query
    count
    conversionRate
    clickThroughRate
  }

  searchExperiments {
    id
    name
    description
    status
    startDate
    endDate
    variants {
      id
      name
      trafficPercentage
    }
  }

  searchHealthStatus {
    isHealthy
    alerts {
      type
      message
      severity
      timestamp
    }
    uptime
    cacheHitRate
  }
}
```

#### Cursor-Based Search

```graphql
query {
  cursorSearch(
    query: "sustainable fashion"
    cursor: "eyJwYWdlIjoxfQ=="
    limit: 20
    sessionId: "user-session-123"
  ) {
    query
    cursor
    nextCursor
    hasMore
    totalCount
    results {
      ... on ProductResultType {
        id
        name
        price
      }
      ... on MerchantResultType {
        id
        name
      }
      ... on BrandResultType {
        id
        name
      }
    }
  }
}
```

#### Personalization

```graphql
query {
  getUserPreferences {
    favoriteCategories
    favoriteBrands
    favoriteValues
    preferredSizes
    preferredColors
    preferSustainable
    preferEthical
    preferLocalBrands
  }

  getPersonalizedRecommendations(limit: 10) {
    query
    pagination {
      total
      limit
    }
    products {
      id
      name
      description
      price
      images
      score
    }
  }
}
      totalPages
    }
    results {
      ... on ProductResultType {
        id
        title
        price
        description
        brandName
        merchantName
        relevanceScore
      }
      ... on MerchantResultType {
        id
        name
        description
        location
        relevanceScore
      }
      ... on BrandResultType {
        id
        name
        description
        foundedYear
        relevanceScore
      }
    }
    facets {
      name
      displayName
      values {
        value
        count
        selected
      }
    }
    relevanceScores {
      products
      merchants
      brands
    }
    entityDistribution {
      products
      merchants
      brands
    }
  }
}
```

## Configuration

The search system can be configured through environment variables:

```
# Search Configuration
SEARCH_ENABLE_SYNONYMS=true
SEARCH_ENABLE_SEMANTIC=true
SEARCH_ENABLE_QUERY_EXPANSION=true
SEARCH_ENABLE_ENTITY_RECOGNITION=true

# Entity Boosting Defaults
SEARCH_DEFAULT_PRODUCT_BOOST=1.0
SEARCH_DEFAULT_MERCHANT_BOOST=0.8
SEARCH_DEFAULT_BRAND_BOOST=0.8
SEARCH_USER_HISTORY_BOOST_FACTOR=1.2
SEARCH_USER_PREFERENCES_BOOST_FACTOR=1.5

# Caching Configuration
SEARCH_CACHE_ENABLED=true
SEARCH_CACHE_TTL=300
SEARCH_CACHE_MAX_ITEMS=1000
REDIS_HOST=localhost
REDIS_PORT=6379

# Experiments Configuration
SEARCH_EXPERIMENTS_ENABLED=true

# Monitoring Configuration
SEARCH_MONITORING_ENABLED=true
SEARCH_MONITORING_SAMPLE_RATE=0.1
SEARCH_PERFORMANCE_WARNING_THRESHOLD=500
SEARCH_PERFORMANCE_CRITICAL_THRESHOLD=1000

# Elasticsearch Settings
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_RETRY_DELAY_MS=1000
ELASTICSEARCH_BULK_BATCH_SIZE=100
ELASTICSEARCH_INDEXING_CONCURRENCY=5
```

## Usage Examples

### REST API Example

```javascript
// Enhanced product search with filters
const response = await fetch(
  '/api/multi-search/products?query=sustainable+dress&categories=clothing,dresses&minPrice=50&maxPrice=200&enableNlp=true',
);
const results = await response.json();
```

### GraphQL Example

```javascript
// Multi-entity search with entity boosting
const query = `
  query EnhancedSearch($options: EnhancedSearchInput!) {
    enhancedMultiEntitySearch(
      query: $options.query,
      page: $options.page,
      limit: $options.limit,
      enableNlp: $options.enableNlp,
      personalized: $options.personalized,
      entityBoosting: $options.entityBoosting
    ) {
      query
      pagination {
        page
        limit
        total
        totalPages
      }
      results {
        ... on ProductResultType {
          id
          title
          price
        }
        ... on MerchantResultType {
          id
          name
        }
        ... on BrandResultType {
          id
          name
        }
      }
      relevanceScores {
        products
        merchants
        brands
      }
    }
  }
`;

const variables = {
  options: {
    query: 'eco-friendly',
    page: 0,
    limit: 20,
    enableNlp: true,
    personalized: true,
    entityBoosting: {
      productBoost: 1.2,
      merchantBoost: 0.8,
      brandBoost: 1.0,
    },
  },
};

const results = await graphqlClient.request(query, variables);
```

## Architecture

The search infrastructure follows a modular architecture with the following key services:

- **NlpSearchService**: Core service for natural language processing and search
- **EntityFacetGeneratorService**: Generates facets for different entity types
- **EntityRelevanceScorerService**: Scores and boosts entity relevance
- **ElasticsearchService**: Handles interaction with Elasticsearch
- **PersonalizedSearchService**: Provides personalized search functionality
- **SearchCacheService**: Caches search results for performance optimization
- **SearchExperimentService**: Manages A/B testing for search algorithms
- **SearchMonitoringService**: Monitors search performance and relevance
- **DiscoverySearchService**: Provides discovery-focused search experience
- **AutocompleteService**: Delivers rich search suggestions
- **RelatedProductsService**: Recommends related products based on search context

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  GraphQL/   │────▶│   Search     │
│   Request   │     │  REST API   │     │  Resolver    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│   Response  │◀────│  Result     │◀────│   Search     │
│   Formatter │     │  Processor  │     │   Service    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                         ┌──────▼──────┐
                                         │ Elasticsearch│
                                         │    Index     │
                                         └─────────────┘
```

## Development Guide

### Setting Up the Development Environment

1. **Prerequisites**:

   - Node.js (v14+)
   - npm or yarn
   - Elasticsearch (v7.10+)
   - Redis (for caching)

2. **Installation**:

   ```bash
   # Install dependencies
   npm install

   # Configure environment variables
   cp .env.example .env
   ```

3. **Running the Indexing Script**:

   ```bash
   # Index all entities into Elasticsearch
   npm run index-all-entities
   ```

4. **Testing the Search API**:
   ```bash
   # Test GraphQL search functionality
   npm run test-graphql-search
   ```

### TypeScript Best Practices

- Use proper TypeScript interfaces for all GraphQL inputs and responses
- Leverage generics for reusable components
- Ensure null checks and proper error handling
- Use the `esModuleInterop` flag in tsconfig.json for proper module imports

### Common Issues and Solutions

#### Import Issues

When importing modules like axios, OAuth, or supertest, use default imports:

```typescript
// Correct
import request from 'supertest';
import OAuth from 'oauth-1.0a';

// Incorrect
import * as request from 'supertest';
import * as OAuth from 'oauth-1.0a';
```

#### GraphQL Response Typing

Ensure GraphQL responses are properly typed with nested structures:

```typescript
interface ProductSearchResponse {
  query: string;
  products: ProductSearchResult[];
  pagination: PaginationInfo;
  facets?: SearchFacets;
}

interface ProductSearchResponseWrapper {
  searchProducts: ProductSearchResponse;
}
```

## Future Enhancements

- Advanced machine learning models for search relevance
- Multi-language support
- Voice search capabilities
- Image-based search
- Enhanced recommendation algorithms
- Real-time personalization based on session behavior
- Semantic vector search for concept matching
- Advanced query understanding with conversational context
- Automated relevance tuning based on user feedback
- Enhanced search analytics dashboards with predictive insights
