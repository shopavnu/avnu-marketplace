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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../services/orders.service");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const order_types_1 = require("../dto/order.types");
const order_inputs_1 = require("../dto/order.inputs");
const enums_1 = require("../enums");
const _paginationToFilters = (pagination) => {
    if (!pagination)
        return {};
    return {
        _page: pagination.page || 1,
        _limit: pagination.limit || 10,
    };
};
let OrdersResolver = class OrdersResolver {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async findAll(pagination) {
        try {
            const orders = await this.ordersService.findAll({});
            if (pagination) {
                const page = pagination.page || 1;
                const limit = pagination.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                return {
                    items: orders.slice(startIndex, endIndex),
                    total: orders.length,
                    page: page,
                    pageSize: limit,
                };
            }
            return {
                items: orders,
                total: orders.length,
                page: 1,
                pageSize: orders.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to retrieve orders: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findOne(id) {
        try {
            return await this.ordersService.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
    }
    async findByCustomer(customerId, pagination) {
        try {
            const orders = await this.ordersService.findByCustomer(customerId);
            if (pagination) {
                const page = pagination.page || 1;
                const limit = pagination.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                return {
                    items: orders.slice(startIndex, endIndex),
                    total: orders.length,
                    page: page,
                    pageSize: limit,
                };
            }
            return {
                items: orders,
                total: orders.length,
                page: 1,
                pageSize: orders.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to retrieve customer orders: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findByMerchant(merchantId, pagination) {
        try {
            const orders = await this.ordersService.findByMerchant(merchantId);
            if (pagination) {
                const page = pagination.page || 1;
                const limit = pagination.limit || 10;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                return {
                    items: orders.slice(startIndex, endIndex),
                    total: orders.length,
                    page: page,
                    pageSize: limit,
                };
            }
            return {
                items: orders,
                total: orders.length,
                page: 1,
                pageSize: orders.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to retrieve merchant orders: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async create(createOrderInput) {
        try {
            const orderDto = {
                userId: createOrderInput.userId,
                items: createOrderInput.items,
                shippingAddress: createOrderInput.shippingAddress,
                notes: createOrderInput.notes,
                isPriority: createOrderInput.isPriority,
            };
            return await this.ordersService.create(orderDto);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async update(id, updateOrderInput) {
        try {
            return await this.ordersService.update(id, updateOrderInput);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updateStatus(id, status) {
        try {
            return await this.ordersService.updateStatus(id, status);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update order status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updatePaymentStatus(id, paymentStatus) {
        try {
            return await this.ordersService.updatePaymentStatus(id, paymentStatus);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update payment status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updateFulfillmentStatus(id, status) {
        try {
            return await this.ordersService.updateFulfillmentStatus(id, status.toString());
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update fulfillment status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async cancelOrder(id, reason) {
        try {
            return await this.ordersService.cancelOrder(id, reason);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to cancel order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async refundOrder(id, amount, reason) {
        try {
            return await this.ordersService.refundOrder(id, amount, reason);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to refund order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async syncWithPlatform(id) {
        try {
            return await this.ordersService.syncWithPlatform(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to sync order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updateSyncStatus(id, syncStatus) {
        try {
            return await this.ordersService.updateSyncStatus(id, syncStatus);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update sync status: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async remove(id) {
        try {
            await this.ordersService.remove(id);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to remove order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.OrdersResolver = OrdersResolver;
__decorate([
    (0, graphql_1.Query)(() => order_types_1.PaginatedOrdersType, { name: 'orders' }),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_inputs_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => order_types_1.OrderType, { name: 'order' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => order_types_1.PaginatedOrdersType, { name: 'customerOrders' }),
    __param(0, (0, graphql_1.Args)('customerId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_inputs_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "findByCustomer", null);
__decorate([
    (0, graphql_1.Query)(() => order_types_1.PaginatedOrdersType, { name: 'merchantOrders' }),
    __param(0, (0, graphql_1.Args)('merchantId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_inputs_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "findByMerchant", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'createOrder' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_inputs_1.CreateOrderInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "create", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'updateOrder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_inputs_1.UpdateOrderInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "update", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'updateOrderStatus' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updateStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'updatePaymentStatus' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('paymentStatus', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updatePaymentStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'updateOrderFulfillmentStatus' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updateFulfillmentStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'cancelOrder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('reason', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "cancelOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'refundOrder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('amount', { type: () => graphql_1.Int, nullable: true })),
    __param(2, (0, graphql_1.Args)('reason', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "refundOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'syncOrder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "syncWithPlatform", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_types_1.OrderType, { name: 'updateOrderSyncStatus' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('syncStatus', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updateSyncStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'removeOrder' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "remove", null);
exports.OrdersResolver = OrdersResolver = __decorate([
    (0, graphql_1.Resolver)(() => order_types_1.OrderType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersResolver);
//# sourceMappingURL=orders.resolver.js.map