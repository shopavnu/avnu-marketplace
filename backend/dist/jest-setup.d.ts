declare const mockDecorator: () => (target: any) => any;
declare const mockPropertyDecorator: () => () => jest.Mock<any, any, any>;
declare const mockMethodDecorator: () => () => jest.Mock<any, any, any>;
declare const mockParameterDecorator: () => () => jest.Mock<any, any, any>;
