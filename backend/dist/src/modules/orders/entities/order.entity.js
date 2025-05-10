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
exports.Order = exports.PlatformActions = exports.ShippingAddress = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const order_item_entity_1 = require("./order-item.entity");
const order_fulfillment_entity_1 = require("./order-fulfillment.entity");
const enums_1 = require("../enums");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ShippingAddress {
    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.addressLine1 = '';
        this.city = '';
        this.state = '';
        this.postalCode = '';
        this.country = '';
    }
}
exports.ShippingAddress = ShippingAddress;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "addressLine1", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "addressLine2", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShippingAddress.prototype, "email", void 0);
class PlatformActions {
    constructor() {
        this.canCancel = false;
        this.canRefund = false;
        this.canFulfill = false;
    }
}
exports.PlatformActions = PlatformActions;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlatformActions.prototype, "canCancel", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlatformActions.prototype, "canRefund", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlatformActions.prototype, "canFulfill", void 0);
let Order = class Order {
    constructor() {
        this.id = '';
        this.userId = '';
        this.status = enums_1.OrderStatus.PENDING;
        this.paymentStatus = enums_1.PaymentStatus.PENDING;
        this.shippingAddress = new ShippingAddress();
        this.items = [];
        this.isPriority = false;
        this.syncStatus = enums_1.SyncStatus.PENDING;
        this.customerEmail = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    get canCancel() {
        return this.platformActions?.canCancel ?? false;
    }
    get canRefund() {
        return this.platformActions?.canRefund ?? false;
    }
    get canFulfill() {
        return this.platformActions?.canFulfill ?? false;
    }
};
exports.Order = Order;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique order identifier' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'User ID who placed the order' }),
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Order.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Current order status' }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.OrderStatus,
        default: enums_1.OrderStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsEnum)(enums_1.OrderStatus),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Current payment status' }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.PaymentStatus,
        default: enums_1.PaymentStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsEnum)(enums_1.PaymentStatus),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Shipping address for the order' }),
    (0, typeorm_1.Column)('json'),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingAddress),
    __metadata("design:type", ShippingAddress)
], Order.prototype, "shippingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => [order_item_entity_1.OrderItem], { description: 'Items included in this order' }),
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, item => item.order, {
        cascade: true,
        eager: true,
    }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => order_item_entity_1.OrderItem),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => [order_fulfillment_entity_1.OrderFulfillment], {
        nullable: true,
        description: 'Fulfillment records for this order',
    }),
    (0, typeorm_1.OneToMany)(() => order_fulfillment_entity_1.OrderFulfillment, fulfillment => fulfillment.order, {
        cascade: true,
        eager: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => order_fulfillment_entity_1.OrderFulfillment),
    __metadata("design:type", Array)
], Order.prototype, "fulfillments", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Additional notes about the order' }),
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { description: 'Whether this order is prioritized' }),
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Order.prototype, "isPriority", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Current synchronization status' }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.SyncStatus,
        default: enums_1.SyncStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsEnum)(enums_1.SyncStatus),
    __metadata("design:type", String)
], Order.prototype, "syncStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Available platform actions for this order' }),
    (0, typeorm_1.Column)('json', {
        nullable: true,
        default: '{"canCancel": false, "canRefund": false, "canFulfill": false}',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PlatformActions),
    __metadata("design:type", PlatformActions)
], Order.prototype, "platformActions", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Email address of the customer' }),
    (0, typeorm_1.Column)({ length: 255 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], Order.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { description: 'When the order was created' }),
    (0, typeorm_1.CreateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { description: 'When the order was last updated' }),
    (0, typeorm_1.UpdateDateColumn)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true, description: 'When the order was deleted' }),
    (0, typeorm_1.DeleteDateColumn)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Order.prototype, "deletedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { description: 'Whether this order can be cancelled' }),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Order.prototype, "canCancel", null);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { description: 'Whether this order can be refunded' }),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Order.prototype, "canRefund", null);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { description: 'Whether this order can be fulfilled' }),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [])
], Order.prototype, "canFulfill", null);
exports.Order = Order = __decorate([
    (0, graphql_1.ObjectType)('Order'),
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map