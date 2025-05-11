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
exports.ABTestResultDto =
  exports.ABTestMetricDto =
  exports.ABTestVariantMetricDto =
  exports.ABTestVariantDto =
    void 0;
const graphql_1 = require('@nestjs/graphql');
let ABTestVariantDto = class ABTestVariantDto {};
exports.ABTestVariantDto = ABTestVariantDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestVariantDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestVariantDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestVariantDto.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ABTestVariantDto.prototype,
  'trafficPercentage',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => Boolean), __metadata('design:type', Boolean)],
  ABTestVariantDto.prototype,
  'isControl',
  void 0,
);
exports.ABTestVariantDto = ABTestVariantDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ABTestVariantDto,
);
let ABTestVariantMetricDto = class ABTestVariantMetricDto {};
exports.ABTestVariantMetricDto = ABTestVariantMetricDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestVariantMetricDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ABTestVariantMetricDto.prototype,
  'value',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ABTestVariantMetricDto.prototype,
  'improvement',
  void 0,
);
exports.ABTestVariantMetricDto = ABTestVariantMetricDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ABTestVariantMetricDto,
);
let ABTestMetricDto = class ABTestMetricDto {};
exports.ABTestMetricDto = ABTestMetricDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestMetricDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  ABTestMetricDto.prototype,
  'control',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [ABTestVariantMetricDto]), __metadata('design:type', Array)],
  ABTestMetricDto.prototype,
  'variants',
  void 0,
);
exports.ABTestMetricDto = ABTestMetricDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ABTestMetricDto,
);
let ABTestResultDto = class ABTestResultDto {};
exports.ABTestResultDto = ABTestResultDto;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'id',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'name',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'description',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'status',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'startDate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'endDate',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [ABTestVariantDto]), __metadata('design:type', Array)],
  ABTestResultDto.prototype,
  'variants',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [ABTestMetricDto]), __metadata('design:type', Array)],
  ABTestResultDto.prototype,
  'metrics',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', String)],
  ABTestResultDto.prototype,
  'winner',
  void 0,
);
__decorate(
  [
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata('design:type', Number),
  ],
  ABTestResultDto.prototype,
  'confidenceLevel',
  void 0,
);
exports.ABTestResultDto = ABTestResultDto = __decorate(
  [(0, graphql_1.ObjectType)()],
  ABTestResultDto,
);
//# sourceMappingURL=ab-test-results.dto.js.map
