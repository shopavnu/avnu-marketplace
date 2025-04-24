/**
 * Manual test script for search suggestions
 *
 * This script can be run directly with ts-node to test the search suggestions feature
 * without the complexity of the Jest testing framework.
 *
 * Run with: npx ts-node src/modules/search/tests/search-suggestions-test.ts
 */

import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import { PersonalizationService } from '../../personalization/services/personalization.service';
import { SearchAnalyticsService } from '../services/search-analytics.service';
import { ConfigService } from '@nestjs/config';
import {} from /* Logger */ '@nestjs/common';

// Mock services
const elasticsearchMock = {
  search: jest.fn().mockImplementation(params => {
    console.log('Elasticsearch search called with:', JSON.stringify(params, null, 2));

    // Return mock data based on the query
    if (params.body?.suggest?.completion?.prefix === 'sust') {
      return Promise.resolve({
        suggest: {
          completion: [
            {
              text: 'sust',
              offset: 0,
              length: 4,
              options: [
                {
                  text: 'sustainable clothing',
                  _source: {
                    text: 'sustainable clothing',
                    type: 'product',
                    score: 5.0,
                    category: 'clothing',
                  },
                },
              ],
            },
          ],
        },
      });
    } else {
      return Promise.resolve({
        suggest: {
          completion: [
            {
              text: params.body?.suggest?.completion?.prefix || '',
              offset: 0,
              length: (params.body?.suggest?.completion?.prefix || '').length,
              options: [],
            },
          ],
        },
      });
    }
  }),
};

const personalizationMock = {
  getPersonalizedSuggestions: jest.fn().mockImplementation((query, userId, limit) => {
    console.log(
      `Personalization getPersonalizedSuggestions called with: query=${query}, userId=${userId}, limit=${limit}`,
    );

    if (query === 'eco' && userId) {
      return Promise.resolve([
        {
          text: 'eco-friendly products',
          relevance: 8.5,
          category: 'home',
          type: 'search',
        },
      ]);
    }

    return Promise.resolve([]);
  }),
};

const analyticsMock = {
  getPopularSearches: jest.fn().mockImplementation((prefix, limit, categories) => {
    console.log(
      `Analytics getPopularSearches called with: prefix=${prefix}, limit=${limit}, categories=${categories}`,
    );

    if (prefix === 'org') {
      return Promise.resolve([
        {
          query: 'organic cotton',
          count: 25,
          category: 'clothing',
        },
      ]);
    }

    return Promise.resolve([]);
  }),
  trackEngagement: jest.fn().mockImplementation(data => {
    console.log('Analytics trackEngagement called with:', JSON.stringify(data, null, 2));
    return Promise.resolve();
  }),
};

const configMock = {
  get: jest.fn().mockImplementation(key => {
    const config = {
      SEARCH_SUGGESTIONS_ENABLED: true,
      SEARCH_SUGGESTIONS_MAX_LIMIT: 10,
    };
    return config[key] || null;
  }),
};

const _loggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn(),
};

// Create service instance
const searchSuggestionService = new SearchSuggestionService(
  elasticsearchMock as unknown as ElasticsearchService,
  configMock as unknown as ConfigService,
  personalizationMock as unknown as PersonalizationService,
  analyticsMock as unknown as SearchAnalyticsService,
);

// Test cases
async function runTests() {
  console.log('=== Search Suggestions Test Script ===\n');

  // Test 1: Short query
  console.log('Test 1: Short query');
  const result1 = await searchSuggestionService.getSuggestions({
    query: 'a',
    limit: 5,
    includePopular: true,
    includePersonalized: true,
    includeCategoryContext: true,
  });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('Expected: Empty suggestions array');
  console.log('Passed:', result1.suggestions.length === 0);
  console.log('\n');

  // Test 2: Prefix suggestions
  console.log('Test 2: Prefix suggestions');
  const result2 = await searchSuggestionService.getSuggestions({
    query: 'sust',
    limit: 5,
    includePopular: true,
    includePersonalized: true,
    includeCategoryContext: true,
  });
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('Expected: Suggestions containing "sustainable clothing"');
  console.log(
    'Passed:',
    result2.suggestions.some(s => s.text === 'sustainable clothing'),
  );
  console.log('\n');

  // Test 3: Popular suggestions
  console.log('Test 3: Popular suggestions');
  const result3 = await searchSuggestionService.getSuggestions({
    query: 'org',
    limit: 5,
    includePopular: true,
    includePersonalized: false,
    includeCategoryContext: true,
  });
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('Expected: Suggestions containing "organic cotton"');
  console.log(
    'Passed:',
    result3.suggestions.some(s => s.text === 'organic cotton'),
  );
  console.log('\n');

  // Test 4: Personalized suggestions
  console.log('Test 4: Personalized suggestions');
  const mockUser = { id: 'test-user-123', email: 'test@example.com' };
  const result4 = await searchSuggestionService.getSuggestions(
    {
      query: 'eco',
      limit: 5,
      includePopular: true,
      includePersonalized: true,
      includeCategoryContext: true,
    },
    mockUser as any,
  );
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.log('Expected: Suggestions containing "eco-friendly products"');
  console.log(
    'Passed:',
    result4.suggestions.some(s => s.text === 'eco-friendly products'),
  );
  console.log('\n');

  // Test 5: Category filtering
  console.log('Test 5: Category filtering');
  await searchSuggestionService.getSuggestions({
    query: 'test',
    limit: 5,
    includePopular: true,
    includePersonalized: false,
    includeCategoryContext: true,
    categories: ['clothing'],
  });
  console.log('Expected: Elasticsearch search called with category context');
  console.log('Expected: Analytics getPopularSearches called with clothing category');
  console.log('\n');

  console.log('=== All tests completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
});
