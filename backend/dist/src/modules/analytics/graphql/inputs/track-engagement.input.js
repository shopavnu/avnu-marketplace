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
exports.TrackEngagementInput = void 0;
const graphql_1 = require('@nestjs/graphql');
const user_engagement_entity_1 = require('../../entities/user-engagement.entity');
(0, graphql_1.registerEnumType)(user_engagement_entity_1.EngagementType, {
  name: 'EngagementType',
  description: 'The type of user engagement being tracked',
});
let TrackEngagementInput = class TrackEngagementInput {};
exports.TrackEngagementInput = TrackEngagementInput;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'userId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => user_engagement_entity_1.EngagementType),
    __metadata('design:type', String),
  ],
  TrackEngagementInput.prototype,
  'engagementType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'entityId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'entityType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'pagePath',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'referrer',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  TrackEngagementInput.prototype,
  'durationSeconds',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'metadata',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'deviceType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'platform',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'ipAddress',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackEngagementInput.prototype,
  'userAgent',
  void 0,
);
exports.TrackEngagementInput = TrackEngagementInput = __decorate(
  [(0, graphql_1.InputType)()],
  TrackEngagementInput,
);
//# sourceMappingURL=track-engagement.input.js.map
