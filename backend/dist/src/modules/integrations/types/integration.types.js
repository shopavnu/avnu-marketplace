"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformCapability = exports.ConnectionStatus = exports.WebhookEventType = exports.OrderSyncError = exports.SyncStatus = exports.PlatformType = void 0;
var PlatformType;
(function (PlatformType) {
    PlatformType["SHOPIFY"] = "shopify";
    PlatformType["WOOCOMMERCE"] = "woocommerce";
    PlatformType["BIGCOMMERCE"] = "bigcommerce";
    PlatformType["MAGENTO"] = "magento";
    PlatformType["CUSTOM"] = "custom";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["PROCESSING"] = "processing";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
class OrderSyncError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = 'OrderSyncError';
        this.context = context;
    }
}
exports.OrderSyncError = OrderSyncError;
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["ORDER_CREATED"] = "order.created";
    WebhookEventType["ORDER_UPDATED"] = "order.updated";
    WebhookEventType["ORDER_CANCELLED"] = "order.cancelled";
    WebhookEventType["PRODUCT_CREATED"] = "product.created";
    WebhookEventType["PRODUCT_UPDATED"] = "product.updated";
    WebhookEventType["PRODUCT_DELETED"] = "product.deleted";
    WebhookEventType["INVENTORY_UPDATED"] = "inventory.updated";
    WebhookEventType["FULFILLMENT_CREATED"] = "fulfillment.created";
    WebhookEventType["FULFILLMENT_UPDATED"] = "fulfillment.updated";
    WebhookEventType["REFUND_CREATED"] = "refund.created";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["ACTIVE"] = "active";
    ConnectionStatus["INACTIVE"] = "inactive";
    ConnectionStatus["PENDING"] = "pending";
    ConnectionStatus["EXPIRED"] = "expired";
    ConnectionStatus["REVOKED"] = "revoked";
    ConnectionStatus["ERROR"] = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
var PlatformCapability;
(function (PlatformCapability) {
    PlatformCapability["ORDERS"] = "orders";
    PlatformCapability["PRODUCTS"] = "products";
    PlatformCapability["INVENTORY"] = "inventory";
    PlatformCapability["FULFILLMENTS"] = "fulfillments";
    PlatformCapability["CUSTOMERS"] = "customers";
    PlatformCapability["REFUNDS"] = "refunds";
    PlatformCapability["SHIPPING"] = "shipping";
    PlatformCapability["WEBHOOKS"] = "webhooks";
})(PlatformCapability || (exports.PlatformCapability = PlatformCapability = {}));
//# sourceMappingURL=integration.types.js.map