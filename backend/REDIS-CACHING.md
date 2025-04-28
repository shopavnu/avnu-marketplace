# Redis Caching Layer for Avnu Marketplace

This document outlines the Redis caching implementation for the Avnu Marketplace backend, focusing on product data caching to improve performance and reduce database load.

## Overview

The caching layer uses Redis to store frequently accessed product data, with automatic cache invalidation when data changes and scheduled cache warming for popular products and sections.

## Features

### 1. Redis Configuration
- Configured in `app.module.ts` using `cache-manager-redis-store`
- Environment variables for Redis connection settings:
  - `REDIS_HOST`: Redis server hostname (default: 'localhost')
  - `REDIS_PORT`: Redis server port (default: 6379)
  - `REDIS_PASSWORD`: Redis authentication password
  - `REDIS_DB`: Redis database number (default: 0)
  - `REDIS_TTL`: Default TTL for cached items in seconds (default: 3600)
  - `REDIS_MAX_ITEMS`: Maximum number of items in cache (default: 1000)

### 2. Cached Data Types
- Individual products by ID
- Product lists (paginated)
- Products by cursor (for infinite scroll)
- Products by merchant
- Products by category
- Search results
- Recommended products
- Discovery products

### 3. Cache Invalidation
- Automatic invalidation on product creation, update, or deletion
- Event-based invalidation using NestJS event emitter
- Merchant-specific cache invalidation
- Admin API endpoints for manual cache invalidation

### 4. Cache Warming
- Scheduled cache warming for popular products
- Category-based cache warming
- Merchant-based cache warming
- Configurable warming schedules (hourly and daily)
- Manual trigger via admin API

## Architecture

### Services

1. **ProductCacheService**
   - Core caching service that handles all cache operations
   - Provides methods for getting/setting cached data
   - Handles cache invalidation based on events
   - Implements cache warming logic

2. **CachedProductsService**
   - Enhanced product service that uses caching
   - Wraps database operations with cache checks
   - Maintains the same API as the original ProductsService
   - Handles cache misses by fetching from database

3. **CacheWarmingService**
   - Scheduled service for cache warming
   - Runs on configurable intervals (hourly/daily)
   - Prioritizes popular and frequently accessed data
   - Can be triggered manually via API

4. **ProductCacheController**
   - Admin API endpoints for cache management
   - Secured with JWT authentication and admin role guard
   - Provides endpoints for manual cache warming and invalidation

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600
REDIS_MAX_ITEMS=1000

# Cache Warming Configuration
CACHE_WARMING_ENABLED=true
PRODUCT_CACHE_TTL=3600
POPULAR_PRODUCTS_CACHE_TTL=1800
CATEGORY_PRODUCTS_CACHE_TTL=3600
MERCHANT_PRODUCTS_CACHE_TTL=3600
```

## Usage

### Using the Cached Products Service

The `CachedProductsService` is a drop-in replacement for the original `ProductsService`. It maintains the same API but adds caching capabilities.

```typescript
// Example usage in a controller or resolver
constructor(private readonly productsService: CachedProductsService) {}

async getProduct(id: string) {
  // This will check cache first, then database if not in cache
  return this.productsService.findOne(id);
}
```

### Manual Cache Management (Admin)

Admin users can manage the cache via the following API endpoints:

- `POST /admin/products/cache/warm` - Manually trigger cache warming
- `POST /admin/products/cache/invalidate/all` - Invalidate all product cache
- `POST /admin/products/cache/invalidate/merchant/:merchantId` - Invalidate cache for a specific merchant

## Performance Considerations

- Default TTL is 1 hour for most cached items
- Popular products have a shorter TTL (30 minutes) to ensure freshness
- Cache warming runs hourly for basic warming and daily for extensive warming
- Cache invalidation is automatic on data changes to prevent stale data
- The cache uses memory limits to prevent excessive Redis memory usage

## Monitoring

The caching system logs all operations with appropriate log levels:
- `debug` for cache hits/misses
- `log` for cache warming operations
- `error` for cache errors

Monitor these logs to track cache performance and identify any issues.

## Future Improvements

- Add metrics collection for cache hit/miss rates
- Implement more sophisticated cache warming based on analytics data
- Add Redis Cluster support for high availability
- Implement circuit breaker pattern for Redis connection failures
