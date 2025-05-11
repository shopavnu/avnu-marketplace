# Avnu Marketplace - Testing Guide

This document provides guidance on running and extending the test suite for the Avnu Marketplace backend, with a focus on the caching and query optimization services.

## Table of Contents

1. [Running Tests](#running-tests)
2. [Test Structure](#test-structure)
3. [Mocking Approach](#mocking-approach)
4. [Adding New Tests](#adding-new-tests)
5. [Common Issues](#common-issues)

## Running Tests

### Running All Tests

To run all tests:

```bash
npm test
```

### Running Specific Tests

To run tests for a specific service:

```bash
npm test -- --config=jest.config.js src/modules/products/services/product-query-optimizer.service.spec.ts
```

To run all tests related to caching and query optimization:

```bash
npm test -- --config=jest.config.js "src/modules/**/*(cache|query)*.spec.ts"
```

### Test Coverage

To generate a test coverage report:

```bash
npm test -- --coverage
```

## Test Structure

The test suite follows a standard structure:

1. **Mock Setup**: Define all necessary mocks for dependencies
2. **Service Instantiation**: Create the service under test with mocked dependencies
3. **Test Cases**: Define test cases for each service method
4. **Assertions**: Verify expected behavior

Example:

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let dependencyMock: any;

  beforeEach(() => {
    // Setup mocks
    dependencyMock = { method: jest.fn() };

    // Create service
    service = new ServiceName(dependencyMock);
  });

  describe('methodName', () => {
    it('should do something', async () => {
      // Setup test case
      dependencyMock.method.mockResolvedValue('result');

      // Call method
      const result = await service.methodName();

      // Assert expected behavior
      expect(result).toEqual('expected result');
      expect(dependencyMock.method).toHaveBeenCalled();
    });
  });
});
```

## Mocking Approach

### NestJS Decorator Mocking

To avoid issues with NestJS decorators in tests, we use a module mocking approach:

```typescript
// Mock the entire module to avoid loading the actual implementation with decorators
jest.mock('./service-name.service', () => {
  return {
    ServiceName: jest.fn().mockImplementation(() => ({
      methodName: jest.fn(),
      // Add other methods as needed
    })),
  };
});

import { ServiceName } from './service-name.service';
```

### Dependency Mocking

For service dependencies, we use simple Jest mocks:

```typescript
const dependencyMock = {
  method1: jest.fn().mockResolvedValue('result'),
  method2: jest.fn().mockReturnValue(true),
};
```

### TypeORM Mocking

For TypeORM repositories, we mock the query builder pattern:

```typescript
const queryBuilderMock = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([
    [
      /* items */
    ],
    0,
  ]),
};

const repositoryMock = {
  createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  findAndCount: jest.fn().mockResolvedValue([
    [
      /* items */
    ],
    0,
  ]),
};
```

## Adding New Tests

When adding new tests:

1. **Follow the existing pattern** for similar services
2. **Use the module mocking approach** to avoid decorator issues
3. **Test each method** of the service
4. **Test edge cases** (cache hits, cache misses, errors, etc.)
5. **Verify interactions** with dependencies

Example for adding a new test file:

```typescript
// Mock the module
jest.mock('./new-service.service', () => {
  return {
    NewService: jest.fn().mockImplementation(() => ({
      methodName: jest.fn(),
    })),
  };
});

import { NewService } from './new-service.service';

describe('NewService', () => {
  let service: NewService;
  let dependencyMock: any;

  beforeEach(() => {
    // Setup
    dependencyMock = { method: jest.fn() };
    service = new NewService(dependencyMock);
  });

  // Test cases
});
```

## Common Issues

### Decorator Issues

If you encounter errors related to NestJS decorators:

```
TypeError: (0 , event_emitter_1.OnEvent) is not a function
```

Solution: Use the module mocking approach described above.

### Dependency Injection Issues

If you encounter errors related to NestJS dependency injection:

```
Error: Nest can't resolve dependencies of the ServiceName
```

Solution: Use direct instantiation with mocked dependencies instead of NestJS Test module.

### TypeORM Query Builder Issues

If you encounter errors related to TypeORM query builder:

```
TypeError: Cannot read property 'andWhere' of undefined
```

Solution: Ensure your query builder mock implements all methods used in the service and returns `this` for chaining methods.
