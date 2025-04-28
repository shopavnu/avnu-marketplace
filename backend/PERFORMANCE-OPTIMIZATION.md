# Performance Optimization for Avnu Marketplace

This document outlines the performance optimization strategies implemented in the Avnu Marketplace backend, with a focus on Redis caching for product data and performance monitoring.

## Table of Contents

1. [Redis Caching Layer](#redis-caching-layer)
2. [Cache Performance Monitoring](#cache-performance-monitoring)
3. [GraphQL Integration](#graphql-integration)
4. [Configuration](#configuration)
5. [Admin Tools](#admin-tools)
6. [Best Practices](#best-practices)

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

2. **CachedProductsService**
   - Enhanced product service that leverages caching
   - Drop-in replacement for the original ProductsService
   - Maintains the same API while adding caching capabilities
   - Handles cache misses by fetching from the database

3. **CacheWarmingService**
   - Scheduled service for cache warming
   - Runs on configurable intervals (hourly/daily)
   - Prioritizes popular and frequently accessed data
   - Can be triggered manually via API

4. **CachePerformanceMonitorService**
   - Tracks cache hit/miss rates
   - Measures response times with and without cache
   - Calculates performance improvements
   - Provides metrics for monitoring and optimization

### Cached Data Types

- Individual products by ID
- Product lists (paginated)
- Products by cursor (for infinite scroll)
- Products by merchant
- Products by category
- Search results
- Recommended products
- Discovery products

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

## Future Improvements

- Implement Redis Cluster support for high availability
- Add more sophisticated cache warming based on analytics data
- Implement circuit breaker pattern for Redis connection failures
- Add Redis Sentinel support for failover
- Implement distributed locking for cache warming operations
- Add support for Redis compression to reduce memory usage
