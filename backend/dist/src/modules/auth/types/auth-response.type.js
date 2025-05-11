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
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthResponse = void 0;
const graphql_1 = require('@nestjs/graphql');
const user_entity_1 = require('../../users/entities/user.entity');
let UserInfo = class UserInfo {};
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserInfo.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserInfo.prototype,
  'email',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserInfo.prototype,
  'firstName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserInfo.prototype,
  'lastName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  UserInfo.prototype,
  'fullName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  UserInfo.prototype,
  'profileImage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', Boolean)],
  UserInfo.prototype,
  'isEmailVerified',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', Boolean)],
  UserInfo.prototype,
  'isMerchant',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String), __metadata('design:type', String)],
  UserInfo.prototype,
  'role',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  UserInfo.prototype,
  'merchantId',
  void 0,
);
UserInfo = __decorate([(0, graphql_1.ObjectType)()], UserInfo);
let AuthResponse = class AuthResponse {};
exports.AuthResponse = AuthResponse;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  AuthResponse.prototype,
  'accessToken',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => UserInfo), __metadata('design:type', UserInfo)],
  AuthResponse.prototype,
  'user',
  void 0,
);
exports.AuthResponse = AuthResponse = __decorate([(0, graphql_1.ObjectType)()], AuthResponse);
//# sourceMappingURL=auth-response.type.js.map
