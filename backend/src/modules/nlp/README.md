# Natural Language Processing (NLP) Module

## Overview

The NLP module provides advanced natural language processing capabilities for the Avnu Marketplace, enhancing search functionality with semantic understanding, entity recognition, and query expansion. This module serves as the intelligence layer for the search system, transforming raw user queries into structured, contextually-aware search parameters.

## Key Components

### Services

#### NlpProcessingService

The core service responsible for processing natural language queries:

- **Entity Recognition**: Identifies products, brands, categories, and attributes in user queries
- **Intent Detection**: Determines user search intent (e.g., browsing, comparing, purchasing)
- **Query Expansion**: Expands queries with synonyms and related terms
- **Semantic Analysis**: Understands the meaning behind queries beyond keywords
- **Contextual Understanding**: Incorporates user context and search history

#### NlpTrainingService

Manages the training and improvement of NLP models:

- **Model Training**: Trains and updates NLP models with marketplace data
- **Feedback Integration**: Incorporates user feedback to improve model accuracy
- **Performance Monitoring**: Tracks and reports on NLP model performance

#### NlpMetadataService

Manages metadata extraction and enrichment:

- **Product Description Analysis**: Extracts key features and attributes from product descriptions
- **Review Analysis**: Identifies key themes and sentiment in product reviews
- **Metadata Enrichment**: Enhances product and merchant data with NLP-derived insights

## Architecture

The NLP module integrates with the search infrastructure as follows:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Search    │────▶│     NLP     │────▶│  Enhanced   │
│   Query     │     │  Processing │     │   Query     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │    NLP    │
                    │   Models  │
                    └───────────┘
```

## Usage

### Basic Query Processing

```typescript
import { NlpProcessingService } from '../modules/nlp/services/nlp-processing.service';

@Injectable()
export class SearchService {
  constructor(private readonly nlpService: NlpProcessingService) {}

  async search(query: string, options: SearchOptions): Promise<SearchResults> {
    if (options.enableNlp) {
      const enhancedQuery = await this.nlpService.processQuery(query);
      // Use enhanced query for search
    }
    // Continue with search process
  }
}
```

### Entity Recognition

```typescript
const { entities } = await nlpService.extractEntities(query);
// entities = { products: [...], brands: [...], categories: [...], attributes: [...] }
```

### Intent Detection

```typescript
const { intent, confidence } = await nlpService.detectIntent(query);
// intent = 'product_comparison', confidence = 0.87
```

## Configuration

The NLP module can be configured through environment variables:

```
# NLP Configuration
NLP_ENABLE_ENTITY_RECOGNITION=true
NLP_ENABLE_INTENT_DETECTION=true
NLP_ENABLE_QUERY_EXPANSION=true
NLP_ENABLE_SEMANTIC_ANALYSIS=true

# Model Configuration
NLP_MODEL_PATH=./models/nlp
NLP_MODEL_VERSION=1.2.0
NLP_CONFIDENCE_THRESHOLD=0.7

# Performance Configuration
NLP_CACHE_ENABLED=true
NLP_CACHE_TTL=300
NLP_MAX_PROCESSING_TIME=200
```

## Development Guide

### Adding New NLP Features

1. Implement the feature in the appropriate service
2. Add unit tests to verify functionality
3. Update the configuration options if necessary
4. Document the feature in this README

### Training NLP Models

```bash
# Train NLP models with marketplace data
npm run train-nlp-models

# Evaluate NLP model performance
npm run evaluate-nlp-models
```

### Testing NLP Components

```bash
# Run NLP unit tests
npm run test:unit -- --testPathPattern=nlp

# Run NLP integration tests
npm run test:integration -- --testPathPattern=nlp
```

## Best Practices

### Query Processing

- Always validate and sanitize input queries
- Implement timeouts for NLP processing to prevent long-running operations
- Cache processed queries for common search terms
- Log NLP processing errors for monitoring and improvement

### Model Management

- Version control all NLP models
- Implement A/B testing for model improvements
- Monitor model performance metrics (accuracy, precision, recall)
- Regularly retrain models with new marketplace data

## Future Enhancements

- Multi-language support for global marketplace expansion
- Conversational search capabilities
- Visual search integration (image to text)
- Advanced sentiment analysis for review processing
- Real-time personalization based on user behavior
- Voice search integration
