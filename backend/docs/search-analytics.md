# Search Analytics Documentation

## Overview

This document outlines the search analytics implementation in the Avnu Marketplace backend. The search analytics system captures detailed information about user search behavior, filter usage, sorting preferences, result distribution, and personalization.

## Analytics Data Structure

### Basic Search Information

- `query`: The search query string
- `userId`: ID of the user performing the search (if authenticated)
- `sessionId`: Session identifier for anonymous users
- `resultCount`: Total number of results returned
- `hasFilters`: Boolean indicating if filters were applied
- `isNlpEnhanced`: Boolean indicating if NLP enhancement was enabled
- `isPersonalized`: Boolean indicating if personalization was applied
- `experimentId`: Identifier for A/B testing experiments
- `personalizationScore`: A score from 0-1 indicating how heavily personalization influenced the results

### Enhanced Metadata

The search analytics system captures detailed metadata about each search:

#### Filter Usage

Tracks which filters are being used and how:

```json
{
  "category": {
    "type": "exact",
    "valueCount": 2,
    "values": ["Electronics", "Computers"]
  },
  "price": {
    "type": "range",
    "min": 100,
    "max": 500
  }
}
```

#### Sort Options

Tracks sorting preferences:

```json
{
  "price": {
    "order": "asc",
    "priority": 1
  },
  "rating": {
    "order": "desc",
    "priority": 2
  }
}
```

#### Entity Distribution

Tracks result distribution across entity types:

```json
{
  "products": 10,
  "merchants": 3,
  "brands": 2
}
```

#### Facet Usage

Tracks available facets in search results:

```json
{
  "categories": {
    "count": 5,
    "values": [
      { "name": "Electronics", "count": 10 },
      { "name": "Computers", "count": 5 }
    ]
  },
  "price": {
    "min": 19.99,
    "max": 1999.99,
    "rangeCount": 4
  }
}
```

#### Performance Metrics

- `responseTimeMs`: Time taken to process the search request

### Implementation

The search analytics implementation is integrated into the `MultiEntitySearchResolver` class. When a search query is executed, the resolver captures all relevant data and sends it to the analytics service.

```typescript
// Example analytics tracking in MultiEntitySearchResolver
this.analyticsService.trackSearch({
  query: input.query,
  userId: user?.id,
  resultCount: response.pagination.total,
  hasFilters: Object.keys(filterUsage).length > 0,
  filters: JSON.stringify(filterUsage),
  isNlpEnhanced: true,
  isPersonalized: response.isPersonalized,
  metadata: {
    // Various metadata fields
    personalizationMetrics: response.personalizationMetrics,
  }
});
```

Additionally, for authenticated users, search behavior is tracked to improve future personalization:

```typescript
// Track user behavior for personalization
if (user && input.query) {
  this.personalizationService.trackInteractionAndUpdatePreferences(
    user.id,
    BehaviorType.SEARCH,
    input.query,
    'search',
    input.query,
  );
}
```

## Usage Examples

### Tracking a Search

The search analytics are automatically tracked for each search performed through the `multiEntitySearch` GraphQL endpoint.

### Analyzing Search Data

The analytics data can be accessed through the following endpoints:

- `GET /api/analytics/search`: Returns search analytics data
- `GET /api/analytics/dashboard`: Returns dashboard analytics including search metrics

## Personalized Search

### Overview

The personalized search feature enhances search results based on user preferences and behavior. When enabled, the search system applies personalization in several ways:

1. **Preference-based filtering**: Adds filters based on user preferences (categories, brands, etc.)
2. **Behavior-based boosting**: Boosts relevance scores for items similar to those the user has interacted with
3. **Context-aware ranking**: Adjusts result ranking based on user context and history

### Implementation

Personalization is implemented through integration with the `PersonalizationService`:

```typescript
// Apply personalization if enabled and user is authenticated
if (input.personalized && user) {
  // Get personalized filters based on user preferences
  const personalizedFilters = await this.personalizationService.generatePersonalizedFilters(user.id);
  
  // Get personalized boosts based on user behavior
  const personalizedBoosts = await this.personalizationService.generatePersonalizedBoosts(user.id);
  
  // Apply filters and boosts to search options
  // ...
}
```

### Personalization Metrics

The system tracks detailed metrics about how personalization affects search results:

