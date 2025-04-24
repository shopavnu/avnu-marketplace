# av | nu Marketplace Indexing System

This document provides an overview of the real-time indexing system implemented for the av | nu marketplace, including its architecture, features, and how to resolve common development issues.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Components](#key-components)
4. [API Endpoints](#api-endpoints)
5. [GraphQL Operations](#graphql-operations)
6. [Event System](#event-system)
7. [Development Guide](#development-guide)
8. [Troubleshooting](#troubleshooting)

## Overview

The av | nu marketplace indexing system provides a robust, event-driven architecture for real-time indexing of products, merchants, and brands. It supports bulk operations, reindexing, and comprehensive error handling with retry mechanisms.

## Architecture

The system follows a modular architecture based on NestJS:

```
modules/
└── search/
    ├── controllers/
    │   ├── indexing.controller.ts       # REST API endpoints for indexing
    │   └── ...
    ├── resolvers/
    │   ├── indexing.resolver.ts         # GraphQL operations for indexing
    │   └── ...
    ├── services/
    │   ├── elasticsearch.service.ts     # Core Elasticsearch operations
    │   ├── elasticsearch-indexing.service.ts # Enhanced indexing operations
    │   ├── search-index.listener.ts     # Event listeners for indexing
    │   └── ...
    └── search.module.ts                 # Module configuration
```

## Key Components

### ElasticsearchIndexingService

Provides advanced indexing capabilities:
- Individual entity indexing (products, merchants, brands)
- Bulk operations for improved performance
- Complete reindexing with zero downtime
- Progress tracking and error handling

### IndexingController

Exposes REST endpoints for indexing operations:
- Reindexing (all entities or by type)
- Status tracking
- Bulk indexing by IDs
- Secured with role-based access control

### IndexingResolver

Provides GraphQL operations for indexing:
- Mutations for triggering reindexing
- Queries for status tracking
- Mutations for bulk indexing
- Same security model as REST endpoints

### SearchIndexListener

Handles events for real-time indexing:
- Entity creation/update/deletion events
- Bulk operation events
- Reindexing events
- Implements retry logic for resilience

## API Endpoints

All endpoints are secured with JWT authentication and require ADMIN role.

```
POST /api/search/indexing/reindex
Body: { "entityType": "all" | "products" | "merchants" | "brands" }
```

```
GET /api/search/indexing/status?entityType=all
```

```
POST /api/search/indexing/products/bulk
Body: { "productIds": ["id1", "id2", ...] }
```

Similar endpoints exist for merchants and brands.

## GraphQL Operations

```graphql
mutation {
  reindexAll(entityType: "all")
}

query {
  getReindexingStatus(entityType: "products")
}

mutation {
  bulkIndexProducts(productIds: ["id1", "id2"])
}
```

Similar operations exist for merchants and brands.

## Event System

The system uses NestJS EventEmitter for communication:

- `product.created`, `product.updated`, `product.deleted`
- `products.bulk_created`, `products.bulk_updated`, `products.bulk_index`
- Similar events for merchants and brands
- `search.reindex_all`, `search.reindex_progress`, `search.reindex_complete`, `search.reindex_error`

## Development Guide

### Prerequisites

- Node.js 14+
- npm or yarn
- Elasticsearch 7.x
- PostgreSQL 12+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd avnu-marketplace/backend
npm install
```

### Configuration

Configure Elasticsearch in your `.env.development` file:

```
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_MAX_RETRIES=3
ELASTICSEARCH_RETRY_DELAY_MS=1000
ELASTICSEARCH_BULK_BATCH_SIZE=100
ELASTICSEARCH_INDEXING_CONCURRENCY=5
```

## Troubleshooting

### TypeScript Lint Errors

During development, you may encounter TypeScript lint errors related to missing dependencies. These will be resolved when you install the required packages.

#### Common Errors and Solutions

1. **Module Not Found Errors**

   Error:
   ```
   Cannot find module '@nestjs/common' or its corresponding type declarations.
   Cannot find module '@nestjs/config' or its corresponding type declarations.
   Cannot find module '@nestjs/typeorm' or its corresponding type declarations.
   Cannot find module '@nestjs/graphql' or its corresponding type declarations.
   Cannot find module '@nestjs/event-emitter' or its corresponding type declarations.
   ```

   Solution:
   Install the required NestJS packages:

   ```bash
   npm install @nestjs/common @nestjs/config @nestjs/typeorm @nestjs/graphql @nestjs/event-emitter @nestjs/apollo
   ```

2. **Entity Import Errors**

   Error:
   ```
   Cannot find module '../../products/entities/product.entity' or its corresponding type declarations.
   Cannot find module '../../merchants/entities/merchant.entity' or its corresponding type declarations.
   Cannot find module '../../products/entities/brand.entity' or its corresponding type declarations.
   ```

   Solution:
   Ensure your project structure matches the expected paths. If these files don't exist yet, create them with the appropriate entity definitions.

3. **TypeORM Related Errors**

   Error:
   ```
   Cannot find module 'typeorm' or its corresponding type declarations.
   ```

   Solution:
   Install TypeORM:

   ```bash
   npm install typeorm @nestjs/typeorm
   ```

4. **Elasticsearch Client Access Error**

   Error:
   ```
   Property 'client' is private and only accessible within class 'ElasticsearchService'.
   ```

   Solution:
   Modify the `ElasticsearchService` to expose the client property or provide public methods for the operations needed by `ElasticsearchIndexingService`.

   ```typescript
   // In elasticsearch.service.ts
   public getClient() {
     return this.client;
   }
   ```

   Then update `ElasticsearchIndexingService` to use this method:

   ```typescript
   // In elasticsearch-indexing.service.ts
   await this.elasticsearchService.getClient().index({
     // ...
   });
   ```

### Running the Indexing System

1. Start Elasticsearch:
   ```bash
   docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.14.0
   ```

2. Start the NestJS application:
   ```bash
   npm run start:dev
   ```

3. Use the API or GraphQL to trigger indexing operations:
   ```bash
   curl -X POST http://localhost:3000/api/search/indexing/reindex \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"entityType": "all"}'
   ```

## Performance Considerations

- Bulk operations are significantly more efficient than individual operations
- Reindexing uses temporary indices to prevent downtime
- Batch size and concurrency can be tuned in the configuration
- For very large datasets, consider using pagination in bulk operations
