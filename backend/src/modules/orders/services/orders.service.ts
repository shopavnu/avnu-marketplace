// @ts-strict-mode: enabled
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus, SyncStatus, PaymentStatus } from '../enums';

/**
 * Service for managing orders
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  /**
   * Create a new order
   * @param createOrderDto Order creation data
   * @returns Created order
   * @throws BadRequestException if creation data is invalid or missing
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Validate input
      if (!createOrderDto) {
        throw new BadRequestException('Order data is required');
      }

      this.logger.debug('Creating new order', { userId: createOrderDto.userId });

      // Validate required fields
      if (!createOrderDto.userId) {
        throw new BadRequestException('User ID is required for order creation');
      }

      // Create a new order entity with proper typing
      const order = this.orderRepository.create({
        ...createOrderDto,
        // Map order items with proper repository handling
        items: createOrderDto.items?.map(item => this.orderItemRepository.create(item)) || [],
        // Set default values for new orders (these aren't in the DTO)
        status: OrderStatus.PENDING,
        syncStatus: SyncStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      });

      // Save the order to the database
      const savedOrder = await this.orderRepository.save(order);

      this.logger.log(`Created new order with ID: ${savedOrder.id}`);

      return savedOrder;
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors with proper stack trace
      this.logger.error(
        'Failed to create order:',
        error instanceof Error ? error.stack : undefined,
      );

      throw new BadRequestException(
        `Failed to create order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find all orders with optional filtering
   * @param filters Optional filters for querying orders
   * @returns Array of order entities
   */
  async findAll(filters?: Partial<Order>): Promise<Order[]> {
    try {
      // Build the query conditions
      const where: FindOptionsWhere<Order> = {};

      if (filters) {
        // Apply each provided filter to the where conditions
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Use type assertion to avoid TypeScript error with string indexing
            (where as Record<string, any>)[key] = value;
          }
        });
      }

      // Execute the query with the built conditions
      const orders = await this.orderRepository.find({
        where,
        order: {
          createdAt: 'DESC',
        },
      });

      this.logger.log(`Found ${orders.length} orders matching filters`);

      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to find orders: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find orders by user ID
   * @param userId User ID
   * @returns Array of order entities
   */
  async findByUserId(userId: string): Promise<Order[]> {
    try {
      return this.findAll({ userId });
    } catch (error) {
      this.logger.error(
        `Failed to find orders for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find orders by status
   * @param status Order status
   * @returns Array of order entities
   */
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return this.findAll({ status });
    } catch (error) {
      this.logger.error(
        `Failed to find orders with status ${status}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find orders needing synchronization
   * @returns Array of order entities with pending sync status
   */
  async findPendingSync(): Promise<Order[]> {
    try {
      return this.findAll({ syncStatus: SyncStatus.PENDING });
    } catch (error) {
      this.logger.error(
        `Failed to find orders pending sync: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find a single order by ID
   * @param id Order ID
   * @returns Order entity
   * @throws BadRequestException if ID is missing or invalid
   * @throws NotFoundException if order is not found
   */
  async findOne(id: string): Promise<Order> {
    try {
      // Validate input
      if (!id) {
        throw new BadRequestException('Order ID is required');
      }

      this.logger.debug(`Finding order by ID: ${id}`);

      // Use findOneBy for better type safety and performance
      const order = await this.orderRepository.findOneBy({ id });

      if (!order) {
        this.logger.warn(`Order with ID ${id} not found`);
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to find order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new NotFoundException(`Error finding order with ID ${id}`);
    }
  }

  /**
   * Update an order
   * @param id Order ID
   * @param updateOrderDto Order update data
   * @returns Updated order
   * @throws BadRequestException if input is invalid
   * @throws NotFoundException if order is not found
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    try {
      // Validate input parameters
      if (!id) {
        throw new BadRequestException('Order ID is required');
      }

      if (!updateOrderDto) {
        throw new BadRequestException('Update data is required');
      }

      this.logger.debug(`Updating order ${id}`);

      // Find the existing order (will throw NotFoundException if not found)
      const order = await this.findOne(id);

      // Create a clean copy of the update data to avoid unintended property changes
      const safeUpdateData: Partial<Order> = { ...updateOrderDto };

      // Merge the validated update data with the existing order
      Object.assign(order, safeUpdateData);

      // Handle item updates if provided using type assertion for extended properties
      // TypeScript doesn't know about these properties, but we handle them safely
      // Define an interface for update DTOs that may include items and replaceAllItems
      interface UpdateOrderItemsDto extends UpdateOrderDto {
        items?: Partial<OrderItem>[];
        replaceAllItems?: boolean;
      }
      const extendedDto = updateOrderDto as UpdateOrderItemsDto;

      if (extendedDto.items && Array.isArray(extendedDto.items)) {
        this.logger.debug(`Updating items for order ${id}`);

        // If we're replacing all items, start with a clean slate
        if (extendedDto.replaceAllItems === true) {
          this.logger.debug(`Replacing all items for order ${id}`);

          // First remove existing items (with error handling)
          try {
            await this.orderItemRepository.delete({ orderId: id });
          } catch (deleteError: unknown) {
            this.logger.error(
              `Error deleting existing items for order ${id}:`,
              deleteError instanceof Error ? deleteError.stack : undefined,
            );
            throw new BadRequestException(
              `Failed to delete existing order items: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`,
            );
          }

          // Then set the new items with proper typing
          order.items = extendedDto.items.map((item: Partial<OrderItem>) =>
            this.orderItemRepository.create({
              ...item,
              orderId: id,
            }),
          );
        }
        // Otherwise, update existing items and add new ones
        else {
          this.logger.debug(`Updating specific items for order ${id}`);

          // Ensure we have valid arrays to work with
          const existingItemIds = order.items.map(item => item.id);
          const updateItemIds = extendedDto.items
            .filter((item: Partial<OrderItem>) => item.id !== undefined && item.id !== null)
            .map((item: Partial<OrderItem>) => item.id as string);

          // Update existing items with improved type safety
          for (const updatedItem of extendedDto.items.filter(
            (item: Partial<OrderItem>) => item.id,
          )) {
            const existingItemIndex = order.items.findIndex(item => item.id === updatedItem.id);
            const existingItem = order.items[existingItemIndex];
            if (existingItemIndex >= 0 && existingItem) {
              // Use a properly typed merge to avoid unexpected behaviors
              Object.assign(existingItem, updatedItem);
            }
          }

          // Add new items with proper typing
          const newItems = extendedDto.items
            .filter((item: Partial<OrderItem>) => !item.id)
            .map((item: Partial<OrderItem>) =>
              this.orderItemRepository.create({
                ...item,
                orderId: id,
              }),
            );

          // Combine existing (that weren't removed) and new items
          order.items = [
            ...order.items.filter(item => updateItemIds.includes(item.id)),
            ...newItems,
          ];

          // Delete items that were removed in the update
          const removedItemIds = existingItemIds.filter(itemId => !updateItemIds.includes(itemId));
          if (removedItemIds.length > 0) {
            try {
              await this.orderItemRepository.delete({ id: In(removedItemIds) });
              this.logger.debug(`Removed ${removedItemIds.length} items from order ${id}`);
            } catch (deleteError: unknown) {
              this.logger.error(
                `Error deleting removed items for order ${id}:`,
                deleteError instanceof Error ? deleteError.stack : undefined,
              );
              // Continue with the update despite the deletion error
              // We'll log it but not fail the entire update operation
            }
          }
        }
      }

      // Save the updated order with error handling
      try {
        const updatedOrder = await this.orderRepository.save(order);
        this.logger.log(`Successfully updated order ${id}`);
        return updatedOrder;
      } catch (saveError: unknown) {
        this.logger.error(
          `Error saving updated order ${id}:`,
          saveError instanceof Error ? saveError.stack : undefined,
        );
        throw new BadRequestException(
          `Failed to save updated order: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
        );
      }
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Generic error handling with improved logging
      this.logger.error(
        `Failed to update order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new BadRequestException(
        `Failed to update order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Update order status
   * @param id Order ID
   * @param status New order status
   * @returns Updated order
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.findOne(id);

      order.status = status;
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Updated order ${id} status to ${status}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id} status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update payment status
   * @param id Order ID
   * @param paymentStatus New payment status
   * @returns Updated order
   */
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const order = await this.findOne(id);

      order.paymentStatus = paymentStatus;
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Updated order ${id} payment status to ${paymentStatus}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id} payment status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update synchronization status
   * @param id Order ID
   * @param syncStatus New sync status
   * @returns Updated order
   */
  async updateSyncStatus(id: string, syncStatus: SyncStatus): Promise<Order> {
    try {
      const order = await this.findOne(id);

      order.syncStatus = syncStatus;
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Updated order ${id} sync status to ${syncStatus}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id} sync status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Add a note to an order
   * @param id Order ID
   * @param note Note text
   * @returns Updated order
   */
  async addNote(id: string, note: string): Promise<Order> {
    try {
      const order = await this.findOne(id);

      // Append the new note or set it if no existing notes
      order.notes = order.notes
        ? `${order.notes}\n\n${new Date().toISOString()}: ${note}`
        : `${new Date().toISOString()}: ${note}`;

      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Added note to order ${id}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to add note to order ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update order priority
   * @param id Order ID
   * @param isPriority Whether the order is a priority
   * @returns Updated order
   */
  async updatePriority(id: string, isPriority: boolean): Promise<Order> {
    try {
      const order = await this.findOne(id);

      order.isPriority = isPriority;
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Updated order ${id} priority to ${isPriority}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id} priority: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Remove an order (soft delete)
   * @param id Order ID
   * @returns void
   * @throws BadRequestException if ID is missing or invalid
   * @throws NotFoundException if order is not found
   */
  async remove(id: string): Promise<void> {
    try {
      // Validate input
      if (!id) {
        throw new BadRequestException('Order ID is required');
      }

      this.logger.debug(`Attempting to soft delete order ${id}`);

      // Check if the order exists first (will throw NotFoundException if not found)
      await this.findOne(id);

      // Soft delete implementation with error handling
      try {
        await this.orderRepository.softDelete(id);
        this.logger.log(`Order ${id} has been soft deleted`);
      } catch (deleteError: unknown) {
        this.logger.error(
          `Error soft deleting order ${id}:`,
          deleteError instanceof Error ? deleteError.stack : undefined,
        );
        throw new BadRequestException(
          `Failed to soft delete order: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`,
        );
      }
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to remove order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to remove order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Permanently delete an order
   * @param id Order ID
   * @returns void
   * @throws BadRequestException if ID is missing or invalid or deletion fails
   * @throws NotFoundException if order is not found
   */
  async hardDelete(id: string): Promise<void> {
    try {
      // Validate input
      if (!id) {
        throw new BadRequestException('Order ID is required');
      }

      this.logger.debug(`Attempting to permanently delete order ${id}`);

      // Check if the order exists first (will throw NotFoundException if not found)
      await this.findOne(id);

      // Hard delete implementation with error handling
      try {
        const result = await this.orderRepository.delete(id);

        // Verify the deletion was successful
        if (result.affected === 0) {
          throw new BadRequestException(`Failed to delete order with ID ${id}`);
        }

        this.logger.log(`Order ${id} has been permanently deleted`);
      } catch (deleteError: unknown) {
        this.logger.error(
          `Error permanently deleting order ${id}:`,
          deleteError instanceof Error ? deleteError.stack : undefined,
        );
        throw new BadRequestException(
          `Failed to permanently delete order: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`,
        );
      }
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to permanently delete order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to permanently delete order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
