// @ts-strict-mode: enabled
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { OrderType, PaginatedOrdersType } from '../dto/order.types';
import { CreateOrderInput, UpdateOrderInput, PaginationInput } from '../dto/order.inputs';
import { OrderStatus, PaymentStatus, FulfillmentStatus, SyncStatus } from '../enums';

/**
 * Utility function to adapt pagination input for service methods
 * Converts GraphQL pagination input to a format compatible with service methods
 */
const _paginationToFilters = (pagination?: PaginationInput): Record<string, any> => {
  if (!pagination) return {};

  // Basic pagination data that could be used for filtering or limiting results
  // Each service method may handle this differently
  return {
    _page: pagination.page || 1,
    _limit: pagination.limit || 10,
  };
};

@Resolver(() => OrderType)
@UseGuards(GqlAuthGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => PaginatedOrdersType, { name: 'orders' })
  async findAll(@Args('pagination', { nullable: true }) pagination?: PaginationInput) {
    try {
      // The OrdersService.findAll expects Partial<Order> not PaginationInput
      // So we use an empty filter object instead
      const orders = await this.ordersService.findAll({});

      // Apply basic pagination manually if needed
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
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve orders: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Query(() => OrderType, { name: 'order' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  @Query(() => PaginatedOrdersType, { name: 'customerOrders' })
  async findByCustomer(
    @Args('customerId', { type: () => ID }) customerId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    try {
      const orders = await this.ordersService.findByCustomer(customerId);

      // Apply basic pagination manually if needed
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
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve customer orders: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Query(() => PaginatedOrdersType, { name: 'merchantOrders' })
  async findByMerchant(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    try {
      const orders = await this.ordersService.findByMerchant(merchantId);

      // Apply basic pagination manually if needed
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
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve merchant orders: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'createOrder' })
  async create(@Args('input') createOrderInput: CreateOrderInput) {
    try {
      // Convert GraphQL input to CreateOrderDto explicitly to satisfy TypeScript
      const orderDto = {
        userId: createOrderInput.userId,
        items: createOrderInput.items,
        shippingAddress: createOrderInput.shippingAddress,
        notes: createOrderInput.notes,
        isPriority: createOrderInput.isPriority,
      };

      return await this.ordersService.create(orderDto);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'updateOrder' })
  async update(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateOrderInput: UpdateOrderInput,
  ) {
    try {
      return await this.ordersService.update(
        id,
        updateOrderInput as unknown as Record<string, unknown>,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'updateOrderStatus' })
  async updateStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: OrderStatus,
  ) {
    try {
      return await this.ordersService.updateStatus(id, status);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update order status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'updatePaymentStatus' })
  async updatePaymentStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('paymentStatus', { type: () => String }) paymentStatus: PaymentStatus,
  ) {
    try {
      return await this.ordersService.updatePaymentStatus(id, paymentStatus);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update payment status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'updateOrderFulfillmentStatus' })
  async updateFulfillmentStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => String }) status: FulfillmentStatus,
  ) {
    try {
      return await this.ordersService.updateFulfillmentStatus(id, status.toString());
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update fulfillment status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'cancelOrder' })
  async cancelOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    try {
      return await this.ordersService.cancelOrder(id, reason);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to cancel order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'refundOrder' })
  async refundOrder(
    @Args('id', { type: () => ID }) id: string,
    @Args('amount', { type: () => Int, nullable: true }) amount?: number,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    try {
      return await this.ordersService.refundOrder(id, amount, reason);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to refund order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'syncOrder' })
  async syncWithPlatform(@Args('id', { type: () => ID }) id: string) {
    try {
      return await this.ordersService.syncWithPlatform(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to sync order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => OrderType, { name: 'updateOrderSyncStatus' })
  async updateSyncStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('syncStatus', { type: () => String }) syncStatus: SyncStatus,
  ) {
    try {
      return await this.ordersService.updateSyncStatus(id, syncStatus);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update sync status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => Boolean, { name: 'removeOrder' })
  async remove(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    try {
      await this.ordersService.remove(id);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to remove order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
