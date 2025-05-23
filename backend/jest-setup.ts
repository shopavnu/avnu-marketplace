
// Set a dummy CLERK_SECRET_KEY for test environments
process.env.CLERK_SECRET_KEY = 'test_clerk_secret_key_for_jest_runs';

// Create a mock decorator function that returns the target
const mockDecorator = () => (target: any) => target;
const mockPropertyDecorator = () => () => jest.fn();
const mockMethodDecorator = () => () => jest.fn();
const mockParameterDecorator = () => () => jest.fn();

/* jest.mock('class-validator', () => {
  const originalModule = jest.requireActual('class-validator');
  return {
    ...originalModule,
    // If specific functions from class-validator need to be mocked for certain tests,
    // they can be overridden here. For DTO validation tests, we want actual decorators.
  };
}); */

/* jest.mock('class-transformer', () => {
  const originalModule = jest.requireActual('class-transformer');
  return {
    ...originalModule, // Use actual implementations for all decorators and functions.
  };
}); */

/* jest.mock('@nestjs/common', () => {
  const originalModule = jest.requireActual('@nestjs/common');
  return {
    ...originalModule,
    // Specific overrides can be placed here if needed globally,
    // but for now, ensure all decorators are the actual implementations.
  };
}); */

/* jest.mock('@nestjs/swagger', () => {
  const originalModule = jest.requireActual('@nestjs/swagger');
  return {
    ...originalModule,
  };
}); */

/* jest.mock('@nestjs/graphql', () => {
  const originalModule = jest.requireActual('@nestjs/graphql');
  return {
    ...originalModule,
    // Specific overrides can be placed here if needed globally.
  };
}); */

// Mock NestJS decorators
/* jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    Injectable: mockDecorator,
    Inject: mockParameterDecorator,
    Controller: mockDecorator,
    Get: mockMethodDecorator,
    Post: mockMethodDecorator,
    Put: mockMethodDecorator,
    Delete: mockMethodDecorator,
    Patch: mockMethodDecorator,
    UseGuards: mockMethodDecorator,
    Query: mockParameterDecorator,
    Param: mockParameterDecorator,
    Body: mockParameterDecorator,
    Headers: mockParameterDecorator,
  };
}); */

/* jest.mock('@nestjs/typeorm', () => {
  const originalModule = jest.requireActual('@nestjs/typeorm');
  return {
    ...originalModule, // Use actual implementations by default, including InjectRepository
    // TypeOrmModule static methods are still mocked if they interfere with unit tests
    TypeOrmModule: {
      ...originalModule.TypeOrmModule,
      forFeature: jest.fn(() => originalModule.TypeOrmModule.forFeature([])),
      forRoot: jest.fn(() => originalModule.TypeOrmModule.forRoot({})),
    },
    // getRepositoryToken and InjectRepository will now use their actual implementations from originalModule
  };
}); */

/* jest.mock('@nestjs-modules/ioredis', () => {
  const originalModule = jest.requireActual('@nestjs-modules/ioredis');
  return {
    ...originalModule, // Spread original module to get actual InjectRedis
    // Keep RedisModule methods mocked as they are often setup/config related
    RedisModule: {
      ...originalModule.RedisModule, // Spread original RedisModule static properties if any
      forRoot: jest.fn(),
      forRootAsync: jest.fn(),
    },
  };
}); */

// Mock EventEmitter2
/* jest.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: jest.fn().mockImplementation(() => ({
      emit: jest.fn(),
      on: jest.fn(),
    })),
    OnEvent: mockMethodDecorator,
  };
}); */

// Mock GraphQL and Apollo
/* jest.mock('@nestjs/graphql', () => {
  const originalModule = jest.requireActual('@nestjs/graphql');
  return {
    ...originalModule, // Use actual implementations by default
    // Selectively mock decorators related to runtime resolver behavior if needed
    Args: mockParameterDecorator,        // Keep mocked if desired
    Resolver: mockDecorator,           // Keep mocked if desired
    Query: mockMethodDecorator,         // Keep mocked if desired
    Mutation: mockMethodDecorator,     // Keep mocked if desired
    Subscription: mockMethodDecorator,  // Add if you use subscriptions and want to mock
    ResolveField: mockMethodDecorator,  // Add if you use field resolvers and want to mock

    // Ensure core DTO/Type decorators and utilities use their REAL implementations
    // These are already covered by ...originalModule, but listed for clarity
    // Field: originalModule.Field, (already covered)
    // InputType: originalModule.InputType, (already covered)
    // ObjectType: originalModule.ObjectType, (already covered)
    // PartialType: originalModule.PartialType, (already covered)
    // Int: originalModule.Int, (already covered)
    // Float: originalModule.Float, (already covered)
    // ID: originalModule.ID, (already covered)
    // registerEnumType: originalModule.registerEnumType, (already covered)
    // createUnionType: originalModule.createUnionType, (already covered)
  };
}); */

/* jest.mock('@nestjs/apollo', () => {
  return {
    ApolloDriver: jest.fn(),
  };
}); */

// Mock TypeORM decorators and functions
/* jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  return {
    ...originalModule, // Use actual implementations for all decorators and functions by default

    // If you need to mock specific functions like getRepository or Repository methods for unit tests,
    // you can override them here. For example:
    // getRepository: jest.fn().mockImplementation(() => ({
    //   find: jest.fn().mockResolvedValue([]),
    //   findOne: jest.fn().mockResolvedValue(null),
    //   save: jest.fn(entity => Promise.resolve(entity)),
    //   // ... other repository methods
    // })),
    // DataSource: jest.fn().mockImplementation(() => ({
    //   getRepository: jest.fn().mockImplementation(() => ({
    //      find: jest.fn().mockResolvedValue([]),
    //      findOne: jest.fn().mockResolvedValue(null),
    //      save: jest.fn(entity => Promise.resolve(entity)),
    //   })),
    //   initialize: jest.fn().mockResolvedValue(undefined),
    //   destroy: jest.fn().mockResolvedValue(undefined),
    //   // ... other DataSource methods
    // })),

    // Ensure all decorators (Entity, Column, PrimaryGeneratedColumn, etc.)
    // use their REAL implementations from originalModule.
    // This is achieved by spreading ...originalModule above.
  };
}); */


// Suppress console errors during tests
console.error = jest.fn();
