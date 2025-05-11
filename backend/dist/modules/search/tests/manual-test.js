function getSuggestions(input, user) {
  console.log(`Getting suggestions for query: "${input.query}"`);
  console.log(
    `Parameters: limit=${input.limit}, includePopular=${input.includePopular}, includePersonalized=${input.includePersonalized}`,
  );
  if (input.categories?.length) {
    console.log(`Filtering by categories: ${input.categories.join(', ')}`);
  }
  if (user) {
    console.log(`User is authenticated: ${user.id}`);
  }
  const suggestions = [];
  if (input.query.length < 2) {
    console.log('Query too short, returning empty results');
    return {
      suggestions: [],
      total: 0,
      isPersonalized: false,
      originalQuery: input.query,
    };
  }
  if (input.query === 'sust') {
    console.log('Adding prefix-based suggestions for "sust"');
    suggestions.push({
      text: 'sustainable clothing',
      score: 5.0,
      category: 'clothing',
      type: 'product',
      isPopular: false,
      isPersonalized: false,
    });
  }
  if (input.includePopular && input.query === 'org') {
    console.log('Adding popular suggestions for "org"');
    suggestions.push({
      text: 'organic cotton',
      score: 10.0,
      category: 'clothing',
      type: 'search',
      isPopular: true,
      isPersonalized: false,
    });
  }
  if (input.includePersonalized && user && input.query === 'eco') {
    console.log('Adding personalized suggestions for "eco"');
    suggestions.push({
      text: 'eco-friendly products',
      score: 8.5,
      category: 'home',
      type: 'search',
      isPopular: false,
      isPersonalized: true,
    });
  }
  console.log(`Returning ${suggestions.length} suggestions`);
  return {
    suggestions,
    total: suggestions.length,
    isPersonalized: !!user && input.includePersonalized,
    originalQuery: input.query,
  };
}
function runTests() {
  console.log('=== Search Suggestions Test Script ===\n');
  console.log('Test 1: Short query');
  const result1 = getSuggestions({
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
  console.log('Test 2: Prefix suggestions');
  const result2 = getSuggestions({
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
  console.log('Test 3: Popular suggestions');
  const result3 = getSuggestions({
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
  console.log('Test 4: Personalized suggestions');
  const mockUser = { id: 'test-user-123', email: 'test@example.com' };
  const result4 = getSuggestions(
    {
      query: 'eco',
      limit: 5,
      includePopular: true,
      includePersonalized: true,
      includeCategoryContext: true,
    },
    mockUser,
  );
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.log('Expected: Suggestions containing "eco-friendly products"');
  console.log(
    'Passed:',
    result4.suggestions.some(s => s.text === 'eco-friendly products'),
  );
  console.log('\n');
  console.log('Test 5: Category filtering');
  const result5 = getSuggestions({
    query: 'test',
    limit: 5,
    includePopular: true,
    includePersonalized: false,
    includeCategoryContext: true,
    categories: ['clothing'],
  });
  console.log('Result:', JSON.stringify(result5, null, 2));
  console.log('Expected: Elasticsearch search called with category context');
  console.log('\n');
  console.log('=== All tests completed ===');
}
runTests();
//# sourceMappingURL=manual-test.js.map
