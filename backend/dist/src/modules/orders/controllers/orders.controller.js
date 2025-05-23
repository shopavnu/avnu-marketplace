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
var OrdersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("../services/orders.service");
const create_order_dto_1 = require("../dto/create-order.dto");
const update_order_dto_1 = require("../dto/update-order.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const enums_1 = require("../enums");
const pagination_dto_js_1 = require("../../../common/dto/pagination.dto.js");
let OrdersController = OrdersController_1 = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(OrdersController_1.name);
    }
    async create(createOrderDto) {
        try {
            return await this.ordersService.create(createOrderDto);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAll(paginationDto) {
        const orders = await this.ordersService.findAll({});
        const page = paginationDto.page || 1;
        const limit = paginationDto.limit || 10;
        const skip = (page - 1) * limit;
        const paginatedOrders = orders.slice(skip, skip + limit);
        return {
            data: paginatedOrders,
            meta: {
                total: orders.length,
                page,
                limit,
                pages: Math.ceil(orders.length / limit),
            },
        };
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
    async findByCustomer(customerId, paginationDto) {
        const orders = await this.ordersService.findAll({ customerId });
        const page = paginationDto.page || 1;
        const limit = paginationDto.limit || 10;
        const skip = (page - 1) * limit;
        const paginatedOrders = orders.slice(skip, skip + limit);
        return {
            data: paginatedOrders,
            meta: {
                total: orders.length,
                page,
                limit,
                pages: Math.ceil(orders.length / limit),
            },
        };
    }
    async findByMerchant(merchantId, paginationDto) {
        const orders = await this.ordersService.findAll({ merchantId });
        const page = paginationDto.page || 1;
        const limit = paginationDto.limit || 10;
        const skip = (page - 1) * limit;
        const paginatedOrders = orders.slice(skip, skip + limit);
        return {
            data: paginatedOrders,
            meta: {
                total: orders.length,
                page,
                limit,
                pages: Math.ceil(orders.length / limit),
            },
        };
    }
    async update(id, updateOrderDto) {
        try {
            return await this.ordersService.update(id, updateOrderDto);
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
    async updateFulfillmentStatus(id, fulfillmentStatus) {
        try {
            return await this.ordersService.update(id, { fulfillmentStatus });
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
            const _order = await this.ordersService.findOne(id);
            if (reason) {
                await this.ordersService.addNote(id, `Cancellation reason: ${reason}`);
            }
            return await this.ordersService.updateStatus(id, enums_1.OrderStatus.CANCELLED);
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
            const _order = await this.ordersService.findOne(id);
            const refundNote = `Refund processed: ${amount ? `$${amount}` : 'Full amount'}. ${reason ? `Reason: ${reason}` : ''}`;
            await this.ordersService.addNote(id, refundNote);
            await this.ordersService.updatePaymentStatus(id, enums_1.PaymentStatus.REFUNDED);
            const updateData = {
                refundedAt: new Date(),
            };
            return await this.ordersService.update(id, updateData);
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
            const _order = await this.ordersService.findOne(id);
            await this.ordersService.updateSyncStatus(id, enums_1.SyncStatus.PENDING);
            this.logger.log(`Manual sync requested for order ${id}`);
            return await this.ordersService.updateSyncStatus(id, enums_1.SyncStatus.SYNCED);
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to remove order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Order created successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid order data' }),
    (0, swagger_1.ApiBody)({ type: create_order_dto_1.CreateOrderDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders with pagination' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Orders retrieved successfully' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_js_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific order by ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders for a specific customer' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Customer orders retrieved successfully' }),
    (0, swagger_1.ApiParam)({ name: 'customerId', description: 'Customer ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_js_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findByCustomer", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders for a specific merchant' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Merchant orders retrieved successfully' }),
    (0, swagger_1.ApiParam)({ name: 'merchantId', description: 'Merchant ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_js_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findByMerchant", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid update data' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiBody)({ type: update_order_dto_1.UpdateOrderDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update payment status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Payment status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid payment status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paymentStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Patch)(':id/fulfillment-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fulfillment status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Fulfillment status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid fulfillment status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('fulfillmentStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateFulfillmentStatus", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Order cannot be cancelled' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refund an order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order refunded successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Order cannot be refunded' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "refundOrder", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync order with external platform' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Order synced successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Sync failed' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "syncWithPlatform", null);
__decorate([
    (0, common_1.Patch)(':id/sync-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order sync status' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Sync status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid sync status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('syncStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateSyncStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove an order (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'Order removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = OrdersController_1 = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map