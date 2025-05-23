// Create a mock decorator function that returns the target
const mockDecorator = () => (target: any) => target;
const mockPropertyDecorator = () => () => jest.fn();
const mockMethodDecorator = () => () => jest.fn();
const mockParameterDecorator = () => () => jest.fn();

// Mock class-validator decorators
jest.mock('class-validator', () => {
  return {
    IsString: mockPropertyDecorator,
    IsInt: mockPropertyDecorator,
    IsOptional: mockPropertyDecorator,
    Min: mockPropertyDecorator,
    Max: mockPropertyDecorator,
    IsDate: mockPropertyDecorator,
    IsBoolean: mockPropertyDecorator,
    IsEmail: mockPropertyDecorator,
    IsUrl: mockPropertyDecorator,
    IsNotEmpty: mockPropertyDecorator,
    IsEnum: mockPropertyDecorator,
    Matches: mockPropertyDecorator,
    ValidateNested: mockPropertyDecorator,
    Length: mockPropertyDecorator,
  };
});

// Mock class-transformer decorators
jest.mock('class-transformer', () => {
  return {
    Type: mockPropertyDecorator,
    Transform: mockPropertyDecorator,
    Expose: mockPropertyDecorator,
    Exclude: mockPropertyDecorator,
  };
});

// Mock NestJS decorators
jest.mock('@nestjs/common', () => {
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
});

jest.mock('@nestjs/typeorm', () => {
  return {
    InjectRepository: mockParameterDecorator,
    TypeOrmModule: {
      forFeature: jest.fn(),
      forRoot: jest.fn(),
    },
    getRepositoryToken: jest.fn(),
  };
});

jest.mock('@nestjs-modules/ioredis', () => {
  return {
    InjectRedis: mockParameterDecorator,
    RedisModule: {
      forRoot: jest.fn(),
      forRootAsync: jest.fn(),
    },
  };
});

// Mock EventEmitter2
jest.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: jest.fn().mockImplementation(() => ({
      emit: jest.fn(),
      on: jest.fn(),
    })),
    OnEvent: mockMethodDecorator,
  };
});

// Mock GraphQL and Apollo
jest.mock('@nestjs/graphql', () => {
  return {
    Args: mockParameterDecorator,
    Resolver: mockDecorator,
    Query: mockMethodDecorator,
    Mutation: mockMethodDecorator,
    Field: mockPropertyDecorator,
    InputType: mockDecorator,
    ObjectType: mockDecorator,
    Int: jest.fn(),
    Float: jest.fn(),
    ID: jest.fn(),
  };
});

jest.mock('@nestjs/apollo', () => {
  return {
    ApolloDriver: jest.fn(),
  };
});

// Mock TypeORM decorators and functions
jest.mock('typeorm', () => {
  return {
    Entity: mockDecorator,
    PrimaryGeneratedColumn: mockPropertyDecorator,
    Column: mockPropertyDecorator,
    CreateDateColumn: mockPropertyDecorator,
    UpdateDateColumn: mockPropertyDecorator,
    DeleteDateColumn: mockPropertyDecorator,
    ManyToOne: mockPropertyDecorator,
    OneToMany: mockPropertyDecorator,
    ManyToMany: mockPropertyDecorator,
    OneToOne: mockPropertyDecorator,
    JoinColumn: mockPropertyDecorator,
    JoinTable: mockPropertyDecorator,
    Index: mockPropertyDecorator,
    Unique: mockPropertyDecorator,
    Repository: jest.fn().mockImplementation(() => ({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({}),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    })),
    getRepository: jest.fn().mockImplementation(() => ({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    })),
  };
});

// Mock NestJS decorators
jest.mock('@nestjs/common', () => {
  const original = jest.requireActual('@nestjs/common');
  return {
    ...original,
    Injectable: mockDecorator,
    Inject: mockPropertyDecorator,
    Optional: mockPropertyDecorator,
    Controller: mockDecorator,
    Get: mockPropertyDecorator,
    Post: mockPropertyDecorator,
    Put: mockPropertyDecorator,
    Delete: mockPropertyDecorator,
    Patch: mockPropertyDecorator,
    UseGuards: mockDecorator,
    UsePipes: mockDecorator,
    UseInterceptors: mockDecorator,
    Param: mockPropertyDecorator,
    Body: mockPropertyDecorator,
    Query: mockPropertyDecorator,
    Headers: mockPropertyDecorator,
    Req: mockPropertyDecorator,
    Res: mockPropertyDecorator,
  };
});

// Mock GraphQL decorators
jest.mock('@nestjs/graphql', () => {
  return {
    Args: mockPropertyDecorator,
    Resolver: mockDecorator,
    Query: mockPropertyDecorator,
    Mutation: mockPropertyDecorator,
    Field: mockPropertyDecorator,
    ObjectType: mockDecorator,
    InputType: mockDecorator,
    ArgsType: mockDecorator,
    Int: jest.fn().mockReturnValue(Number),
    Float: jest.fn().mockReturnValue(Number),
    ID: jest.fn().mockReturnValue(String),
    registerEnumType: jest.fn(),
  };
});

// Mock class-validator decorators
jest.mock('class-validator', () => {
  return {
    IsString: mockPropertyDecorator,
    IsNumber: mockPropertyDecorator,
    IsBoolean: mockPropertyDecorator,
    IsDate: mockPropertyDecorator,
    IsOptional: mockPropertyDecorator,
    IsArray: mockPropertyDecorator,
    IsEnum: mockPropertyDecorator,
    IsNotEmpty: mockPropertyDecorator,
    Min: mockPropertyDecorator,
    Max: mockPropertyDecorator,
    ValidateNested: mockPropertyDecorator,
    IsEmail: mockPropertyDecorator,
    Length: mockPropertyDecorator,
  };
});

// Mock class-transformer decorators
jest.mock('class-transformer', () => {
  return {
    Type: mockPropertyDecorator,
    Transform: mockPropertyDecorator,
    Exclude: mockPropertyDecorator,
    Expose: mockPropertyDecorator,
  };
});

// Mock EventEmitter2
jest.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: jest.fn().mockImplementation(() => ({
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
    })),
  };
});

// Mock getRepositoryToken
jest.mock('@nestjs/typeorm', () => {
  return {
    getRepositoryToken: jest.fn().mockReturnValue('repositoryToken'),
    InjectRepository: jest.fn(),
    TypeOrmModule: {
      forRoot: jest.fn().mockReturnValue({
        module: class MockTypeOrmRootModule {},
        providers: [],
      }),
      forFeature: jest.fn().mockReturnValue({
        module: class MockTypeOrmFeatureModule {},
        providers: [],
      }),
    },
  };
});

// Suppress console errors during tests
console.error = jest.fn();
