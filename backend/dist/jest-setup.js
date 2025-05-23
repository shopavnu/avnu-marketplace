const mockDecorator = () => (target) => target;
const mockPropertyDecorator = () => () => jest.fn();
const mockMethodDecorator = () => () => jest.fn();
const mockParameterDecorator = () => () => jest.fn();
jest.mock('class-transformer', () => {
    return {
        Type: mockPropertyDecorator,
        Transform: mockPropertyDecorator,
        Expose: mockPropertyDecorator,
        Exclude: mockPropertyDecorator,
        plainToInstance: jest.fn((dtoClass, plainObject) => plainObject),
    };
});
jest.mock('@nestjs/typeorm', () => {
    return {
        InjectRepository: mockParameterDecorator,
        TypeOrmModule: {
            forFeature: jest.fn(),
            forRoot: jest.fn(),
        },
        getRepositoryToken: (entity) => entity,
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
        registerEnumType: jest.fn(),
        createUnionType: jest.fn(),
    };
});
jest.mock('@nestjs/apollo', () => {
    return {
        ApolloDriver: jest.fn(),
    };
});
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
    };
});
console.error = jest.fn();
//# sourceMappingURL=jest-setup.js.map