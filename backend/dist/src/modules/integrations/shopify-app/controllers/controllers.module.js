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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ShopifyControllersModule = void 0;
const common_1 = require('@nestjs/common');
const webhooks_controller_1 = require('./webhooks.controller');
const metrics_controller_1 = require('./metrics.controller');
const webhooks_module_1 = require('../webhooks/webhooks.module');
let ShopifyControllersModule = class ShopifyControllersModule {};
exports.ShopifyControllersModule = ShopifyControllersModule;
exports.ShopifyControllersModule = ShopifyControllersModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [webhooks_module_1.ShopifyWebhooksModule],
      controllers: [
        webhooks_controller_1.ShopifyWebhooksController,
        metrics_controller_1.ShopifyMetricsController,
      ],
    }),
  ],
  ShopifyControllersModule,
);
//# sourceMappingURL=controllers.module.js.map
