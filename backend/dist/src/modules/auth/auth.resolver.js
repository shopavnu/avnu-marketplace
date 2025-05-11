'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const auth_service_1 = require('./auth.service');
const login_dto_1 = require('./dto/login.dto');
const register_dto_1 = require('./dto/register.dto');
const gql_auth_guard_1 = require('./guards/gql-auth.guard');
const public_decorator_1 = require('./decorators/public.decorator');
const auth_response_type_1 = require('./types/auth-response.type');
const user_entity_1 = require('../users/entities/user.entity');
let AuthResolver = class AuthResolver {
  constructor(authService) {
    this.authService = authService;
  }
  async login(loginDto) {
    return this.authService.login(loginDto);
  }
  async register(registerDto) {
    return this.authService.register(registerDto);
  }
  async profile(context) {
    return context.req.user;
  }
  async refreshToken(context) {
    return this.authService.refreshToken(context.req.user.id);
  }
};
exports.AuthResolver = AuthResolver;
__decorate(
  [
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Mutation)(() => auth_response_type_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('loginInput')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [login_dto_1.LoginDto]),
    __metadata('design:returntype', Promise),
  ],
  AuthResolver.prototype,
  'login',
  null,
);
__decorate(
  [
    (0, public_decorator_1.Public)(),
    (0, graphql_1.Mutation)(() => auth_response_type_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('registerInput')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [register_dto_1.RegisterDto]),
    __metadata('design:returntype', Promise),
  ],
  AuthResolver.prototype,
  'register',
  null,
);
__decorate(
  [
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Query)(() => user_entity_1.User),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthResolver.prototype,
  'profile',
  null,
);
__decorate(
  [
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => auth_response_type_1.AuthResponse),
    __param(0, (0, graphql_1.Context)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthResolver.prototype,
  'refreshToken',
  null,
);
exports.AuthResolver = AuthResolver = __decorate(
  [(0, graphql_1.Resolver)(), __metadata('design:paramtypes', [auth_service_1.AuthService])],
  AuthResolver,
);
//# sourceMappingURL=auth.resolver.js.map
