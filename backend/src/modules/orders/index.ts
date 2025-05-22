// @ts-strict-mode: enabled
// Module
export { OrdersModule } from './orders.module';

// Entities
export { Order } from './entities/order.entity';
export { OrderItem } from './entities/order-item.entity';
export { OrderFulfillment } from './entities/order-fulfillment.entity';

// DTOs
export { CreateOrderDto } from './dto/create-order.dto';
export { UpdateOrderDto } from './dto/update-order.dto';

// GraphQL Types
export {
  OrderType,
  OrderItemType,
  OrderFulfillmentType,
  ShippingAddressType,
  PaginatedOrdersType,
} from './dto/order.types';

// GraphQL Inputs
export {
  CreateOrderInput,
  UpdateOrderInput,
  OrderItemInput,
  ShippingAddressInput,
  PaginationInput,
} from './dto/order.inputs';

// Services
export { OrdersService } from './services/orders.service';

// Controllers
export { OrdersController } from './controllers/orders.controller';

// Resolvers
export { OrdersResolver } from './resolvers/orders.resolver';

// Enums
export { OrderStatus } from './enums/order-status.enum';
export { PaymentStatus } from './enums/payment-status.enum';
export { FulfillmentStatus } from './enums/fulfillment-status.enum';
export { SyncStatus } from './enums/sync-status.enum';
