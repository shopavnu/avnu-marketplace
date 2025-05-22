# Avnu Marketplace - Caching Layer & Query Optimization

This document provides an overview of the caching and query optimization implementation for the Avnu Marketplace backend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Caching Services](#caching-services)
3. [Query Optimization](#query-optimization)
4. [Analytics & Monitoring](#analytics--monitoring)
5. [Testing](#testing)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)

## Architecture Overview

The caching and query optimization layer consists of several specialized services that work together to provide high-performance product listing endpoints:

- **ResilientCacheService**: Base caching service with circuit breaker pattern
- **ProductCacheService**: Product-specific caching logic
- **PaginationCacheService**: Specialized caching for paginated results
- **SearchCacheService**: Caching for search results
- **ProductQueryOptimizerService**: Query optimization and database-specific optimizations
- **QueryAnalyticsService**: Analytics for query performance monitoring

The architecture follows these principles:

- Layered caching (memory, Redis)
- Adaptive TTL based on usage patterns
- Partial cache invalidation
- Database-specific query optimizations
- Comprehensive analytics for performance monitoring

## Caching Services

### ResilientCacheService

Base caching service that implements a circuit breaker pattern to handle cache failures gracefully.

- Supports multiple cache providers (Redis, in-memory)
- Handles cache failures with fallback mechanisms
- Provides consistent interface for all caching operations

### ProductCacheService

Specialized caching for product entities.

- Caches individual products and collections
- Handles cache invalidation on product updates
- Optimizes for common product access patterns

### PaginationCacheService

Specialized caching for paginated results.

- Stores page metadata separately from page content
- Uses adaptive TTL based on page access patterns
- Supports partial cache invalidation
- Optimizes for common pagination scenarios (first page, popular filters)

### SearchCacheService

Specialized caching for search results.

- Caches search results with query-specific keys
- Handles cache invalidation for relevant product updates
- Optimizes for common search patterns

## Query Optimization

### ProductQueryOptimizerService

Central service for optimizing product queries.

- Generates optimized query plans based on filters and sort criteria
- Leverages database-specific optimizations (PostgreSQL full-text search)
- Integrates with caching layer for optimal performance
- Warms up cache for common query patterns

Key optimizations:

- PostgreSQL-specific full-text search using `to_tsvector` and `ts_rank`
- Index-aware query generation
- Optimized sorting and filtering
- Adaptive caching based on query patterns

## Analytics & Monitoring

### QueryAnalyticsService

Collects and analyzes query performance metrics.

- Tracks execution time for all queries
- Identifies slow queries
- Analyzes query frequency and patterns
- Provides insights for optimization

Key features:

- Real-time slow query detection
- Query pattern analysis
- Frequency tracking
- Performance trend analysis
- GraphQL endpoints for admin dashboards

## Testing

Comprehensive test coverage for all caching and query optimization services:

- **Unit Tests**: Test individual service functionality
- **Integration Tests**: Test service interactions
- **Performance Tests**: Verify optimization effectiveness

Test files:

- `resilient-cache.service.spec.ts`
- `product-cache.service.spec.ts`
- `pagination-cache.service.spec.ts`
- `search-cache.service.spec.ts`
- `product-query-optimizer.service.spec.ts`
- `query-analytics.service.spec.ts`

## Configuration

The caching and query optimization layer is configurable through environment variables:

- `CACHE_ENABLED`: Enable/disable caching (default: true)
- `CACHE_TTL`: Default cache TTL in seconds (default: 300)
- `SLOW_QUERY_THRESHOLD_MS`: Threshold for slow query detection (default: 500ms)
- `QUERY_CACHE_TTL_DEFAULT`: Default TTL for query results (default: 300s)
- `QUERY_CACHE_TTL_HIGH_TRAFFIC`: TTL for high-traffic queries (default: 600s)
- `QUERY_CACHE_TTL_LOW_TRAFFIC`: TTL for low-traffic queries (default: 60s)
- `CACHE_WARMUP_ENABLED`: Enable/disable cache warmup (default: true)

## Best Practices

When working with the caching and query optimization layer:

1. **Always invalidate cache** when updating related data
2. **Use the appropriate caching service** for your use case
3. **Monitor query analytics** to identify optimization opportunities
4. **Test cache hit rates** to ensure effective caching
5. **Consider database-specific optimizations** for critical queries
6. **Use adaptive TTL** for frequently accessed data
7. **Implement partial cache invalidation** where possible
8. **Warm up cache** for common query patterns

## Recent Improvements

Recent work has focused on:

1. **Linting and Compilation Fixes**:

   - Fixed all TypeScript lint errors and warnings
   - Ensured all files compile cleanly with TypeScript

2. **Test Infrastructure Improvements**:

   - Refactored tests to use direct instantiation with simple Jest mocks
   - Fixed dependency injection issues in test files
   - Added comprehensive test coverage for all services

3. **Query Optimization Enhancements**:

   - Implemented adaptive cache TTL based on query patterns
   - Added PostgreSQL-specific optimizations for text search
   - Improved cache key generation for better hit rates

4. **Analytics Improvements**:

   - Enhanced slow query detection
   - Added query frequency analysis
   - Improved analytics data structure for better insights

5. **Documentation**:
   - Added comprehensive documentation for all services
   - Documented best practices and configuration options
