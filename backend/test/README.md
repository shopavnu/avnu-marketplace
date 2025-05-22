# Avnu Marketplace Testing Framework

## Overview

This directory contains the testing infrastructure for the Avnu Marketplace backend, with a particular focus on search functionality. The testing framework is organized into three main categories: unit tests, integration tests, and performance tests.

## Test Structure

```
test/
├── integration/          # Integration tests
│   └── search/           # Search-specific integration tests
├── performance/          # Performance tests
│   └── search/           # Search-specific performance tests
├── unit/                 # Unit tests
│   └── search/           # Search-specific unit tests
├── search-suggestions.e2e-spec.ts  # End-to-end test for search suggestions
└── README.md             # This file
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual components in isolation, with dependencies mocked or stubbed.

**Location**: `test/unit/`

**Running Unit Tests**:

```bash
# Run all unit tests
npm run test:unit

# Run specific unit tests
npm run test:unit -- --testPathPattern=search
```

### Integration Tests

Integration tests verify that different components work together correctly, often involving database operations and API calls.

**Location**: `test/integration/`

**Running Integration Tests**:

```bash
# Run all integration tests
npm run test:integration

# Run specific integration tests
npm run test:integration -- --testPathPattern=search
```

### Performance Tests

Performance tests measure the system's response time, throughput, and resource usage under various load conditions.

**Location**: `test/performance/`

**Running Performance Tests**:

```bash
# Run all performance tests
npm run test:performance

# Run specific performance tests
npm run test:performance -- --testPathPattern=search
```

### End-to-End Tests

End-to-end tests verify the entire application flow from start to finish, simulating real user scenarios.

**Location**: Root of the test directory (e.g., `search-suggestions.e2e-spec.ts`)

**Running E2E Tests**:

```bash
# Run all e2e tests
npm run test:e2e

# Run specific e2e tests
npm run test:e2e -- --testPathPattern=search-suggestions
```

## Search Testing

### Search Integration Tests

The `test/integration/search/` directory contains tests that verify:

- GraphQL search resolver functionality
- Search service integration with Elasticsearch
- NLP processing integration with search
- Multi-entity search capabilities
- Filter and facet functionality

Key test files:

- `search-pipeline.e2e-spec.ts`: Tests the complete search pipeline
- `search-resolver.integration-spec.ts`: Tests the GraphQL search resolvers

### Search Performance Tests

The `test/performance/search/` directory contains tests that measure:

- Search response times under various query complexities
- Indexing performance
- Cache effectiveness
- System behavior under high search volume

Key test files:

- `search-performance.perf-spec.ts`: Measures search performance metrics

## Best Practices

### Writing Effective Tests

1. **Isolation**: Each test should be independent and not rely on the state from other tests
2. **Clarity**: Test names should clearly describe what is being tested
3. **Coverage**: Aim for high test coverage, especially for critical paths
4. **Mocking**: Use mocks for external dependencies to ensure tests are reliable
5. **Assertions**: Make specific assertions rather than general ones

### Search-Specific Testing Guidelines

1. **Query Variety**: Test with a variety of query types (short, long, misspelled, etc.)
2. **Entity Coverage**: Test searches across all entity types (products, merchants, brands)
3. **Filter Combinations**: Test different combinations of filters and sorting options
4. **Edge Cases**: Test with empty queries, very large result sets, and zero results
5. **Performance Metrics**: Track response times and resource usage

## Test Configuration

Tests can be configured through environment variables or the `.env.test` file:

```
# Test Database
TEST_DATABASE_HOST=localhost
TEST_DATABASE_PORT=5432
TEST_DATABASE_NAME=avnu_test

# Test Elasticsearch
TEST_ELASTICSEARCH_NODE=http://localhost:9200
TEST_ELASTICSEARCH_INDEX_PREFIX=test_

# Test Cache
TEST_REDIS_HOST=localhost
TEST_REDIS_PORT=6379

# Test Performance Thresholds
TEST_SEARCH_RESPONSE_TIME_THRESHOLD=200
TEST_INDEXING_THROUGHPUT_THRESHOLD=100
```

## Troubleshooting

### Common Issues

1. **Flaky Tests**: If tests are inconsistently passing/failing, check for:

   - Race conditions
   - Dependency on test execution order
   - External service availability

2. **Slow Tests**: If tests are running slowly, consider:

   - Using in-memory databases for testing
   - Mocking external services
   - Parallelizing test execution

3. **TypeScript Import Issues**: If you encounter TypeScript errors with imports:
   - Use default imports instead of namespace imports
   - Ensure `esModuleInterop` is enabled in `tsconfig.json`

### Debugging Tests

```bash
# Run tests in debug mode
npm run test:debug

# Run specific tests in debug mode
npm run test:debug -- --testPathPattern=search
```

## Adding New Tests

When adding new tests:

1. Follow the existing directory structure
2. Use descriptive file and test names
3. Include both positive and negative test cases
4. Document any special setup requirements
5. Ensure tests clean up after themselves

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline:

- Unit and integration tests run on every pull request
- Performance tests run on merges to the main branch
- Test results are reported and tracked over time

For more information on the CI/CD pipeline, see the project's CI configuration files.
