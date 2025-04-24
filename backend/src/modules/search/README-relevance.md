# Search Relevance Enhancement

This document outlines the implementation of advanced search relevance features for the Avnu Marketplace, focusing on scoring mechanisms, user preference-based boosting, and A/B testing with Google Analytics integration.

## Overview

The search relevance enhancement consists of three main components:

1. **Search Relevance Service**: Implements advanced scoring mechanisms and query enhancement
2. **User Preference Service**: Tracks and applies user preferences for personalized search results
3. **A/B Testing Service**: Manages experiments to optimize search relevance algorithms
4. **Google Analytics Integration**: Tracks search performance metrics for data-driven optimization

## Scoring Mechanisms

The `SearchRelevanceService` implements multiple scoring profiles:

- **Standard**: Basic BM25 algorithm with field-specific boosts
- **Popularity**: Incorporates view count and rating into scoring
- **Recency**: Boosts newer products with time decay functions
- **Intent-based**: Dynamically adjusts scoring based on detected user intent

Each profile uses Elasticsearch's function scoring capabilities to fine-tune result relevance.

### Implementation

```typescript
// Apply scoring profile to Elasticsearch query
applyScoringProfile(
  query: any,
  profileName: string,
  user?: User,
  intent?: string,
  entities?: Array<{ type: string; value: string; confidence: number }>
): any {
  const profile = this.scoringProfiles.get(profileName);
  if (!profile) {
    return query;
  }

  // Create function score query with appropriate boosts and functions
  // ...
}
```

## User Preference-Based Boosting

The `UserPreferenceService` tracks user interactions and builds preference profiles that influence search results:

- **Category preferences**: Boosts categories the user frequently interacts with
- **Brand preferences**: Boosts brands the user has shown interest in
- **Value preferences**: Boosts products matching user's value interests (sustainable, organic, etc.)
- **Price range preferences**: Boosts products in price ranges the user typically shops in
- **Recently viewed products**: Boosts products the user has recently viewed

### User Preference Learning

The system learns preferences from various user interactions:

- Search queries
- Product views
- Add to cart actions
- Purchases
- Filter applications
- Category/brand clicks

Each interaction type contributes differently to the preference profile, with more significant actions (like purchases) having higher weights.

### Implementation

```typescript
// Apply user preferences to a search query
applyPreferencesToQuery(
  query: any,
  preferences: UserPreferences,
  preferenceWeight: number = 1.0
): any {
  // Enhance query with user preference boosts
  // ...
}
```

## A/B Testing Framework

The `ABTestingService` enables experimentation with different search relevance algorithms:

- **Variant assignment**: Consistently assigns users to test variants
- **Performance tracking**: Monitors search metrics for each variant
- **Statistical analysis**: Helps determine which algorithms perform best

### Test Configuration

Tests are defined with:

- Test ID and description
- Multiple variants with different algorithms and weights
- Start and end dates
- Analytics event name for tracking

### Implementation

```typescript
// Assign a user to a variant for a specific test
assignUserToVariant(
  testId: string, 
  userId: string,
  clientId: string
): { 
  variantId: string;
  algorithm: RelevanceAlgorithm;
  params?: Record<string, any>;
} | null {
  // Assign user to variant based on weights
  // ...
}
```

## Google Analytics Integration

The `GoogleAnalyticsService` tracks search performance metrics:

- **Search events**: Tracks queries, result counts, and test variants
- **Click events**: Tracks which results users click on and their positions
- **Refinement events**: Tracks how users refine their searches
- **A/B test impressions**: Tracks which test variants users are assigned to

### Implementation

```typescript
// Track a search event in Google Analytics
async trackSearch(
  clientId: string,
  searchTerm: string,
  resultCount: number,
  testInfo?: {
    testId: string;
    variantId: string;
  },
  userId?: string
): Promise<boolean> {
  // Send event to Google Analytics
  // ...
}
```

## Usage Example

Here's how these services work together:

1. When a user performs a search, the system:
   - Detects their intent using the NLP services
   - Fetches their preference profile
   - Determines which A/B test variant to use
   - Applies the appropriate scoring profile
   - Tracks the search in Google Analytics

2. The enhanced query is sent to Elasticsearch, which returns more relevant results.

3. When the user interacts with results, the system:
   - Records the interaction
   - Updates their preference profile
   - Tracks the interaction in Google Analytics

4. Over time, the system:
   - Learns more about user preferences
   - Collects data on which relevance algorithms perform best
   - Continuously improves search relevance

## Next Steps

1. **Implement frontend integration**: Add client-side tracking and A/B test support
2. **Create analytics dashboard**: Build tools to analyze test results
3. **Expand preference learning**: Add more interaction types and learning algorithms
4. **Develop semantic search**: Incorporate vector embeddings for concept-based searching
5. **Implement personalized ranking**: Further refine personalization algorithms
