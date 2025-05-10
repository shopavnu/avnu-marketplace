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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const enums_1 = require("../enums");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(orderRepository, orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async create(createOrderDto) {
        try {
            if (!createOrderDto) {
                throw new common_1.BadRequestException('Order data is required');
            }
            this.logger.debug('Creating new order', { userId: createOrderDto.userId });
            if (!createOrderDto.userId) {
                throw new common_1.BadRequestException('User ID is required for order creation');
            }
            const order = this.orderRepository.create({
                ...createOrderDto,
                items: createOrderDto.items?.map(item => this.orderItemRepository.create(item)) || [],
                status: enums_1.OrderStatus.PENDING,
                syncStatus: enums_1.SyncStatus.PENDING,
                paymentStatus: enums_1.PaymentStatus.PENDING,
            });
            const savedOrder = await this.orderRepository.save(order);
            this.logger.log(`Created new order with ID: ${savedOrder.id}`);
            return savedOrder;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Failed to create order:', error instanceof Error ? error.stack : undefined);
            throw new common_1.BadRequestException(`Failed to create order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAll(filters) {
        try {
            const where = {};
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        where[key] = value;
                    }
                });
            }
            const orders = await this.orderRepository.find({
                where,
                order: {
                    createdAt: 'DESC',
                },
            });
            this.logger.log(`Found ${orders.length} orders matching filters`);
            return orders;
        }
        catch (error) {
            this.logger.error(`Failed to find orders: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findByUserId(userId) {
        try {
            return this.findAll({ userId });
        }
        catch (error) {
            this.logger.error(`Failed to find orders for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findByStatus(status) {
        try {
            return this.findAll({ status });
        }
        catch (error) {
            this.logger.error(`Failed to find orders with status ${status}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findPendingSync() {
        try {
            return this.findAll({ syncStatus: enums_1.SyncStatus.PENDING });
        }
        catch (error) {
            this.logger.error(`Failed to find orders pending sync: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async findOne(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            this.logger.debug(`Finding order by ID: ${id}`);
            const order = await this.orderRepository.findOneBy({ id });
            if (!order) {
                this.logger.warn(`Order with ID ${id} not found`);
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            return order;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to find order ${id}:`, error instanceof Error ? error.stack : undefined);
            throw new common_1.NotFoundException(`Error finding order with ID ${id}`);
        }
    }
    async update(id, updateOrderDto) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            if (!updateOrderDto) {
                throw new common_1.BadRequestException('Update data is required');
            }
            this.logger.debug(`Updating order ${id}`);
            const order = await this.findOne(id);
            const safeUpdateData = { ...updateOrderDto };
            Object.assign(order, safeUpdateData);
            const extendedDto = updateOrderDto;
            if (extendedDto.items && Array.isArray(extendedDto.items)) {
                this.logger.debug(`Updating items for order ${id}`);
                if (extendedDto.replaceAllItems === true) {
                    this.logger.debug(`Replacing all items for order ${id}`);
                    try {
                        await this.orderItemRepository.delete({ orderId: id });
                    }
                    catch (deleteError) {
                        this.logger.error(`Error deleting existing items for order ${id}:`, deleteError instanceof Error ? deleteError.stack : undefined);
                        throw new common_1.BadRequestException(`Failed to delete existing order items: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
                    }
                    order.items = extendedDto.items.map((item) => this.orderItemRepository.create({
                        ...item,
                        orderId: id,
                    }));
                }
                else {
                    this.logger.debug(`Updating specific items for order ${id}`);
                    const existingItemIds = order.items.map(item => item.id);
                    const updateItemIds = extendedDto.items
                        .filter((item) => item.id !== undefined && item.id !== null)
                        .map((item) => item.id);
                    for (const updatedItem of extendedDto.items.filter((item) => item.id)) {
                        const existingItemIndex = order.items.findIndex(item => item.id === updatedItem.id);
                        const existingItem = order.items[existingItemIndex];
                        if (existingItemIndex >= 0 && existingItem) {
                            Object.assign(existingItem, updatedItem);
                        }
                    }
                    const newItems = extendedDto.items
                        .filter((item) => !item.id)
                        .map((item) => this.orderItemRepository.create({
                        ...item,
                        orderId: id,
                    }));
                    order.items = [
                        ...order.items.filter(item => updateItemIds.includes(item.id)),
                        ...newItems,
                    ];
                    const removedItemIds = existingItemIds.filter(itemId => !updateItemIds.includes(itemId));
                    if (removedItemIds.length > 0) {
                        try {
                            await this.orderItemRepository.delete({ id: (0, typeorm_2.In)(removedItemIds) });
                            this.logger.debug(`Removed ${removedItemIds.length} items from order ${id}`);
                        }
                        catch (deleteError) {
                            this.logger.error(`Error deleting removed items for order ${id}:`, deleteError instanceof Error ? deleteError.stack : undefined);
                        }
                    }
                }
            }
            try {
                const updatedOrder = await this.orderRepository.save(order);
                this.logger.log(`Successfully updated order ${id}`);
                return updatedOrder;
            }
            catch (saveError) {
                this.logger.error(`Error saving updated order ${id}:`, saveError instanceof Error ? saveError.stack : undefined);
                throw new common_1.BadRequestException(`Failed to save updated order: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to update order ${id}:`, error instanceof Error ? error.stack : undefined);
            throw new common_1.BadRequestException(`Failed to update order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updateStatus(id, status) {
        try {
            const order = await this.findOne(id);
            order.status = status;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Updated order ${id} status to ${status}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to update order ${id} status: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async updatePaymentStatus(id, paymentStatus) {
        try {
            const order = await this.findOne(id);
            order.paymentStatus = paymentStatus;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Updated order ${id} payment status to ${paymentStatus}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to update order ${id} payment status: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async updateSyncStatus(id, syncStatus) {
        try {
            const order = await this.findOne(id);
            order.syncStatus = syncStatus;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Updated order ${id} sync status to ${syncStatus}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to update order ${id} sync status: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async addNote(id, note) {
        try {
            const order = await this.findOne(id);
            order.notes = order.notes
                ? `${order.notes}\n\n${new Date().toISOString()}: ${note}`
                : `${new Date().toISOString()}: ${note}`;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Added note to order ${id}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to add note to order ${id}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async updatePriority(id, isPriority) {
        try {
            const order = await this.findOne(id);
            order.isPriority = isPriority;
            const updatedOrder = await this.orderRepository.save(order);
            this.logger.log(`Updated order ${id} priority to ${isPriority}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error(`Failed to update order ${id} priority: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            this.logger.debug(`Attempting to soft delete order ${id}`);
            await this.findOne(id);
            try {
                await this.orderRepository.softDelete(id);
                this.logger.log(`Order ${id} has been soft deleted`);
            }
            catch (deleteError) {
                this.logger.error(`Error soft deleting order ${id}:`, deleteError instanceof Error ? deleteError.stack : undefined);
                throw new common_1.BadRequestException(`Failed to soft delete order: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to remove order ${id}:`, error instanceof Error ? error.stack : undefined);
            throw new common_1.BadRequestException(`Failed to remove order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async hardDelete(id) {
        try {
            if (!id) {
                throw new common_1.BadRequestException('Order ID is required');
            }
            this.logger.debug(`Attempting to permanently delete order ${id}`);
            await this.findOne(id);
            try {
                const result = await this.orderRepository.delete(id);
                if (result.affected === 0) {
                    throw new common_1.BadRequestException(`Failed to delete order with ID ${id}`);
                }
                this.logger.log(`Order ${id} has been permanently deleted`);
            }
            catch (deleteError) {
                this.logger.error(`Error permanently deleting order ${id}:`, deleteError instanceof Error ? deleteError.stack : undefined);
                throw new common_1.BadRequestException(`Failed to permanently delete order: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to permanently delete order ${id}:`, error instanceof Error ? error.stack : undefined);
            throw new common_1.BadRequestException(`Failed to permanently delete order: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map