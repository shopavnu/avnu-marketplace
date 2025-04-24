# Avnu Marketplace Search Enhancement

This document outlines the search enhancement features implemented for the Avnu Marketplace, focusing on advanced NLP-powered search capabilities.

## Overview

The Avnu Marketplace search enhancement project aims to create a cutting-edge search solution that provides intelligent, context-aware, and highly performant search experiences for users. The implementation includes:

1. Advanced NLP-powered search capabilities
2. Enhanced Elasticsearch mappings for better performance and relevance
3. Robust, flexible search infrastructure supporting multi-entity search
4. Intelligent query processing with semantic search techniques
5. Comprehensive test suite for validating search functionality

## Key Components

### 1. NLP Search Service

Located in `/src/modules/search/services/nlp-search.service.ts`, this service provides:

- Entity recognition (products, brands, colors, materials, etc.)
- Query expansion
- Intent detection
- Semantic search preparation
- Synonym mapping

### 2. Search Testing Scripts

#### GraphQL Search Test Script
Located in `/scripts/test-graphql-search.ts`, this script allows testing of:
- Basic search functionality
- Filtered searches
- Faceted search results

#### NLP Search Test Script
Located in `/scripts/test-nlp-search.ts`, this script provides:
- Interactive testing of NLP search features
- Comparison between NLP and standard search
- Detailed NLP metadata analysis
- Predefined test queries for different NLP capabilities

#### Client Search Script
Located in `/scripts/client-search.ts`, this script demonstrates:
- Client-side implementation of search
- NLP integration
- Advanced search options

## NLP Search Features

### Query Processing Capabilities

| Feature | Description |
|---------|-------------|
| Synonym Mapping | Maps user queries to known synonyms to expand search scope |
| Entity Recognition | Identifies entities like product types, brands, colors, etc. |
| Query Expansion | Adds related terms to improve recall |
| Intent Detection | Determines user intent (browse, purchase, compare, etc.) |
| Semantic Search | Understands meaning beyond keywords |

### Supported Entity Types

- Product Types
- Brands
- Colors
- Materials
- Styles
- Occasions
- Sizes

## Testing the Search Functionality

### Using the NLP Search Test Script

```bash
# Interactive mode
npx ts-node scripts/test-nlp-search.ts

# Test a specific query
npx ts-node scripts/test-nlp-search.ts "red nike shoes"

# Run all test queries
npx ts-node scripts/test-nlp-search.ts --all

# Compare NLP vs standard search
npx ts-node scripts/test-nlp-search.ts --compare "summer dresses"
```

### Using the GraphQL Search Test Script

```bash
# Run basic search
npx ts-node scripts/test-graphql-search.ts

# Search with specific query
npx ts-node scripts/test-graphql-search.ts --query "running shoes"

# Search with brand filter
npx ts-node scripts/test-graphql-search.ts --query "shoes" --brand "Nike"

# Search with price range
npx ts-node scripts/test-graphql-search.ts --query "shoes" --min-price 50 --max-price 100
```

## Implementation Details

### Search API Resolver

The GraphQL resolver for search functionality is located in `/src/modules/search/resolvers/search-api.resolver.ts`. It supports:

- Multi-entity search
- Advanced search configurations
- NLP feature toggles

### Search Options

Search options are defined in `/src/modules/search/dto/search-options.dto.ts` and include:

- NLP enablement
- Highlighting
- Pagination
- Filtering
- Faceting
- Sorting

### Search Response

Search responses are structured according to `/src/modules/search/dto/search-response.dto.ts` and include:

- Matched products/entities
- Pagination information
- Facets
- NLP metadata
- Highlighting

## Future Enhancements

1. **Machine Learning Integration**
   - Personalized search rankings
   - User behavior-based recommendations
   - Automatic relevance tuning

2. **Advanced Faceting**
   - Dynamic facet generation
   - Hierarchical facets
   - Facet value prediction

3. **Performance Optimization**
   - Query caching
   - Precomputed results for common queries
   - Distributed search infrastructure

4. **Enhanced NLP Features**
   - Conversational search
   - Multi-language support
   - Voice search integration

## Technical Requirements

- Node.js 22.14.0+
- TypeScript 5.8.3+
- NestJS framework
- GraphQL
- Elasticsearch (for production)

## Getting Started

1. Ensure the backend server is running
2. Use the test scripts to verify search functionality
3. Enable NLP features via the search options
4. Monitor search performance and relevance

## Troubleshooting

If you encounter issues with the search functionality:

1. Check that the server is running and accessible
2. Verify Elasticsearch connection (if applicable)
3. Check NLP service configuration
4. Review search logs for errors
5. Test with the provided test scripts to isolate issues
