import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/services/cart.service';
import { OrdersService } from '../orders/services/orders.service';
import { StripeService } from '../payments/stripe.service';
import { UsersService } from '../users/users.service';
import { PaymentStatus } from '../orders/enums/payment-status.enum'; // Corrected path
import { CreateOrderDto, ShippingAddressDto } from '../orders/dto/create-order.dto'; // Added ShippingAddressDto import
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
// Removed CartItemForCheckout interface as it's not strictly needed and was causing issues with 'name'
import { InitiateCheckoutResponseDto } from './dto/initiate-checkout-response.dto';

// The interface InitiateCheckoutResponse was replaced by InitiateCheckoutResponseDto from the dto file.

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private readonly defaultCurrency: string;

  constructor(
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
    private readonly usersService: UsersService, // For fetching user details like email
    private readonly configService: ConfigService,
  ) {
    this.defaultCurrency = this.configService.get<string>('DEFAULT_CURRENCY', 'usd');
  }

  async initiateCheckoutProcess(userId: string): Promise<InitiateCheckoutResponseDto> {
    this.logger.log(`Initiating checkout for user ${userId}`);

    let user: User;
    try {
      user = await this.usersService.findOne(userId); // Corrected method to findOne
      if (!user || !user.email) {
        this.logger.error(`User ${userId} not found or email is missing.`);
        throw new NotFoundException('User information is incomplete.');
      }
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Could not retrieve user details.');
    }

    const cart = await this.cartService.getCart(userId); // Corrected method to getCart
    if (!cart || !cart.items || cart.items.length === 0) {
      this.logger.warn(`User ${userId} has no active cart or cart is empty.`);
      throw new BadRequestException('Your cart is empty.');
    }

    // Transform cart items and calculate total
    // cart.items are CartItemDto[], which include productId, quantity, price, variantId
    // Calculate totalAmount directly from cart.items
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (totalAmount <= 0) {
      this.logger.warn(`Calculated total for user ${userId} is zero or negative.`);
      throw new BadRequestException('Invalid cart total.');
    }
    const totalAmountInCents = Math.round(totalAmount * 100); // Stripe expects amount in cents

    // 1. Create a preliminary order
    // CreateOrderDto expects items matching CreateOrderItemDto structure
    // (productId, quantity, price, variantId?)
    // totalAmount, currency, paymentStatus are not part of CreateOrderDto definition seen.
    // These are likely handled by OrdersService.create or set on the entity internally.
    const createOrderDto: CreateOrderDto = {
      userId,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price, // Corrected field name for CreateOrderItemDto
        variantId: item.variantId, // Pass along variantId
      })),
      shippingAddress: new ShippingAddressDto(), // Provide default shipping address
    };

    let newOrder;
    try {
      newOrder = await this.ordersService.create(createOrderDto);
      this.logger.log(`Created preliminary order ${newOrder.id} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to create order for user ${userId}: ${error.message}`, error.stack);
      throw new BadRequestException('Could not create order.');
    }

    // 2. Create Stripe PaymentIntent
    let paymentIntent;
    try {
      paymentIntent = await this.stripeService.createPaymentIntent(
        totalAmountInCents,
        this.defaultCurrency,
        user.email, // Customer email for Stripe customer object
        newOrder.id, // order_id in metadata
        user.email, // receipt_email
      );
      this.logger.log(`Created PaymentIntent ${paymentIntent.id} for order ${newOrder.id}`);
    } catch (error) {
      this.logger.error(`Failed to create PaymentIntent for order ${newOrder.id}: ${error.message}`, error.stack);
      // Potentially roll back order creation or mark it as failed if PI creation fails critically
      await this.ordersService.update(newOrder.id, { paymentStatus: PaymentStatus.FAILED, notes: 'PaymentIntent creation failed' });
      throw new BadRequestException('Could not initiate payment.');
    }

    // 3. Update order with PaymentIntent ID
    try {
      await this.ordersService.update(newOrder.id, { stripePaymentIntentId: paymentIntent.id });
      this.logger.log(`Updated order ${newOrder.id} with Stripe PaymentIntent ID ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Failed to update order ${newOrder.id} with PaymentIntent ID: ${error.message}`, error.stack);
      // This is tricky; PI is created, but order link failed. Stripe might still process payment.
      // Log for manual reconciliation. Consider a more robust retry/cleanup.
      throw new BadRequestException('Failed to link payment with order.');
    }

    // 4. Return essential info to frontend
    return {
      orderId: newOrder.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}
