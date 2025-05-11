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
exports.MetricsOverTimeType =
  exports.VariantMetricsOverTimeType =
  exports.PeriodMetricsType =
    void 0;
const graphql_1 = require('@nestjs/graphql');
let PeriodMetricsType = class PeriodMetricsType {};
exports.PeriodMetricsType = PeriodMetricsType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  PeriodMetricsType.prototype,
  'period',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PeriodMetricsType.prototype,
  'impressions',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Int), __metadata('design:type', Number)],
  PeriodMetricsType.prototype,
  'conversions',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => graphql_1.Float), __metadata('design:type', Number)],
  PeriodMetricsType.prototype,
  'conversionRate',
  void 0,
);
exports.PeriodMetricsType = PeriodMetricsType = __decorate(
  [(0, graphql_1.ObjectType)()],
  PeriodMetricsType,
);
let VariantMetricsOverTimeType = class VariantMetricsOverTimeType {};
exports.VariantMetricsOverTimeType = VariantMetricsOverTimeType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  VariantMetricsOverTimeType.prototype,
  'variantId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  VariantMetricsOverTimeType.prototype,
  'variantName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)({ nullable: true }), __metadata('design:type', Boolean)],
  VariantMetricsOverTimeType.prototype,
  'isControl',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [PeriodMetricsType]), __metadata('design:type', Array)],
  VariantMetricsOverTimeType.prototype,
  'metricsOverTime',
  void 0,
);
exports.VariantMetricsOverTimeType = VariantMetricsOverTimeType = __decorate(
  [(0, graphql_1.ObjectType)()],
  VariantMetricsOverTimeType,
);
let MetricsOverTimeType = class MetricsOverTimeType {};
exports.MetricsOverTimeType = MetricsOverTimeType;
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  MetricsOverTimeType.prototype,
  'experimentId',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  MetricsOverTimeType.prototype,
  'experimentName',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(), __metadata('design:type', String)],
  MetricsOverTimeType.prototype,
  'interval',
  void 0,
);
__decorate(
  [(0, graphql_1.Field)(() => [VariantMetricsOverTimeType]), __metadata('design:type', Array)],
  MetricsOverTimeType.prototype,
  'variantMetrics',
  void 0,
);
exports.MetricsOverTimeType = MetricsOverTimeType = __decorate(
  [(0, graphql_1.ObjectType)()],
  MetricsOverTimeType,
);
//# sourceMappingURL=metrics-over-time.type.js.map