```json
{
  "personalizationMetrics": {
    "filterCount": 3,
    "boostCount": 5,
    "categoryBoosts": ["clothing", "accessories"],
    "brandBoosts": ["brand-123"],
    "influenceScore": 0.75,
    "beforeRankingTop5": ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"],
    "afterRankingTop5": ["prod-3", "prod-1", "prod-5", "prod-2", "prod-4"]
  }
}
```

### Personalization Analytics

The system captures detailed analytics about personalization effectiveness:

1. **Influence measurement**: How much personalization changed the results
2. **Engagement impact**: How personalization affects click-through and conversion rates
3. **Filter effectiveness**: Which personalized filters are most effective
4. **Boost effectiveness**: Which personalized boosts are most effective

## Future Enhancements

### Google Analytics Integration

Future versions will integrate with Google Analytics 4 for more comprehensive analytics:

1. **Event-based tracking**: Map search events to GA4 events
2. **Custom dimensions**: Create custom dimensions for search-specific metrics
3. **User properties**: Track user preferences and behavior patterns
4. **Conversion tracking**: Link search behavior to conversions
5. **Personalization effectiveness**: Track how personalization impacts user engagement

### A/B Testing Framework

The analytics system is designed to support A/B testing of search algorithms:

1. **Experiment IDs**: Track which search algorithm variant was used
2. **Performance comparison**: Compare metrics across variants
3. **Statistical significance**: Determine when results are statistically significant
4. **Personalization variants**: Test different personalization strategies

## Search Highlighting

### Overview

The Avnu Marketplace search now supports highlighting of search terms in the results, making it easier for users to identify why a particular result matched their query.

### Highlighting Features

- **Field-specific highlighting**: Configurable highlighting for specific fields like title, description, etc.
- **Custom highlighting tags**: Customizable pre and post tags for highlighted terms (default: `<em>` and `</em>`)
- **Fragment size control**: Adjustable size of text fragments containing highlighted terms
- **Matched terms extraction**: Automatic extraction of matched terms from highlighted content

### Using Highlighting

Highlighting can be enabled in search queries by setting the following parameters:

```graphql
query {
  multiEntitySearch(input: {
    query: "organic cotton",
    enableHighlighting: true,
    highlightFields: ["title", "description", "brandName"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
    highlightFragmentSize: 150
  }) {
    results {
      ... on ProductResultType {
        id
        title
        description
        highlights {
          fields {
            field
            snippets
          }
          matchedTerms
        }
      }
    }
  }
}
```

### Highlighting Response Structure

When highlighting is enabled, each result will include a `highlights` object with the following structure:

```json
{
  "highlights": {
    "fields": [
      {
        "field": "title",
        "snippets": ["Organic <em>Cotton</em> T-Shirt"]
      },
      {
        "field": "description",
        "snippets": ["Made from 100% <em>organic</em> <em>cotton</em> material"]
      }
    ],
    "matchedTerms": ["organic", "cotton"]
  }
}
```

### Analytics Integration

Search highlighting usage is tracked in analytics, allowing you to understand how users interact with highlighted content. The `highlightsEnabled` flag in search analytics indicates whether highlighting was enabled for a particular search query.

### Other Planned Enhancements

1. **User Behavior Analysis**: Track user session data to understand search patterns over time
2. **Conversion Tracking**: Link search queries to conversions (purchases, sign-ups, etc.)
3. **A/B Testing Framework**: Enhance the experiment ID tracking to support structured A/B tests
4. **Analytics Dashboard**: Create a dedicated dashboard for search analytics
5. **Real-time Analytics**: Implement real-time tracking of search trends
6. **Semantic Highlighting**: Highlighting of semantically related terms, not just exact matches

## Technical Reference

### Analytics Payload Structure

```typescript
interface SearchAnalyticsPayload {
  query: string;
  userId?: string;
  sessionId?: string;
  resultCount: number;
  hasFilters: boolean;
  filters?: string; // JSON stringified filter data
  categoryContext?: string;
  deviceType?: string;
  platform?: string;
  isNlpEnhanced: boolean;
  isPersonalized: boolean;
  experimentId?: string;
  filterCount?: number;
  metadata: {
    responseTimeMs: number;
    sortOptions?: Record<string, { order: string; priority: number }>;
    entityDistribution: {
      products: number;
      merchants: number;
      brands: number;
    };
    facetUsage: Record<string, any>;
    entityFilterCounts: {
      product: number;
      merchant: number;
      brand: number;
    };
    queryLength: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```
