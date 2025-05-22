'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PlatformCapability =
  exports.ConnectionStatus =
  exports.WebhookEventType =
  exports.OrderSyncError =
  exports.SyncStatus =
  exports.PlatformType =
    void 0;
__exportStar(require('./shopify-product.types'), exports);
__exportStar(require('./woocommerce-product.types'), exports);
var integration_types_1 = require('./integration.types');
Object.defineProperty(exports, 'PlatformType', {
  enumerable: true,
  get: function () {
    return integration_types_1.PlatformType;
  },
});
Object.defineProperty(exports, 'SyncStatus', {
  enumerable: true,
  get: function () {
    return integration_types_1.SyncStatus;
  },
});
Object.defineProperty(exports, 'OrderSyncError', {
  enumerable: true,
  get: function () {
    return integration_types_1.OrderSyncError;
  },
});
Object.defineProperty(exports, 'WebhookEventType', {
  enumerable: true,
  get: function () {
    return integration_types_1.WebhookEventType;
  },
});
Object.defineProperty(exports, 'ConnectionStatus', {
  enumerable: true,
  get: function () {
    return integration_types_1.ConnectionStatus;
  },
});
Object.defineProperty(exports, 'PlatformCapability', {
  enumerable: true,
  get: function () {
    return integration_types_1.PlatformCapability;
  },
});
__exportStar(require('./shopify.types'), exports);
//# sourceMappingURL=index.js.map
