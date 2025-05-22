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
var ShopifyMetricsController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyMetricsController = void 0;
const common_1 = require('@nestjs/common');
const webhook_metrics_service_1 = require('../webhooks/webhook-metrics.service');
const jwt_auth_guard_1 = require('../../../auth/guards/jwt-auth.guard');
let ShopifyMetricsController = (ShopifyMetricsController_1 = class ShopifyMetricsController {
  constructor(metricsService) {
    this.metricsService = metricsService;
    this.logger = new common_1.Logger(ShopifyMetricsController_1.name);
  }
  getWebhookMetrics() {
    this.logger.log('Generating webhook metrics report');
    return this.metricsService.generateMetricsReport();
  }
  resetWebhookMetrics() {
    this.logger.log('Resetting webhook metrics');
    this.metricsService.resetAllMetrics();
    return { success: true, message: 'Webhook metrics have been reset' };
  }
  getWebhookSuccessRate() {
    const rate = this.metricsService.getGlobalSuccessRate();
    return {
      success: true,
      successRate: rate,
      status: rate > 95 ? 'healthy' : rate > 80 ? 'warning' : 'critical',
    };
  }
});
exports.ShopifyMetricsController = ShopifyMetricsController;
__decorate(
  [
    (0, common_1.Get)('webhooks'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  ShopifyMetricsController.prototype,
  'getWebhookMetrics',
  null,
);
__decorate(
  [
    (0, common_1.Get)('webhooks/reset'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  ShopifyMetricsController.prototype,
  'resetWebhookMetrics',
  null,
);
__decorate(
  [
    (0, common_1.Get)('webhooks/success-rate'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  ShopifyMetricsController.prototype,
  'getWebhookSuccessRate',
  null,
);
exports.ShopifyMetricsController =
  ShopifyMetricsController =
  ShopifyMetricsController_1 =
    __decorate(
      [
        (0, common_1.Controller)('admin/shopify/metrics'),
        (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
        __metadata('design:paramtypes', [webhook_metrics_service_1.WebhookMetricsService]),
      ],
      ShopifyMetricsController,
    );
//# sourceMappingURL=metrics.controller.js.map
