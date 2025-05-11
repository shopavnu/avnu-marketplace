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
exports.ABTestingResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const admin_guard_1 = require('../../../common/guards/admin.guard');
const ab_testing_service_1 = require('../services/ab-testing.service');
const ab_test_results_dto_1 = require('../dto/ab-test-results.dto');
let ABTestingResolver = class ABTestingResolver {
  constructor(abTestingService) {
    this.abTestingService = abTestingService;
  }
  async abTestResults() {
    return this.abTestingService.getABTestResults();
  }
};
exports.ABTestingResolver = ABTestingResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => [ab_test_results_dto_1.ABTestResultDto]),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  ABTestingResolver.prototype,
  'abTestResults',
  null,
);
exports.ABTestingResolver = ABTestingResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata('design:paramtypes', [ab_testing_service_1.ABTestingService]),
  ],
  ABTestingResolver,
);
//# sourceMappingURL=ab-testing.resolver.js.map
