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
var ProductIssuesListener_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProductIssuesListener = void 0;
const common_1 = require('@nestjs/common');
const event_emitter_1 = require('@nestjs/event-emitter');
const notification_service_1 = require('../services/notification.service');
let ProductIssuesListener = (ProductIssuesListener_1 = class ProductIssuesListener {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.logger = new common_1.Logger(ProductIssuesListener_1.name);
  }
  async handleProductIssuesEvent(payload) {
    try {
      this.logger.log(
        `Received product issues event for merchant ${payload.merchantId} with ${payload.productIssues.length} affected products`,
      );
      const suppressedProducts = payload.productIssues.filter(
        issue => issue.suppressedFrom && issue.suppressedFrom.length > 0,
      );
      if (suppressedProducts.length === 0) {
        this.logger.log('No suppressed products to notify about, skipping notification');
        return;
      }
      const success = await this.notificationService.notifyMerchantOfProductIssues(
        payload.merchantId,
        payload.merchantEmail,
        suppressedProducts,
      );
      if (success) {
        this.logger.log(
          `Successfully sent product issues notification to ${payload.merchantEmail}`,
        );
      } else {
        this.logger.error(`Failed to send product issues notification to ${payload.merchantEmail}`);
      }
    } catch (error) {
      this.logger.error(`Error handling product issues event: ${error.message}`, error.stack);
    }
  }
});
exports.ProductIssuesListener = ProductIssuesListener;
__decorate(
  [
    (0, event_emitter_1.OnEvent)('merchant.product.issues'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ProductIssuesListener.prototype,
  'handleProductIssuesEvent',
  null,
);
exports.ProductIssuesListener =
  ProductIssuesListener =
  ProductIssuesListener_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [notification_service_1.NotificationService]),
      ],
      ProductIssuesListener,
    );
//# sourceMappingURL=product-issues.listener.js.map
