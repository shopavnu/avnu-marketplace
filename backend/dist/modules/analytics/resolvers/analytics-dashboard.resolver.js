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
exports.AnalyticsDashboardResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const jwt_auth_guard_1 = require('../../auth/guards/jwt-auth.guard');
const roles_guard_1 = require('../../auth/guards/roles.guard');
const roles_decorator_1 = require('../../auth/decorators/roles.decorator');
const analytics_dashboard_service_1 = require('../services/analytics-dashboard.service');
const user_entity_1 = require('../../users/entities/user.entity');
let AnalyticsDashboardResolver = class AnalyticsDashboardResolver {
  constructor(analyticsDashboardService) {
    this.analyticsDashboardService = analyticsDashboardService;
  }
  async dashboardOverview(period) {
    return this.analyticsDashboardService.getDashboardOverview(period);
  }
  async searchPerformance(period) {
    return this.analyticsDashboardService.getSearchPerformanceOverview(period);
  }
  async entitySearchPerformance(period) {
    return this.analyticsDashboardService.getEntitySearchPerformance(period);
  }
  async userPreferenceAnalytics(limit) {
    return this.analyticsDashboardService.getUserPreferenceAnalytics(limit);
  }
  async abTestingAnalytics() {
    return this.analyticsDashboardService.getABTestingAnalytics();
  }
  async personalizationEffectiveness(period) {
    return this.analyticsDashboardService.getPersonalizationEffectiveness(period);
  }
};
exports.AnalyticsDashboardResolver = AnalyticsDashboardResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, defaultValue: 30 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'dashboardOverview',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, defaultValue: 30 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'searchPerformance',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, defaultValue: 30 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'entitySearchPerformance',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'userPreferenceAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'abTestingAnalytics',
  null,
);
__decorate(
  [
    (0, graphql_1.Query)(() => JSON),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('period', { type: () => graphql_1.Int, defaultValue: 30 })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  AnalyticsDashboardResolver.prototype,
  'personalizationEffectiveness',
  null,
);
exports.AnalyticsDashboardResolver = AnalyticsDashboardResolver = __decorate(
  [
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata('design:paramtypes', [analytics_dashboard_service_1.AnalyticsDashboardService]),
  ],
  AnalyticsDashboardResolver,
);
//# sourceMappingURL=analytics-dashboard.resolver.js.map
