// @ts-strict-mode: enabled
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrderStatus, PaymentStatus, FulfillmentStatus, SyncStatus } from '../enums';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { Order } from '../entities/order.entity';

/**
 * Extended Order interface to handle properties that exist at runtime but are not in TypeScript definition
 */
interface ExtendedOrder extends Omit<Order, 'syncStatus'> {
  externalId?: string;
  platformType?: string;
  merchantId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  placedAt?: Date;
  cancelledAt?: Date;
  fulfillmentStatus?: FulfillmentStatus;
  fulfilledAt?: Date;
  refundedAt?: Date;
  lastSyncedAt?: Date;
  // Override the syncStatus property from the base Order class
  // This is necessary because the property exists at runtime but might not be defined in the TypeScript interface
  syncStatus: SyncStatus;
}

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid order data' })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.ordersService.create(createOrderDto as unknown as Record<string, unknown>);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create order: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders retrieved successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders for a specific customer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer orders retrieved successfully' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findByCustomer(
    @Param('customerId') customerId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByCustomer(customerId, paginationDto);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Get orders for a specific merchant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Merchant orders retrieved successfully' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findByMerchant(
    @Param('merchantId') merchantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.findByMerchant(merchantId, paginationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid update data' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    try {
      return await this.ordersService.update(
        id,
        updateOrderDto as unknown as Record<string, unknown>,
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
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

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payment status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
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

  @Patch(':id/fulfillment-status')
  @ApiOperation({ summary: 'Update fulfillment status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Fulfillment status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid fulfillment status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updateFulfillmentStatus(
    @Param('id') id: string,
    @Body('fulfillmentStatus') fulfillmentStatus: FulfillmentStatus,
  ) {
    try {
      return await this.ordersService.updateFulfillmentStatus(id, fulfillmentStatus);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update fulfillment status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order cancelled successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Order cannot be cancelled' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async cancelOrder(@Param('id') id: string, @Body('reason') reason?: string) {
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

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order refunded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Order cannot be refunded' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async refundOrder(
    @Param('id') id: string,
    @Body('amount') amount?: number,
    @Body('reason') reason?: string,
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

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync order with external platform' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order synced successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Sync failed' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async syncWithPlatform(@Param('id') id: string) {
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

  @Patch(':id/sync-status')
  @ApiOperation({ summary: 'Update order sync status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sync status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid sync status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updateSyncStatus(@Param('id') id: string, @Body('syncStatus') syncStatus: SyncStatus) {
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an order (soft delete)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Order removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.ordersService.remove(id);
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
