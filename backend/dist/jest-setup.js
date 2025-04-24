const mockDecorator = () => (target) => target;
const mockPropertyDecorator = () => () => jest.fn();
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
jest.mock('class-transformer', () => {
    return {
        Type: mockPropertyDecorator,
        Transform: mockPropertyDecorator,
        Exclude: mockPropertyDecorator,
        Expose: mockPropertyDecorator,
    };
});
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
jest.mock('@nestjs/typeorm', () => {
    return {
        getRepositoryToken: jest.fn().mockReturnValue('repositoryToken'),
        InjectRepository: jest.fn(),
        TypeOrmModule: {
            forRoot: jest.fn().mockReturnValue({
                module: class MockTypeOrmRootModule {
                },
                providers: [],
            }),
            forFeature: jest.fn().mockReturnValue({
                module: class MockTypeOrmFeatureModule {
                },
                providers: [],
            }),
        },
    };
});
console.error = jest.fn();
//# sourceMappingURL=jest-setup.js.map