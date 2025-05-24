// @ts-strict-mode: enabled
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { OrdersResolver } from './resolvers/orders.resolver';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderFulfillment } from './entities/order-fulfillment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderFulfillment])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
