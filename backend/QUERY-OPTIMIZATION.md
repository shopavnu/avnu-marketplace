# Query Optimization for Avnu Marketplace

This document outlines the database query optimizations implemented for product listing endpoints in the Avnu Marketplace platform.

## Table of Contents
1. [Database Indexing Strategy](#database-indexing-strategy)
2. [Query Optimization Service](#query-optimization-service)
3. [Result Caching for Common Filters](#result-caching-for-common-filters)
4. [Cache Warmup Strategy](#cache-warmup-strategy)
5. [Performance Monitoring](#performance-monitoring)

## Database Indexing Strategy

We've implemented a comprehensive indexing strategy for the Product entity to optimize the most common query patterns:

### Single Column Indexes
- `price`: Optimizes price range filtering and sorting
- `merchantId`: Speeds up merchant-specific product listings
- `inStock`: Improves filtering for available products
- `featured`: Enhances performance for featured product listings
- `createdAt`: Optimizes date-based sorting and filtering
- `isSuppressed`: Improves filtering for product moderation
- `externalSource`: Enhances lookups by external source
- `slug`: Optimizes URL-friendly lookups

### Composite Indexes
- `merchantId, inStock, isActive`: Optimizes the common pattern of filtering active, in-stock products for a specific merchant
- `price, inStock, isActive`: Improves price range queries on active, available products
- `createdAt, id`: Ensures stable sorting for cursor-based pagination

### Full-Text Indexes
- `categories`: Enables efficient text search within product categories

## Query Optimization Service

The `ProductQueryOptimizerService` implements several optimization techniques:

1. **Optimized Query Building**
   - Uses TypeORM's QueryBuilder for efficient query construction
   - Applies appropriate WHERE clauses based on filter combinations
   - Ensures consistent ordering for stable pagination

2. **Smart Join Strategy**
   - Avoids unnecessary joins for simple queries
   - Uses LEFT JOINs only when needed for related data

3. **Query Parameter Optimization**
   - Uses parameterized queries to prevent SQL injection
   - Enables query plan caching at the database level

## Result Caching for Common Filters

The query optimization service implements a multi-level caching strategy:

1. **Cache Key Generation**
   - Creates consistent cache keys based on filter parameters
   - Normalizes filter objects to ensure cache hits for equivalent queries

2. **Cache TTL Strategy**
   - Frequently accessed combinations: 5 minutes
   - Less common combinations: 2 minutes
   - Highly volatile data: 30 seconds

3. **Resilient Caching**
   - Uses Redis as primary cache
   - Falls back to in-memory cache if Redis is unavailable
   - Implements circuit breaker pattern for cache operations

## Cache Warmup Strategy

To ensure optimal performance for common queries, we've implemented automatic cache warming:

1. **Scheduled Warmup**
   - Hourly cache warming for common filter combinations
   - Pre-caches first few pages of popular product listings

2. **Post-Update Warming**
   - Automatically refreshes cache for affected query patterns after product updates
   - Prioritizes high-traffic query combinations

3. **Common Filter Combinations**
   - Active, in-stock products
   - Featured products
   - Recent products
   - Price range filters

## Performance Monitoring

The optimization system includes comprehensive monitoring:

1. **Query Performance Metrics**
   - Tracks execution time for each query pattern
   - Monitors cache hit/miss ratios
   - Records query frequency by filter combination

2. **GraphQL Monitoring Endpoints**
   - Exposes cache performance metrics via GraphQL
   - Provides admin tools for cache inspection and management

3. **Alerting**
   - Triggers alerts for slow-running queries
   - Monitors cache efficiency and database load

## Implementation Details

The query optimization system is implemented through several components:

1. **ProductQueryOptimizerService**: Core service that builds optimized queries and manages caching
2. **QueryCacheWarmupTask**: Scheduled task that pre-warms cache for common queries
3. **Database Migrations**: Adds necessary indexes to the database schema
4. **CachedProductsService**: Service layer that uses the optimizer for all product queries

## Configuration

The query optimization system can be configured through environment variables:

```
# Cache TTL settings (in seconds)
QUERY_CACHE_TTL_DEFAULT=300
QUERY_CACHE_TTL_HIGH_TRAFFIC=600
QUERY_CACHE_TTL_LOW_TRAFFIC=120

# Cache warmup settings
QUERY_CACHE_WARMUP_ENABLED=true
QUERY_CACHE_WARMUP_INTERVAL=3600

# Performance thresholds
SLOW_QUERY_THRESHOLD_MS=500
```

## Future Improvements

Planned enhancements to the query optimization system:

1. Implement query analytics to automatically identify and optimize slow queries
2. Add adaptive cache TTL based on query frequency and data volatility
3. Explore database-specific optimizations (e.g., PostgreSQL-specific index types)
4. Implement query result pagination caching for improved performance
