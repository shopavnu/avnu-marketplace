import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule if not globally available for ConfigService

@Module({
  imports: [
    ConfigModule, // Make sure ConfigService is available
    AuthModule, // For user authentication and extracting userId
    CartModule, // For CartService
    OrdersModule, // For OrdersService
    PaymentsModule, // For StripeService
    UsersModule, // For UsersService (e.g., to get user's email)
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
