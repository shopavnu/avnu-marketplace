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
exports.UsersResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const users_service_1 = require('./users.service');
const user_entity_1 = require('./entities/user.entity');
const create_user_dto_1 = require('./dto/create-user.dto');
const update_user_dto_1 = require('./dto/update-user.dto');
const gql_auth_guard_1 = require('../auth/guards/gql-auth.guard');
let UsersResolver = class UsersResolver {
  constructor(usersService) {
    this.usersService = usersService;
  }
  createUser(createUserDto) {
    return this.usersService.create(createUserDto);
  }
  findAll() {
    return this.usersService.findAll();
  }
  findOne(id) {
    return this.usersService.findOne(id);
  }
  updateUser(id, updateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  removeUser(id) {
    this.usersService.remove(id);
    return true;
  }
  updateUserInterests(id, interests) {
    return this.usersService.updateInterests(id, interests);
  }
  verifyUserEmail(id) {
    return this.usersService.verifyEmail(id);
  }
};
exports.UsersResolver = UsersResolver;
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    __param(0, (0, graphql_1.Args)('createUserInput')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [create_user_dto_1.CreateUserDto]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'createUser',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => [user_entity_1.User], { name: 'users' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'findAll',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => user_entity_1.User, { name: 'user' }),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'findOne',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('updateUserInput')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, update_user_dto_1.UpdateUserDto]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'updateUser',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'removeUser',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('interests', { type: () => [String] })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Array]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'updateUserInterests',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', void 0),
  ],
  UsersResolver.prototype,
  'verifyUserEmail',
  null,
);
exports.UsersResolver = UsersResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => user_entity_1.User),
    __metadata('design:paramtypes', [users_service_1.UsersService]),
  ],
  UsersResolver,
);
//# sourceMappingURL=users.resolver.js.map
