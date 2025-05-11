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
exports.UserEngagement = exports.EngagementType = void 0;
const typeorm_1 = require('typeorm');
const graphql_1 = require('@nestjs/graphql');
var EngagementType;
(function (EngagementType) {
  EngagementType['PAGE_VIEW'] = 'page_view';
  EngagementType['PRODUCT_VIEW'] = 'product_view';
  EngagementType['CATEGORY_VIEW'] = 'category_view';
  EngagementType['BRAND_VIEW'] = 'brand_view';
  EngagementType['SEARCH'] = 'search';
  EngagementType['ADD_TO_CART'] = 'add_to_cart';
  EngagementType['REMOVE_FROM_CART'] = 'remove_from_cart';
  EngagementType['CHECKOUT_START'] = 'checkout_start';
  EngagementType['CHECKOUT_COMPLETE'] = 'checkout_complete';
  EngagementType['FAVORITE'] = 'favorite';
  EngagementType['UNFAVORITE'] = 'unfavorite';
  EngagementType['SHARE'] = 'share';
  EngagementType['FILTER_USE'] = 'filter_use';
  EngagementType['SORT_USE'] = 'sort_use';
  EngagementType['RECOMMENDATION_CLICK'] = 'recommendation_click';
  EngagementType['SIGNUP'] = 'signup';
  EngagementType['LOGIN'] = 'login';
  EngagementType['ACCOUNT_UPDATE'] = 'account_update';
})(EngagementType || (exports.EngagementType = EngagementType = {}));
let UserEngagement = class UserEngagement {};
exports.UserEngagement = UserEngagement;
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: EngagementType,
    }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'engagementType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'entityId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'entityType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'pagePath',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'referrer',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', Number),
  ],
  UserEngagement.prototype,
  'durationSeconds',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'metadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'deviceType',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'platform',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'ipAddress',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata('design:type', String),
  ],
  UserEngagement.prototype,
  'userAgent',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata('design:type', Date),
  ],
  UserEngagement.prototype,
  'timestamp',
  void 0,
);
exports.UserEngagement = UserEngagement = __decorate(
  [(0, graphql_1.ObjectType)(), (0, typeorm_1.Entity)('user_engagement')],
  UserEngagement,
);
//# sourceMappingURL=user-engagement.entity.js.map
