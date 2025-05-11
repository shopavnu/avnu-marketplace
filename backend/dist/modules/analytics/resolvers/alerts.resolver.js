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
exports.AlertsResolver = void 0;
const graphql_1 = require('@nestjs/graphql');
const common_1 = require('@nestjs/common');
const alerts_service_1 = require('../services/alerts.service');
const alert_entity_1 = require('../entities/alert.entity');
const admin_guard_1 = require('../../auth/guards/admin.guard');
let AlertsResolver = class AlertsResolver {
  constructor(alertsService) {
    this.alertsService = alertsService;
  }
  async alerts(status, type, period) {
    return this.alertsService.getAlerts(status, type, period);
  }
  async updateAlertStatus(id, status) {
    return this.alertsService.updateAlertStatus(id, status);
  }
};
exports.AlertsResolver = AlertsResolver;
__decorate(
  [
    (0, graphql_1.Query)(() => [alert_entity_1.AlertEntity]),
    __param(0, (0, graphql_1.Args)('status', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('type', { type: () => String, nullable: true })),
    __param(
      2,
      (0, graphql_1.Args)('period', { type: () => Number, nullable: true, defaultValue: 30 }),
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String, Number]),
    __metadata('design:returntype', Promise),
  ],
  AlertsResolver.prototype,
  'alerts',
  null,
);
__decorate(
  [
    (0, graphql_1.Mutation)(() => alert_entity_1.AlertEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => String })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, String]),
    __metadata('design:returntype', Promise),
  ],
  AlertsResolver.prototype,
  'updateAlertStatus',
  null,
);
exports.AlertsResolver = AlertsResolver = __decorate(
  [
    (0, graphql_1.Resolver)(() => alert_entity_1.AlertEntity),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(
      0,
      (0, common_1.Inject)((0, common_1.forwardRef)(() => alerts_service_1.AlertsService)),
    ),
    __metadata('design:paramtypes', [alerts_service_1.AlertsService]),
  ],
  AlertsResolver,
);
//# sourceMappingURL=alerts.resolver.js.map
