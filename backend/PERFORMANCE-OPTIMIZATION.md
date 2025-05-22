# Performance Optimization for Avnu Marketplace

This document outlines the performance optimization strategies implemented in the Avnu Marketplace backend, with a focus on Redis caching for product data, database query optimization, circuit breaker pattern for resilience, and performance monitoring.

## Table of Contents

1. [Redis Caching Layer](#redis-caching-layer)
2. [Database Query Optimization](#database-query-optimization)
3. [Resilient Caching with Circuit Breaker](#resilient-caching-with-circuit-breaker)
4. [Cache Performance Monitoring](#cache-performance-monitoring)
5. [GraphQL Integration](#graphql-integration)
6. [Configuration](#configuration)
7. [Admin Tools](#admin-tools)
8. [Best Practices](#best-practices)

## Redis Caching Layer

### Overview

We've implemented a Redis-based caching layer to improve performance and reduce database load for frequently accessed product data. The caching system includes:

- Configurable TTL (Time-To-Live) settings for different types of data
- Automatic cache invalidation when data changes
- Scheduled cache warming for popular products and sections
- Performance monitoring to track cache effectiveness

### Key Components

1. **ProductCacheService**
   - Core service that handles all cache operations
   - Manages cache keys and TTL values
   - Handles cache invalidation based on events
   - Implements cache warming logic
   - Uses ResilientCacheService for fault tolerance
2. **ProductQueryOptimizerService**

   - Optimizes database queries for product listings
   - Builds efficient query plans with proper indexes
   - Implements caching for common query patterns
   - Provides automatic cache warming for frequent queries

3. **CachedProductsService**

   - Enhanced product service that leverages caching
   - Drop-in replacement for the original ProductsService
   - Maintains the same API while adding caching capabilities
   - Handles cache misses by fetching from the database

4. **CacheWarmingService**

   - Scheduled service for cache warming
   - Runs on configurable intervals (hourly/daily)
   - Prioritizes popular and frequently accessed data
   - Can be triggered manually via API

5. **CachePerformanceMonitorService**

   - Tracks cache hit/miss rates
   - Measures response times with and without cache
   - Calculates performance improvements
   - Provides metrics for monitoring and optimization

6. **CircuitBreakerService**

   - Monitors Redis connection health
   - Automatically switches to fallback strategy when Redis is unavailable
   - Implements retry logic with configurable parameters
   - Provides self-healing capabilities

7. **ResilientCacheService**
   - Wraps Redis cache with circuit breaker protection
   - Provides in-memory fallback cache when Redis is unavailable
   - Ensures application continues to function during Redis outages
   - Transparently handles cache operations with appropriate fallbacks

### Cached Data Types

- Individual products by ID
- Product lists (paginated)
- Products by cursor (for infinite scroll)
- Products by merchant
- Products by category
- Search results
- Recommended products
- Discovery products
- Query results for common filter combinations

## Database Query Optimization

### Database Indexing Strategy

We've implemented a comprehensive indexing strategy for the Product entity to optimize the most common query patterns:

#### Single Column Indexes

- `price`: Optimizes price range filtering and sorting
- `merchantId`: Speeds up merchant-specific product listings
- `inStock`: Improves filtering for available products
- `featured`: Enhances performance for featured product listings
- `createdAt`: Optimizes date-based sorting and filtering
- `isSuppressed`: Improves filtering for product moderation
- `externalSource`: Enhances lookups by external source
- `slug`: Optimizes URL-friendly lookups

#### Composite Indexes

- `merchantId, inStock, isActive`: Optimizes the common pattern of filtering active, in-stock products for a specific merchant
- `price, inStock, isActive`: Improves price range queries on active, available products
- `createdAt, id`: Ensures stable sorting for cursor-based pagination

#### Full-Text Indexes

- `categories`: Enables efficient text search within product categories

### Query Optimization Techniques

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

### Query Result Caching

1. **Cache Key Generation**

   - Creates consistent cache keys based on filter parameters
   - Normalizes filter objects to ensure cache hits for equivalent queries

2. **Cache TTL Strategy**

   - Frequently accessed combinations: 5 minutes
   - Less common combinations: 2 minutes
   - Highly volatile data: 30 seconds

3. **Automatic Cache Warming**
   - Scheduled warming for common filter combinations
   - Pre-caches first few pages of popular product listings
   - Prioritizes high-traffic query patterns

## Resilient Caching with Circuit Breaker

### Circuit Breaker Pattern

We've implemented the circuit breaker pattern to improve the resilience of our caching layer. This pattern:

- Prevents cascading failures when Redis is unavailable
- Automatically detects when Redis becomes available again
- Provides graceful degradation to in-memory caching during outages
- Self-heals when the underlying service recovers

### Circuit States

1. **CLOSED**: Normal operation, requests pass through to Redis
2. **OPEN**: Circuit is open, requests fail fast and use fallback cache
3. **HALF-OPEN**: Testing if Redis is back online

### Fallback Strategy

When Redis is unavailable, the system automatically falls back to an in-memory cache (using node-cache). This ensures:

- Application continues to function during Redis outages
- Cache hit rates remain high even during Redis failures
- Gradual recovery when Redis becomes available again
- No impact to end users during infrastructure issues

### Health Monitoring

The system includes a Redis health monitoring service that:

- Performs regular health checks on Redis
- Triggers circuit state changes based on health check results
- Emits events for monitoring and alerting
- Provides detailed metrics on Redis availability

## Cache Performance Monitoring

### Metrics Tracked

- **Cache Hit Rate**: Percentage of requests served from cache
- **Response Time Improvement**: Comparison of response times with and without cache
- **Cache Invalidations**: Number of cache invalidation operations
- **Cache Warming Time**: Time taken to warm the cache
- **Average Response Times**: With and without cache

### Monitoring Schedule

- **Hourly**: Basic metrics logging (hit rate, response time improvement)
- **Daily**: Detailed performance report with all metrics
- **Real-time**: GraphQL API for admin dashboard integration

### Event-based Tracking

The system uses NestJS event emitter to track:

- Cache hits and misses
- Response times
- Cache invalidations
- Cache warming operations

## GraphQL Integration

### Cached Product Resolvers

We've created GraphQL resolvers that leverage the caching layer:

- `cachedProduct`: Get a single product with caching
- `cachedProducts`: Get paginated products with caching
- `cachedProductsByCursor`: Get products with cursor-based pagination
- `cachedProductsByMerchant`: Get products by merchant
- `cachedRecommendedProducts`: Get recommended products
- `cachedDiscoveryProducts`: Get discovery products
- `cachedSearchProducts`: Search products with caching

### Cache Management Resolvers

Admin-only resolvers for cache management:

- `cachePerformanceMetrics`: Get cache performance metrics
- `resetCachePerformanceMetrics`: Reset performance metrics
- `warmProductCache`: Manually trigger cache warming
- `invalidateAllProductCache`: Invalidate all product cache
- `invalidateProductCache`: Invalidate cache for a specific product
- `invalidateMerchantProductCache`: Invalidate cache for a merchant's products

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache TTL Settings (seconds)
REDIS_TTL=3600                     # Default TTL (1 hour)
REDIS_MAX_ITEMS=1000               # Maximum number of items in cache
PRODUCT_CACHE_TTL=3600             # Product cache TTL
POPULAR_PRODUCTS_CACHE_TTL=1800    # Popular products TTL (30 minutes)
CATEGORY_PRODUCTS_CACHE_TTL=3600   # Category products TTL
MERCHANT_PRODUCTS_CACHE_TTL=3600   # Merchant products TTL

# Cache Warming Settings
CACHE_WARMING_ENABLED=true         # Enable/disable scheduled warming
CACHE_MONITORING_ENABLED=true      # Enable/disable performance monitoring

# Circuit Breaker Settings
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5 # Number of failures before opening circuit
CIRCUIT_BREAKER_RESET_TIMEOUT=30000 # Time in ms before trying to close circuit again
CIRCUIT_BREAKER_MAX_RETRIES=3      # Maximum number of retries for a single operation
CIRCUIT_BREAKER_RETRY_DELAY=1000   # Delay between retries in ms
CIRCUIT_BREAKER_MONITOR_INTERVAL=10000 # Interval to check service health in ms

# Fallback Cache Settings
FALLBACK_CACHE_TTL=300             # Fallback cache TTL (5 minutes)
FALLBACK_CACHE_MAX_KEYS=1000       # Maximum number of items in fallback cache
```

### NestJS Module Configuration

The Redis cache is configured in `app.module.ts`:

```typescript
CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    store: require('cache-manager-redis-store').create({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      auth_pass: configService.get('REDIS_PASSWORD', ''),
      db: configService.get('REDIS_DB', 0),
      ttl: configService.get('REDIS_TTL', 60 * 60), // 1 hour default
    }),
    max: configService.get('REDIS_MAX_ITEMS', 1000),
  }),
}),
```

## Admin Tools

### REST API Endpoints

- `POST /admin/products/cache/warm`: Manually trigger cache warming
- `POST /admin/products/cache/invalidate/all`: Invalidate all product cache
- `POST /admin/products/cache/invalidate/merchant/:merchantId`: Invalidate merchant's product cache

### GraphQL API

```graphql
# Query cache performance metrics
query {
  cachePerformanceMetrics {
    cacheHits
    cacheMisses
    cacheHitRate
    averageResponseTimeWithCache
    averageResponseTimeWithoutCache
    responseTimeImprovement
    cacheWarmingTime
    lastResetTime
    cacheStats {
      fallback {
        keys
        hits
        misses
        ksize
        vsize
      }
      circuitBreaker {
        state
        failures
        lastFailureTime
        options {
          failureThreshold
          resetTimeout
          maxRetries
          retryDelay
          monitorInterval
        }
      }
    }
  }
}

# Warm the cache
mutation {
  warmProductCache
}

# Invalidate cache
mutation {
  invalidateAllProductCache
}

# Invalidate specific product cache
mutation {
  invalidateProductCache(productId: "product-id-here")
}
```

## Best Practices

### When to Use Caching

- **High-read, low-write data**: Product details, categories, merchants
- **Computationally expensive operations**: Search, recommendations
- **Frequently accessed data**: Popular products, featured sections

### When to Avoid Caching

- **Highly volatile data**: Inventory levels that change frequently
- **User-specific data**: Shopping carts, personalized content
- **Security-sensitive data**: User credentials, payment information

### Cache Invalidation Strategies

1. **Time-based**: Set appropriate TTL values based on data volatility
2. **Event-based**: Invalidate cache when data changes (create/update/delete)
3. **Manual**: Admin tools for force invalidation when needed

### Performance Tuning

- Monitor cache hit rates and adjust TTL values accordingly
- Adjust cache warming frequency based on traffic patterns
- Consider Redis cluster for high-traffic environments
- Implement circuit breaker pattern for Redis connection failures

## Implementation Details

The caching layer is implemented using:

- NestJS Cache Manager with Redis store
- NestJS Event Emitter for event-based cache invalidation
- NestJS Schedule for cache warming and metrics reporting
- TypeORM for database operations
- Circuit Breaker pattern for resilience
- Node-cache for in-memory fallback caching

## Future Improvements

- Implement Redis Cluster support for high availability
- Add more sophisticated cache warming based on analytics data
- Add Redis Sentinel support for failover
- Implement distributed locking for cache warming operations
- Add support for Redis compression to reduce memory usage
- Implement adaptive circuit breaker thresholds based on traffic patterns
- Add distributed tracing for cache operations
- Implement cache preloading on application startup
- Implement query analytics to automatically identify and optimize slow queries
- Add adaptive cache TTL based on query frequency and data volatility
- Explore database-specific optimizations (e.g., PostgreSQL-specific index types)
- Implement query result pagination caching for improved performance
