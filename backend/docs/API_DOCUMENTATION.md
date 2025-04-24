# av | nu Marketplace API Documentation

This document provides comprehensive documentation for the av | nu marketplace API, including REST endpoints, GraphQL operations, and details on advanced features like pagination, filtering, and natural language search.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API](#rest-api)
4. [GraphQL API](#graphql-api)
5. [Search Options](#search-options)
6. [Pagination](#pagination)
7. [Filtering](#filtering)
8. [Sorting](#sorting)
9. [Natural Language Processing](#natural-language-processing)
10. [Response Format](#response-format)
11. [Error Handling](#error-handling)
12. [Development Guide](#development-guide)

## Overview

The av | nu marketplace API provides comprehensive endpoints for searching products, merchants, and brands with advanced filtering, sorting, and natural language processing capabilities. The API is available through both REST and GraphQL interfaces.

## Authentication

Most API endpoints support both authenticated and unauthenticated access. Authenticated requests will receive personalized results based on the user's preferences and history.

### JWT Authentication

Authentication is handled using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## REST API

### Search Endpoints

#### General Search

```
POST /api/search
```

Request body:
```json
{
  "query": "sustainable clothing",
  "entityType": "product",
  "page": 0,
  "limit": 20,
  "enableNlp": true,
  "personalized": true,
  "filters": [
    {
      "field": "categories",
      "values": ["Clothing", "Accessories"],
      "exact": false
    }
  ],
  "rangeFilters": [
    {
      "field": "price",
      "min": 10,
      "max": 100
    }
  ],
  "sort": [
    {
      "field": "price",
      "order": "asc"
    }
  ],
  "boostByValues": true,
  "includeSponsoredContent": true,
  "experimentId": "search-experiment-123"
}
```

#### GET Search

```
GET /api/search?query=sustainable+clothing&entityType=product&page=0&limit=20&enableNlp=true
```

#### Product Search

```
GET /api/search/products?query=sustainable+clothing&page=0&limit=20
```

#### Merchant Search

```
GET /api/search/merchants?query=sustainable&page=0&limit=20
```

#### Brand Search

```
GET /api/search/brands?query=eco&page=0&limit=20
```

#### Process Query with NLP

```
GET /api/search/process-query?query=sustainable+clothing
```

## GraphQL API

### Search Operations

#### General Search

```graphql
query {
  search(options: {
    query: "sustainable clothing",
    entityType: PRODUCT,
    page: 0,
    limit: 20,
    enableNlp: true,
    personalized: true,
    filters: [
      {
        field: "categories",
        values: ["Clothing", "Accessories"],
        exact: false
      }
    ],
    rangeFilters: [
      {
        field: "price",
        min: 10,
        max: 100
      }
    ],
    sort: [
      {
        field: "price",
        order: ASC
      }
    ]
  }) {
    pagination {
      total
      page
      limit
      pages
      hasNext
      hasPrevious
    }
    facets {
      categories {
        name
        count
      }
      values {
        name
        count
      }
      price {
        min
        max
        ranges {
          min
          max
          count
        }
      }
    }
    products {
      id
      title
      description
      price
      image
      brandName
      categories
      values
      rating
      reviewCount
      isSponsored
      score
    }
    query
    usedNlp
    processedQuery
    experimentVariant
  }
}
```

#### Product Search

```graphql
query {
  searchProducts(
    query: "sustainable clothing",
    page: 0,
    limit: 20,
    enableNlp: true,
    personalized: true,
    filters: [
      {
        field: "categories",
        values: ["Clothing"],
        exact: false
      }
    ]
  ) {
    pagination {
      total
      page
    }
    products {
      id
      title
      price
    }
  }
}
```

Similar operations exist for `searchMerchants`, `searchBrands`, and `searchAll`.

#### Process Query with NLP

```graphql
query {
  processQuery(query: "sustainable clothing") {
    processedQuery
    entities
    intent
    expandedTerms
  }
}
```

## Search Options

The search API supports the following options:

| Option | Type | Description |
|--------|------|-------------|
| query | string | Search query |
| entityType | enum | Type of entity to search (product, merchant, brand, all) |
| page | number | Page number (0-indexed) |
| limit | number | Items per page (max 100) |
| enableNlp | boolean | Enable natural language processing |
| personalized | boolean | Include personalized results |
| filters | array | Array of filter options |
| rangeFilters | array | Array of range filter options |
| sort | array | Array of sort options |
| boostByValues | boolean | Boost results matching user values |
| includeSponsoredContent | boolean | Include sponsored content |
| experimentId | string | Experiment ID for A/B testing |

### Filter Options

```json
{
  "field": "categories",
  "values": ["Clothing", "Accessories"],
  "exact": false
}
```

### Range Filter Options

```json
{
  "field": "price",
  "min": 10,
  "max": 100
}
```

### Sort Options

```json
{
  "field": "price",
  "order": "asc"
}
```

## Pagination

The API uses offset-based pagination with the following parameters:

- `page`: Page number (0-indexed)
- `limit`: Items per page (max 100)

The response includes pagination information:

```json
{
  "pagination": {
    "total": 100,
    "page": 0,
    "limit": 20,
    "pages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Filtering

### Field Filters

Field filters allow filtering results by specific fields:

```json
{
  "filters": [
    {
      "field": "categories",
      "values": ["Clothing", "Accessories"],
      "exact": false
    },
    {
      "field": "values",
      "values": ["Sustainable", "Ethical"],
      "exact": true
    }
  ]
}
```

The `exact` parameter determines whether to use exact matching or fuzzy matching.

### Range Filters

Range filters allow filtering numeric fields by range:

```json
{
  "rangeFilters": [
    {
      "field": "price",
      "min": 10,
      "max": 100
    },
    {
      "field": "rating",
      "min": 4
    }
  ]
}
```

## Sorting

Results can be sorted by multiple fields:

```json
{
  "sort": [
    {
      "field": "price",
      "order": "asc"
    },
    {
      "field": "rating",
      "order": "desc"
    }
  ]
}
```

## Natural Language Processing

The API includes natural language processing capabilities that can be enabled with the `enableNlp` parameter:

```json
{
  "query": "sustainable clothing",
  "enableNlp": true
}
```

When NLP is enabled, the API will:

1. Process the query to understand intent
2. Expand the query with synonyms and related terms
3. Recognize entities in the query
4. Improve search relevance

The processed query is included in the response:

```json
{
  "query": "sustainable clothing",
  "usedNlp": true,
  "processedQuery": "sustainable eco-friendly clothing apparel"
}
```

## Response Format

### Search Response

```json
{
  "pagination": {
    "total": 100,
    "page": 0,
    "limit": 20,
    "pages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "facets": {
    "categories": [
      {
        "name": "Clothing",
        "count": 75
      },
      {
        "name": "Accessories",
        "count": 25
      }
    ],
    "values": [
      {
        "name": "Sustainable",
        "count": 60
      },
      {
        "name": "Ethical",
        "count": 40
      }
    ],
    "price": {
      "min": 9.99,
      "max": 199.99,
      "ranges": [
        {
          "min": 0,
          "max": 50,
          "count": 30
        },
        {
          "min": 50,
          "max": 100,
          "count": 40
        },
        {
          "min": 100,
          "max": 200,
          "count": 30
        }
      ]
    }
  },
  "products": [
    {
      "id": "123",
      "title": "Organic Cotton T-Shirt",
      "description": "Comfortable organic cotton t-shirt made with sustainable practices.",
      "price": 29.99,
      "image": "https://example.com/images/t-shirt.jpg",
      "brandName": "EcoWear",
      "brandId": "456",
      "categories": ["Clothing", "T-Shirts"],
      "values": ["Sustainable", "Ethical"],
      "rating": 4.5,
      "reviewCount": 42,
      "isSponsored": false,
      "score": 0.95
    }
  ],
  "query": "sustainable clothing",
  "usedNlp": true,
  "processedQuery": "sustainable eco-friendly clothing apparel",
  "experimentVariant": "variant_a"
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

Error responses include a message and details:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Invalid search parameters",
  "details": [
    {
      "field": "limit",
      "message": "limit must not be greater than 100"
    }
  ]
}
```

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

Configure the API in your `.env.development` file:

```
# Search Configuration
SEARCH_ENABLE_SYNONYMS=true
SEARCH_ENABLE_SEMANTIC=true
SEARCH_ENABLE_QUERY_EXPANSION=true
SEARCH_ENABLE_ENTITY_RECOGNITION=true
```

### TypeScript Lint Errors

During development, you may encounter TypeScript lint errors related to missing dependencies. These will be resolved when you install the required packages.

#### Required Dependencies

```bash
npm install @nestjs/common @nestjs/config @nestjs/typeorm @nestjs/graphql @nestjs/apollo @nestjs/swagger @nestjs/event-emitter class-validator class-transformer typeorm elasticsearch
```

#### Entity Imports

If you encounter errors with entity imports, ensure your project structure matches the expected paths. Create the necessary entity files if they don't exist.

#### Service Method Implementations

Some service methods referenced in the code may need to be implemented in their respective services:

1. `ExperimentAssignmentService.getVariantForUser` and `ExperimentAssignmentService.trackInteraction`
2. `PersonalizationService.getPersonalizedSearchTerms`
3. `ElasticsearchService.search`

Implement these methods in their respective services or modify the code to use existing methods.

### Running the API

1. Start Elasticsearch:
   ```bash
   docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.14.0
   ```

2. Start the NestJS application:
   ```bash
   npm run start:dev
   ```

3. Access the Swagger documentation:
   ```
   http://localhost:3000/api/docs
   ```

4. Access the GraphQL playground:
   ```
   http://localhost:3000/graphql
   ```
