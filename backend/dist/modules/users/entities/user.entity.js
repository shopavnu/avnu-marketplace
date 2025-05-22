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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
const class_transformer_1 = require('class-transformer');
const user_segment_entity_1 = require('./user-segment.entity');
var UserRole;
(function (UserRole) {
  UserRole['USER'] = 'USER';
  UserRole['MERCHANT'] = 'MERCHANT';
  UserRole['ADMIN'] = 'ADMIN';
})(UserRole || (exports.UserRole = UserRole = {}));
(0, graphql_1.registerEnumType)(UserRole, {
  name: 'UserRole',
  description: 'Defines the roles a user can have',
});
let User = class User {
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};
exports.User = User;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  User.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata('design:type', String),
  ],
  User.prototype,
  'email',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  User.prototype,
  'firstName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  User.prototype,
  'lastName',
  void 0,
);
__decorate(
  [(0, class_transformer_1.Exclude)(), (0, typeorm_1.Column)(), __metadata('design:type', String)],
  User.prototype,
  'password',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => UserRole),
    (0, typeorm_1.Column)({ type: 'enum', enum: UserRole, default: UserRole.USER }),
    __metadata('design:type', String),
  ],
  User.prototype,
  'role',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  User.prototype,
  'profileImage',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata('design:type', Array),
  ],
  User.prototype,
  'interests',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  User.prototype,
  'isEmailVerified',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  User.prototype,
  'isMerchant',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata('design:type', Date),
  ],
  User.prototype,
  'createdAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata('design:type', Date),
  ],
  User.prototype,
  'updatedAt',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => user_segment_entity_1.UserSegmentEntity, { nullable: true }),
    (0, typeorm_1.ManyToOne)(
      () => user_segment_entity_1.UserSegmentEntity,
      segment => segment.users,
      { nullable: true },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'segment_id' }),
    __metadata('design:type', user_segment_entity_1.UserSegmentEntity),
  ],
  User.prototype,
  'segment',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String), __metadata('design:paramtypes', [])],
  User.prototype,
  'fullName',
  null,
);
exports.User = User = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('users')],
  User,
);
//# sourceMappingURL=user.entity.js.map
