"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedOrdersType = exports.OrderType = exports.PlatformActionsType = exports.OrderItemType = exports.OrderFulfillmentType = exports.ShippingAddressType = void 0;
const graphql_1 = require("@nestjs/graphql");
const order_status_enum_1 = require("../enums/order-status.enum");
const payment_status_enum_1 = require("../enums/payment-status.enum");
const fulfillment_status_enum_1 = require("../enums/fulfillment-status.enum");
let ShippingAddressType = class ShippingAddressType {
    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.addressLine1 = '';
        this.city = '';
        this.state = '';
        this.postalCode = '';
        this.country = '';
    }
};
exports.ShippingAddressType = ShippingAddressType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "addressLine1", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "addressLine2", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ShippingAddressType.prototype, "email", void 0);
exports.ShippingAddressType = ShippingAddressType = __decorate([
    (0, graphql_1.ObjectType)()
], ShippingAddressType);
let OrderFulfillmentType = class OrderFulfillmentType {
    constructor() {
        this.id = '';
        this.orderId = '';
        this.status = fulfillment_status_enum_1.FulfillmentStatus.UNFULFILLED;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.OrderFulfillmentType = OrderFulfillmentType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "trackingNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "trackingUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFulfillmentType.prototype, "carrierName", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderFulfillmentType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderFulfillmentType.prototype, "updatedAt", void 0);
exports.OrderFulfillmentType = OrderFulfillmentType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderFulfillmentType);
let OrderItemType = class OrderItemType {
    constructor() {
        this.id = '';
        this.orderId = '';
        this.productId = '';
        this.quantity = 1;
        this.price = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.OrderItemType = OrderItemType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemType.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemType.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderItemType.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderItemType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], OrderItemType.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], OrderItemType.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderItemType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderItemType.prototype, "updatedAt", void 0);
exports.OrderItemType = OrderItemType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderItemType);
let PlatformActionsType = class PlatformActionsType {
    constructor() {
        this.canCancel = false;
        this.canRefund = false;
        this.canModify = false;
    }
};
exports.PlatformActionsType = PlatformActionsType;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PlatformActionsType.prototype, "canCancel", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PlatformActionsType.prototype, "canRefund", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PlatformActionsType.prototype, "canModify", void 0);
exports.PlatformActionsType = PlatformActionsType = __decorate([
    (0, graphql_1.ObjectType)()
], PlatformActionsType);
let OrderType = class OrderType {
    constructor() {
        this.id = '';
        this.userId = '';
        this.status = order_status_enum_1.OrderStatus.PENDING;
        this.paymentStatus = payment_status_enum_1.PaymentStatus.PENDING;
        this.shippingAddress = new ShippingAddressType();
        this.items = [];
        this.isPriority = false;
        this.platformActions = {
            canCancel: false,
            canRefund: false,
            canModify: false,
        };
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
exports.OrderType = OrderType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], OrderType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], OrderType.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShippingAddressType),
    __metadata("design:type", ShippingAddressType)
], OrderType.prototype, "shippingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderItemType]),
    __metadata("design:type", Array)
], OrderType.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderFulfillmentType], { nullable: true }),
    __metadata("design:type", Array)
], OrderType.prototype, "fulfillments", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], OrderType.prototype, "isPriority", void 0);
__decorate([
    (0, graphql_1.Field)(() => PlatformActionsType),
    __metadata("design:type", PlatformActionsType)
], OrderType.prototype, "platformActions", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OrderType.prototype, "updatedAt", void 0);
exports.OrderType = OrderType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderType);
let PaginatedOrdersType = class PaginatedOrdersType {
    constructor() {
        this.items = [];
        this.total = 0;
        this.page = 1;
        this.limit = 10;
        this.totalPages = 0;
    }
};
exports.PaginatedOrdersType = PaginatedOrdersType;
__decorate([
    (0, graphql_1.Field)(() => [OrderType]),
    __metadata("design:type", Array)
], PaginatedOrdersType.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedOrdersType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedOrdersType.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedOrdersType.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedOrdersType.prototype, "totalPages", void 0);
exports.PaginatedOrdersType = PaginatedOrdersType = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedOrdersType);
//# sourceMappingURL=order.types.js.map