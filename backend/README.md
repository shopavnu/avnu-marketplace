# av | nu Marketplace Backend

A sophisticated, discovery-focused e-commerce platform with an advanced search infrastructure emphasizing personalization, value alignment, and independent brand discovery.

## Features

- Multi-entity search across products, merchants, and brands
- Advanced entity-specific filtering
- Intelligent relevance scoring
- Personalization capabilities
- Search caching, experimentation, and monitoring
- Entity relevance scoring
- Comprehensive analytics dashboard
- Advanced query optimization and adaptive caching
- Query performance analytics and monitoring
- Database-specific optimizations (PostgreSQL)

## Tech Stack

- NestJS (TypeScript)
- Elasticsearch
- GraphQL
- Redis (Caching)
- PostgreSQL (with full-text search)
- Docker
- Kubernetes
- Circuit Breaker Pattern
- Adaptive Caching

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/avnu/marketplace.git
cd marketplace/backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.development
```

Edit the `.env.development` file with your configuration.

4. Start the development environment:

```bash
cd ..
docker-compose up -d
cd backend
npm run start:dev
```

## Deployment

### Docker Deployment

Build and run the Docker container:

```bash
docker build -t avnu/marketplace-backend .
docker run -p 8080:8080 --env-file .env.production avnu/marketplace-backend
```

### Kubernetes Deployment

Deploy to Kubernetes:

```bash
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/deployment.yaml
```

## GraphQL Schema Management

This project uses a schema-first approach for GraphQL. The schema is defined in `src/schema.graphql` and must be kept in sync with the resolver implementations.

### Important Schema Components

- **Search Types**: Comprehensive types for multi-entity search, including `SearchResponseType`, `ProductResultType`, `MerchantResultType`, and `BrandResultType`
- **Analytics Dashboard**: Types for merchant and search analytics
- **Personalization**: User preferences and behavior tracking
- **Experimentation**: A/B testing infrastructure
- **Cursor-based Pagination**: Support for efficient result pagination

### Schema Maintenance Guidelines

1. **Bulk Updates**: Always update the schema in large, comprehensive batches based on resolver signatures
2. **Type Consistency**: Ensure enum values match exactly (e.g., `ASC`/`DESC` for `SortOrder`)
3. **Field Completeness**: Include all fields that resolvers expect to return
4. **Type Alignment**: Keep DTOs, entities, and GraphQL types aligned

## Search Infrastructure

The search infrastructure is built on Elasticsearch with advanced features:

- Multi-entity search
- Natural language processing
- Personalization
- A/B testing
- Monitoring and analytics

### Initializing Search Indices

Initialize the Elasticsearch indices:

```bash
# Create indices if they don't exist
npm run init-search-indices -- --create-only

# Update existing indices
npm run init-search-indices -- --update

# Rebuild indices from database data
npm run init-search-indices -- --rebuild

# Operate on a specific index
npm run init-search-indices -- --rebuild --index=products
```

### Search Configuration

Configure search behavior through environment variables:

```
# Search Configuration
SEARCH_ENABLE_SYNONYMS=true
SEARCH_ENABLE_SEMANTIC=true
SEARCH_ENABLE_QUERY_EXPANSION=true
SEARCH_ENABLE_ENTITY_RECOGNITION=true

# Caching Configuration
SEARCH_CACHE_ENABLED=true
SEARCH_CACHE_TTL=300
SEARCH_CACHE_MAX_ITEMS=1000
CACHE_ENABLED=true
CACHE_TTL=300
SLOW_QUERY_THRESHOLD_MS=500
QUERY_CACHE_TTL_DEFAULT=300
QUERY_CACHE_TTL_HIGH_TRAFFIC=600
QUERY_CACHE_TTL_LOW_TRAFFIC=60
CACHE_WARMUP_ENABLED=true

# Experiments Configuration
SEARCH_EXPERIMENTS_ENABLED=true

# Monitoring Configuration
SEARCH_MONITORING_ENABLED=true
SEARCH_MONITORING_SAMPLE_RATE=0.1
SEARCH_PERFORMANCE_WARNING_THRESHOLD=500
SEARCH_PERFORMANCE_CRITICAL_THRESHOLD=1000
```

## Testing

Run tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Performance tests
npm run test:perf

# Run caching and query optimization tests
npm test -- --config=jest.config.js "src/modules/**/*(cache|query)*.spec.ts"
```

See the [Testing Guide](./docs/TESTING_GUIDE.md) for more details on our testing approach.

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

- Linting and testing on pull requests
- Automatic deployment to staging on merge to develop
- Automatic deployment to production on merge to main

## Documentation

- [Caching & Query Optimization](./docs/CACHING_QUERY_OPTIMIZATION.md) - Details on our caching layer and query optimization
- [Testing Guide](./docs/TESTING_GUIDE.md) - Guide for running and extending tests

## License

This project is proprietary and confidential.

© 2025 av | nu Marketplace. All rights reserved.
