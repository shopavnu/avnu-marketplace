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
exports.UserBehavior = exports.BehaviorType = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const user_entity_1 = require('../../users/entities/user.entity');
var BehaviorType;
(function (BehaviorType) {
  BehaviorType['VIEW'] = 'view';
  BehaviorType['SEARCH'] = 'search';
  BehaviorType['FAVORITE'] = 'favorite';
  BehaviorType['ADD_TO_CART'] = 'add_to_cart';
  BehaviorType['PURCHASE'] = 'purchase';
})(BehaviorType || (exports.BehaviorType = BehaviorType = {}));
let UserBehavior = class UserBehavior {};
exports.UserBehavior = UserBehavior;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata('design:type', user_entity_1.User),
  ],
  UserBehavior.prototype,
  'user',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'entityId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'entityType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: BehaviorType,
    }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'behaviorType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata('design:type', Number),
  ],
  UserBehavior.prototype,
  'count',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserBehavior.prototype,
  'metadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  UserBehavior.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.Column)(),
    __metadata('design:type', Date),
  ],
  UserBehavior.prototype,
  'lastInteractionAt',
  void 0,
);
exports.UserBehavior = UserBehavior = __decorate(
  [
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('user_behaviors'),
    (0, typeorm_1.Index)(['userId', 'entityId', 'entityType', 'behaviorType'], { unique: true }),
  ],
  UserBehavior,
);
//# sourceMappingURL=user-behavior.entity.js.map
