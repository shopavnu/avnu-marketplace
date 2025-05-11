// @ts-strict-mode: enabled
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus, SyncStatus, PaymentStatus } from '../enums';
import { PlatformActions } from '../entities/order.entity';

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
   * Find orders by customer ID
   * @param customerId Customer ID
   * @param pagination Optional pagination parameters
   * @returns Array of order entities
   */
  async findByCustomer(customerId: string, pagination?: any): Promise<Order[]> {
    try {
      this.logger.debug(`Finding orders for customer ${customerId}`);

      // In a real implementation, you would have a customerId field in the order entity
      // For now, we'll assume customerId might map to userId or another field
      const orders = await this.findAll({ userId: customerId });

      // Apply basic pagination if provided
      if (pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;

        return orders.slice(start, end);
      }

      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to find orders for customer ${customerId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find orders by merchant ID
   * @param merchantId Merchant ID
   * @param pagination Optional pagination parameters
   * @returns Array of order entities
   */
  async findByMerchant(merchantId: string, pagination?: any): Promise<Order[]> {
    try {
      this.logger.debug(`Finding orders for merchant ${merchantId}`);

      // First, get all product IDs associated with this merchant from the products service
      // Since we don't have direct access to the products repository here, we'll use a query builder
      // to find orders that have items with products belonging to this merchant

      // Create a query to find all orders that contain at least one item with a product from this merchant
      const ordersQuery = this.orderRepository
        .createQueryBuilder('order')
        // Join with order items
        .innerJoin('order.items', 'orderItem')
        // Add condition for soft-deleted items
        .where('order.deletedAt IS NULL')
        // We need to join with the products table to get merchant information
        // Using a subquery to check if any product ID in the order's items belongs to the merchant
        .andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .select('product.id')
            .from('products', 'product')
            .where('product.merchantId = :merchantId')
            .getQuery();

          return `orderItem.productId IN ${subQuery}`;
        })
        .setParameter('merchantId', merchantId)
        // Return distinct orders (an order might have multiple items from the same merchant)
        .distinct(true);

      // Get the total count (for pagination info)
      const totalCount = await ordersQuery.getCount();

      this.logger.debug(`Found ${totalCount} orders associated with merchant ${merchantId}`);

      // Apply pagination if provided
      if (pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const skip = (page - 1) * limit;

        ordersQuery.skip(skip).take(limit);
      }

      // Order by most recent first
      ordersQuery.orderBy('order.createdAt', 'DESC');

      // Execute the query
      const orders = await ordersQuery.getMany();

      // Ensure the items are eagerly loaded
      for (const order of orders) {
        // Manually load the order items if they aren't already
        if (!order.items || order.items.length === 0) {
          const items = await this.orderRepository.manager
            .getRepository('order_items')
            .createQueryBuilder('orderItem')
            .where('orderItem.orderId = :orderId', { orderId: order.id })
            .getMany();

          // Explicitly type the items as OrderItem[] to satisfy TypeScript
          order.items = items as unknown as OrderItem[];
        }

        // Add a flag to indicate this order contains items from the specified merchant
        // This could be useful for the UI to highlight which items in an order are from this merchant
        (order as any).hasMerchantItems = true;
      }

      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to find orders for merchant ${merchantId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
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
   * Update fulfillment status
   * @param id Order ID
   * @param fulfillmentStatus New fulfillment status
   * @returns Updated order
   */
  async updateFulfillmentStatus(id: string, fulfillmentStatus: string): Promise<Order> {
    try {
      const order = await this.findOne(id);

      // Update the order with the fulfillment status
      // This may involve creating a new OrderFulfillment entity
      // But for now, we'll just add it as a note
      const notes = order.notes || '';
      order.notes = `${notes}\nFulfillment status updated to: ${fulfillmentStatus} on ${new Date().toISOString()}`;

      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Updated order ${id} fulfillment status to ${fulfillmentStatus}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order ${id} fulfillment status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Cancel an order
   * @param id Order ID
   * @param reason Optional cancellation reason
   * @returns The cancelled order
   */
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    try {
      // Find the order first (will throw NotFoundException if not found)
      const order = await this.findOne(id);

      // Check if the order can be cancelled
      if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          `Order ${id} cannot be cancelled - current status: ${order.status}`,
        );
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;

      // Add cancellation reason as a note if provided
      if (reason) {
        const notes = order.notes || '';
        order.notes = `${notes}\nCancellation reason: ${reason}`;
      }

      // Save the updated order
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(`Order ${id} has been cancelled${reason ? ` - Reason: ${reason}` : ''}`);

      return updatedOrder;
    } catch (error) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to cancel order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to cancel order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Process a refund for an order
   * @param id Order ID
   * @param amount Optional refund amount (full refund if not specified)
   * @param reason Optional refund reason
   * @returns The refunded order
   */
  async refundOrder(id: string, amount?: number, reason?: string): Promise<Order> {
    try {
      // Find the order first (will throw NotFoundException if not found)
      const order = await this.findOne(id);

      // Check if the order can be refunded
      if (
        order.status === OrderStatus.CANCELLED ||
        order.paymentStatus === PaymentStatus.REFUNDED
      ) {
        throw new BadRequestException(
          `Order ${id} cannot be refunded - current status: ${order.status}, payment status: ${order.paymentStatus}`,
        );
      }

      // Update payment status
      order.paymentStatus = PaymentStatus.REFUNDED;

      // Add refund details as a note
      const notes = order.notes || '';
      const refundNote = `Refund processed on ${new Date().toISOString()}${amount ? ` - Amount: ${amount}` : ' - Full amount'}${reason ? ` - Reason: ${reason}` : ''}`;
      order.notes = `${notes}\n${refundNote}`;

      // Save the updated order
      const updatedOrder = await this.orderRepository.save(order);

      this.logger.log(
        `Order ${id} has been refunded${amount ? ` - Amount: ${amount}` : ' - Full amount'}`,
      );

      return updatedOrder;
    } catch (error) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to refund order ${id}:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to refund order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Synchronize an order with its external platform
   * @param id Order ID
   * @returns The synchronized order
   * @throws NotFoundException if order not found
   * @throws BadRequestException if synchronization fails
   */
  async syncWithPlatform(id: string): Promise<Order> {
    try {
      // Validate input
      if (!id) {
        throw new BadRequestException('Order ID is required');
      }

      this.logger.debug(`Attempting to sync order ${id} with external platform`);

      // Find the order first (will throw NotFoundException if not found)
      const order = await this.findOne(id);

      // Check if the order has platform information
      if (!order.platformType) {
        throw new BadRequestException('Order has no associated platform');
      }

      // Set sync status to pending
      await this.updateSyncStatus(id, SyncStatus.PENDING);

      // Implement platform-specific sync logic based on the platform type
      let syncResult;
      let platformName;

      switch (order.platformType) {
        case 'shopify':
          platformName = 'Shopify';
          syncResult = await this.syncWithShopify(order);
          break;

        case 'woocommerce':
          platformName = 'WooCommerce';
          syncResult = await this.syncWithWooCommerce(order);
          break;

        default:
          throw new BadRequestException(`Unsupported platform type: ${order.platformType}`);
      }

      // Process sync result
      if (!syncResult.success) {
        // If sync failed, update the status accordingly
        const _failedOrder = await this.orderRepository.save({
          ...order,
          syncStatus: SyncStatus.FAILED,
          lastSyncedAt: new Date(),
          notes: order.notes
            ? `${order.notes}\nSync failure: ${syncResult.error}`
            : `Sync failure: ${syncResult.error}`,
        });

        throw new BadRequestException(syncResult.error || `Failed to sync with ${platformName}`);
      }

      // Update the order with sync information and any platform-specific updates
      const updatedOrder = await this.orderRepository.save({
        ...order,
        ...syncResult.updates, // Apply any updates from the platform
        syncStatus: SyncStatus.SYNCED,
        lastSyncedAt: new Date(),
        platformActions: syncResult.platformActions || order.platformActions,
      });

      this.logger.log(`Order ${id} has been synchronized with ${platformName}`);

      return updatedOrder;
    } catch (error: unknown) {
      // Re-throw specific exceptions as-is
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Log and handle any other errors
      this.logger.error(
        `Failed to sync order ${id} with platform:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        `Failed to sync order with platform: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sync an order with Shopify
   * @param order The order to synchronize
   * @returns Promise resolving to a sync result
   * @private
   */
  private async syncWithShopify(order: Order): Promise<{
    success: boolean;
    error?: string;
    updates?: Partial<Order>;
    platformActions?: PlatformActions;
  }> {
    try {
      // In a real implementation, this would use dependency injection
      // to get access to the shopify services
      // For now, we'll implement a simplified version

      // 1. Get the Merchant Platform Connection for this order
      // This would typically involve looking up the connection by merchantId
      // For demonstration, we'll create a mock connection

      // Get the merchant ID from one of the order items' products
      let merchantId: string | null = null;

      if (order.items && order.items.length > 0) {
        // This would normally involve querying the products service
        // to get the merchantId for the productId
        // For demo purposes, let's assume we extracted it
        merchantId = 'mock-merchant-id';

        this.logger.debug(`Found merchant ID ${merchantId} for order ${order.id}`);
      }

      if (!merchantId) {
        return {
          success: false,
          error: 'Could not determine merchant ID for this order',
        };
      }

      // 2. Use the Shopify client to get the latest order status from Shopify
      // In a real implementation, this would call the actual Shopify API
      // For demonstration, we'll simulate a response

      // Simulate fetching from Shopify
      const mockShopifyResponse = {
        id: order.id,
        status: 'fulfilled', // Could be pending, fulfilled, cancelled, etc.
        canCancel: order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED,
        canRefund: order.paymentStatus === PaymentStatus.COMPLETED,
        canFulfill: order.status === OrderStatus.PROCESSING,
        trackingNumber: 'TRACK123456',
        trackingUrl: 'https://example.com/tracking/TRACK123456',
      };

      // 3. Update the order based on the response
      const platformActions: PlatformActions = {
        canCancel: mockShopifyResponse.canCancel,
        canRefund: mockShopifyResponse.canRefund,
        canFulfill: mockShopifyResponse.canFulfill,
      };

      // Determine order status based on Shopify status
      let updatedStatus = order.status;
      if (mockShopifyResponse.status === 'fulfilled') {
        updatedStatus = OrderStatus.COMPLETED;
      } else if (mockShopifyResponse.status === 'cancelled') {
        updatedStatus = OrderStatus.CANCELLED;
      }

      // Create updates object
      const updates: Partial<Order> = {
        status: updatedStatus,
        // Add any other fields that should be updated
      };

      return {
        success: true,
        updates,
        platformActions,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing order ${order.id} with Shopify:`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync an order with WooCommerce
   * @param order The order to synchronize
   * @returns Promise resolving to a sync result
   * @private
   */
  private async syncWithWooCommerce(_order: Order): Promise<{
    success: boolean;
    error?: string;
    updates?: Partial<Order>;
    platformActions?: PlatformActions;
  }> {
    // Placeholder implementation for WooCommerce sync
    // In a real implementation, this would call the WooCommerce API

    // For now, just return a mock success result
    return {
      success: true,
      updates: {},
      platformActions: {
        canCancel: true,
        canRefund: true,
        canFulfill: true,
      },
    };
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
