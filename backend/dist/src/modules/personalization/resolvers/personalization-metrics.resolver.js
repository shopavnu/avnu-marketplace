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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PersonalizationMetricsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const admin_guard_1 = require('../../../common/guards/admin.guard');
const personalization_metrics_service_1 = require('../services/personalization-metrics.service');
const personalization_metrics_dto_1 = require('../dto/personalization-metrics.dto');
let PersonalizationMetricsResolver = class PersonalizationMetricsResolver {
  constructor(personalizationMetricsService) {
    this.personalizationMetricsService = personalizationMetricsService;
  }
  async personalizationMetrics(period) {
    return this.personalizationMetricsService.getPersonalizationMetrics(period);
  }
};
exports.PersonalizationMetricsResolver = PersonalizationMetricsResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => personalization_metrics_dto_1.PersonalizationMetricsDto),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, defaultValue: 30 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  PersonalizationMetricsResolver.prototype,
  'personalizationMetrics',
  null,
);
exports.PersonalizationMetricsResolver = PersonalizationMetricsResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata('design:paramtypes', [
      personalization_metrics_service_1.PersonalizationMetricsService,
    ]),
  ],
  PersonalizationMetricsResolver,
);
//# sourceMappingURL=personalization-metrics.resolver.js.map
