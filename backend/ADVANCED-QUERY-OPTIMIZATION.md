# Advanced Query Optimization for Avnu Marketplace

This document outlines the advanced query optimization techniques implemented for the Avnu Marketplace platform, focusing on database performance, caching strategies, and analytics.

## Table of Contents

1. [Query Analytics System](#query-analytics-system)
2. [Adaptive Cache TTL](#adaptive-cache-ttl)
3. [PostgreSQL-Specific Optimizations](#postgresql-specific-optimizations)
4. [Pagination Caching](#pagination-caching)
5. [Implementation Details](#implementation-details)
6. [Configuration](#configuration)
7. [Monitoring](#monitoring)

## Query Analytics System

The query analytics system automatically identifies slow queries and provides insights for optimization:

### Key Features

1. **Query Execution Tracking**

   - Records execution time for all database queries
   - Tracks query patterns and filter combinations
   - Monitors result sizes and execution frequency

2. **Slow Query Detection**

   - Automatically identifies queries exceeding performance thresholds
   - Categorizes queries by execution time and frequency
   - Provides detailed analytics for optimization

3. **Performance Metrics**
   - Average/min/max execution times
   - Query frequency (executions per hour)
   - Common filter combinations
   - Result size statistics

### Implementation

The system uses the `QueryAnalyticsService` to track and analyze query performance:

```typescript
// Record a query execution
queryAnalyticsService.recordQuery(
  'ProductListing', // Query pattern
  filters, // Filter parameters
  executionTime, // Execution time in ms
  items.length, // Result count
);
```

### GraphQL API

Query analytics are exposed through a GraphQL API for admin monitoring:

```graphql
query {
  queryAnalytics {
    queryId
    queryPattern
    averageExecutionTime
    minExecutionTime
    maxExecutionTime
    totalExecutions
    frequency
    isSlowQuery
    commonFilters
    resultSizes
  }

  slowQueries {
    # Same fields as above
  }

  mostFrequentQueries(limit: 10) {
    # Same fields as above
  }
}
```

## Adaptive Cache TTL

The system implements adaptive cache TTL (Time-To-Live) based on query frequency and performance:

### Key Features

1. **Dynamic TTL Calculation**

   - Adjusts cache duration based on query frequency
   - Extends TTL for slow-executing queries
   - Shortens TTL for rapidly changing data

2. **Frequency-Based Adaptation**

   - High-frequency queries (>100/hour): Extended TTL (up to 1 hour)
   - Medium-frequency queries (50-100/hour): Moderately extended TTL
   - Low-frequency queries (<5/hour): Shortened TTL

3. **Performance-Based Adaptation**
   - Slow queries (>500ms): Extended TTL to reduce database load
   - Medium queries (200-500ms): Moderately extended TTL
   - Fast queries (<200ms): Standard TTL

### Implementation

The adaptive TTL is implemented in the `determineOptimalCacheTtl` method:

```typescript
async determineOptimalCacheTtl(
  queryPattern: string,
  filters: Record<string, any>,
  executionTime: number,
): Promise<number> {
  // Default TTL values
  const DEFAULT_TTL = 300; // 5 minutes
  const MIN_TTL = 60;      // 1 minute
  const MAX_TTL = 3600;    // 1 hour

  // Get analytics for this query
  const analytics = await this.queryAnalyticsService.getQueryAnalyticsById(queryId);

  let ttl = DEFAULT_TTL;

  // Adjust TTL based on frequency
  if (analytics.frequency > 100) {
    ttl = Math.min(MAX_TTL, ttl * 2);
  } else if (analytics.frequency > 50) {
    ttl = Math.min(MAX_TTL, ttl * 1.5);
  } else if (analytics.frequency < 5) {
    ttl = Math.max(MIN_TTL, ttl * 0.8);
  }

  // Adjust TTL based on execution time
  if (executionTime > 500) {
    ttl = Math.min(MAX_TTL, ttl * 1.5);
  } else if (executionTime > 200) {
    ttl = Math.min(MAX_TTL, ttl * 1.2);
  }

  return Math.round(ttl);
}
```

## PostgreSQL-Specific Optimizations

The system implements database-specific optimizations when PostgreSQL is detected:

### Key Features

1. **Specialized Indexes**

   - GIN indexes for full-text search
   - BRIN indexes for date ranges
   - Partial indexes for common filter combinations
   - Expression indexes for price ranges

2. **Full-Text Search**

   - Uses PostgreSQL's `to_tsvector` and `plainto_tsquery` for efficient text search
   - Implements relevance ranking with `ts_rank`
   - Optimizes search across multiple text fields

3. **Advanced Query Techniques**
   - Uses `BETWEEN` for range queries
   - Implements regular expression pattern matching
   - Leverages PostgreSQL's JSON/JSONB capabilities

### Implementation

PostgreSQL-specific query building is implemented in the `buildPostgresOptimizedQuery` method:

```typescript
private buildPostgresOptimizedQuery(queryBuilder: SelectQueryBuilder<Product>, filters: QueryFilters): SelectQueryBuilder<Product> {
  // Use price range index for price filtering
  if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
    queryBuilder.andWhere('product.price BETWEEN :priceMin AND :priceMax', {
      priceMin: filters.priceMin,
      priceMax: filters.priceMax
    });
  }

  // Use GIN index for category filtering
  if (filters.categories && filters.categories.length > 0) {
    const categoryPattern = filters.categories.join('|');
    queryBuilder.andWhere(
      "product.categories ~ :categoryPattern",
      { categoryPattern }
    );
  }

  // Use full-text search for search queries
  if (filters.searchQuery) {
    queryBuilder.andWhere(
      "to_tsvector('english', product.title || ' ' || product.description) @@ plainto_tsquery('english', :searchQuery)",
      { searchQuery: filters.searchQuery }
    );

    // Add relevance ranking for ordering by search relevance
    if (filters.orderByRelevance) {
      queryBuilder.addSelect(
        "ts_rank(to_tsvector('english', product.title || ' ' || product.description), plainto_tsquery('english', :searchQuery))",
        'relevance'
      );
      queryBuilder.orderBy('relevance', 'DESC');
    }
  }

  return queryBuilder;
}
```

### PostgreSQL-Specific Indexes

The system creates the following PostgreSQL-specific indexes:

```sql
-- Full-text search index
CREATE INDEX "IDX_products_fulltext_search"
ON "products" USING GIN (to_tsvector('english', "title" || ' ' || "description"));

-- BRIN index for date ranges
CREATE INDEX "IDX_products_created_at_brin"
ON "products" USING BRIN ("createdAt");

-- Partial index for featured products
CREATE INDEX "IDX_products_featured_partial"
ON "products" ("merchantId", "isActive")
WHERE "featured" = true;

-- Partial index for in-stock products
CREATE INDEX "IDX_products_in_stock_partial"
ON "products" ("merchantId", "isActive")
WHERE "inStock" = true;

-- Expression index for price ranges
CREATE INDEX "IDX_products_price_range"
ON "products" (
  CASE
    WHEN "price" < 10 THEN 0
    WHEN "price" >= 10 AND "price" < 50 THEN 1
    WHEN "price" >= 50 AND "price" < 100 THEN 2
    WHEN "price" >= 100 AND "price" < 500 THEN 3
    ELSE 4
  END
);

-- JSONB index for attributes
CREATE INDEX "IDX_products_attributes_gin"
ON "products" USING GIN ("attributes" jsonb_path_ops);
```

## Pagination Caching

The system implements specialized caching for paginated results to optimize common listing patterns:

### Key Features

1. **Efficient Pagination Storage**

   - Separates metadata from page content
   - Stores pages individually for granular access
   - Tracks page access patterns for optimization

2. **Adaptive TTL for Pages**

   - Frequently accessed pages get longer TTL
   - Recently accessed pages are prioritized
   - Rarely accessed pages get shorter TTL

3. **Smart Invalidation**
   - Partial cache invalidation for affected pages
   - Event-driven invalidation on data changes
   - Preserves unaffected pages during updates

### Implementation

The pagination caching is implemented in the `PaginationCacheService`:

```typescript
// Cache a page of results
await paginationCacheService.cachePage(page, items, {
  keyPrefix: queryPattern,
  filters,
  totalItems: total,
  pageSize: limit,
  ttl: cacheTtl,
});

// Retrieve a cached page
const paginatedResult = await paginationCacheService.getPage(queryPattern, filters, page);
if (paginatedResult) {
  return {
    items: paginatedResult.items,
    total: paginatedResult.metadata.totalItems,
  };
}
```

### Invalidation Strategy

The service implements smart invalidation based on data changes:

```typescript
// Listen for product update events
this.eventEmitter.on('product.updated', (product) => {
  this.invalidateRelatedPages(product);
});

// Invalidate only affected pages
async invalidateRelatedPages(product: Product): Promise<void> {
  // Invalidate merchant pages
  await this.invalidatePages('merchant', { merchantId: product.merchantId });

  // Invalidate category pages
  for (const category of product.categories) {
    await this.invalidatePages('category', { category });
  }

  // Invalidate featured pages if product is featured
  if (product.featured) {
    await this.invalidatePages('featured', {});
  }
}
```

## Implementation Details

The advanced query optimization system consists of the following components:

1. **ProductQueryOptimizerService**

   - Core service for building optimized database queries
   - Integrates with caching and analytics systems
   - Detects database type and applies appropriate optimizations

2. **QueryAnalyticsService**

   - Tracks query performance metrics
   - Identifies slow queries for optimization
   - Provides insights on query patterns and frequencies

3. **PaginationCacheService**

   - Specialized caching for paginated results
   - Implements adaptive TTL based on access patterns
   - Provides smart invalidation for data changes

4. **Database Migrations**
   - Adds standard indexes for common query patterns
   - Implements database-specific indexes when available
   - Creates composite indexes for frequent filter combinations

## Configuration

The query optimization system can be configured through environment variables:

```
# Query Analytics
SLOW_QUERY_THRESHOLD_MS=500
QUERY_ANALYTICS_RETENTION_DAYS=7

# Cache TTL Settings
DEFAULT_CACHE_TTL=300
MIN_CACHE_TTL=60
MAX_CACHE_TTL=3600

# Pagination Cache
PAGINATION_CACHE_METADATA_TTL=600
PAGINATION_CACHE_DEFAULT_TTL=300

# Database-Specific Settings
ENABLE_POSTGRES_OPTIMIZATIONS=true
```

## Monitoring

The system provides comprehensive monitoring through GraphQL APIs:

### Query Analytics

```graphql
query {
  queryAnalytics {
    queryId
    queryPattern
    averageExecutionTime
    minExecutionTime
    maxExecutionTime
    totalExecutions
    frequency
    isSlowQuery
  }

  slowQueries {
    # Same fields as above
  }
}
```

### Performance Metrics

```graphql
query {
  cachePerformanceMetrics {
    cacheHits
    cacheMisses
    cacheHitRate
    averageResponseTimeWithCache
    averageResponseTimeWithoutCache
    responseTimeImprovement
  }
}
```

## Future Improvements

Planned enhancements to the query optimization system:

1. **Query Plan Analysis**

   - Automatically analyze query execution plans
   - Suggest index improvements based on actual usage
   - Identify missing indexes for common queries

2. **Machine Learning Optimization**

   - Predict query patterns based on historical data
   - Preemptively warm cache for predicted queries
   - Dynamically adjust TTL based on predicted access patterns

3. **Advanced PostgreSQL Features**
   - Implement materialized views for complex aggregations
   - Use PostgreSQL table partitioning for large datasets
   - Leverage PostgreSQL's parallel query execution
