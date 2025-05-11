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
exports.TrackSearchInput = void 0;
const graphql_1 = require('@nestjs/graphql');
let TrackSearchInput = class TrackSearchInput {};
exports.TrackSearchInput = TrackSearchInput;
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'query',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'userId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'sessionId',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  TrackSearchInput.prototype,
  'resultCount',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  TrackSearchInput.prototype,
  'clickCount',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  TrackSearchInput.prototype,
  'conversionCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  TrackSearchInput.prototype,
  'hasFilters',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'filters',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'categoryContext',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'deviceType',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'platform',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  TrackSearchInput.prototype,
  'isNlpEnhanced',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean, { nullable: true }), __metadata('design:type', Boolean)],
  TrackSearchInput.prototype,
  'isPersonalized',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'referrer',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'metadata',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  TrackSearchInput.prototype,
  'filterCount',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => String, { nullable: true }), __metadata('design:type', String)],
  TrackSearchInput.prototype,
  'userAgent',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Date, { nullable: true }), __metadata('design:type', Date)],
  TrackSearchInput.prototype,
  'timestamp',
  void 0,
);
exports.TrackSearchInput = TrackSearchInput = __decorate(
  [(0, graphql_1.InputType)()],
  TrackSearchInput,
);
//# sourceMappingURL=track-search.input.js.map
