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
exports.AnalyticsFilterInput = void 0;
const graphql_1 = require('@nestjs/graphql');
let AnalyticsFilterInput = class AnalyticsFilterInput {};
exports.AnalyticsFilterInput = AnalyticsFilterInput;
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AnalyticsFilterInput.prototype,
  'timeFrame',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', Date)],
  AnalyticsFilterInput.prototype,
  'startDate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', Date)],
  AnalyticsFilterInput.prototype,
  'endDate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  AnalyticsFilterInput.prototype,
  'productIds',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [String], { nullable: true }), __metadata('design:type', Array)],
  AnalyticsFilterInput.prototype,
  'categoryIds',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AnalyticsFilterInput.prototype,
  'sortBy',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  AnalyticsFilterInput.prototype,
  'sortOrder',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  AnalyticsFilterInput.prototype,
  'page',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata('design:type', Number),
  ],
  AnalyticsFilterInput.prototype,
  'limit',
  void 0,
);
exports.AnalyticsFilterInput = AnalyticsFilterInput = __decorate(
  [(0, graphql_1.InputType)()],
  AnalyticsFilterInput,
);
//# sourceMappingURL=analytics-filter.input.js.map
