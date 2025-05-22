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
exports.UserPreferences = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const user_entity_1 = require('../../users/entities/user.entity');
let UserPreferences = class UserPreferences {};
exports.UserPreferences = UserPreferences;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  UserPreferences.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Column)(),
    __metadata('design:type', String),
  ],
  UserPreferences.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata('design:type', user_entity_1.User),
  ],
  UserPreferences.prototype,
  'user',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'favoriteCategories',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'favoriteValues',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'favoriteBrands',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserPreferences.prototype,
  'priceSensitivity',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  UserPreferences.prototype,
  'preferSustainable',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  UserPreferences.prototype,
  'preferEthical',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  UserPreferences.prototype,
  'preferLocalBrands',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'preferredSizes',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'preferredColors',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  UserPreferences.prototype,
  'preferredMaterials',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  UserPreferences.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  UserPreferences.prototype,
  'updatedAt',
  void 0,
);
exports.UserPreferences = UserPreferences = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('user_preferences')],
  UserPreferences,
);
//# sourceMappingURL=user-preferences.entity.js.map
