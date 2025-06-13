import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module'; // Adjusted path
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
// TypeOrmModule and entities can be added here if StripeService needs to directly interact with payment-specific DB tables
// For now, it primarily uses OrdersService for order updates.

@Module({
  imports: [
    ConfigModule, // For ConfigService used in StripeService
    OrdersModule, // For OrdersService used in StripeService to update orders
    // TypeOrmModule.forFeature([]), // Add payment-specific entities here if any
  ],
  providers: [StripeService],
  controllers: [PaymentsController, StripeWebhookController],
  exports: [StripeService], // Export StripeService if other modules need to create payment intents directly
})
export class PaymentsModule {}
