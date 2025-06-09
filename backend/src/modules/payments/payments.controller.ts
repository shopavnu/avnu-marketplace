// @ts-strict-mode: enabled
import { Controller, Post, Body, UsePipes, ValidationPipe, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service'; // Adjusted path
import { CreatePaymentIntentDto } from './create-payment-intent.dto';
import Stripe from 'stripe';

@Controller('payments') // Base path for payment related endpoints
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<{ clientSecret: string | null }> {
    this.logger.log(
      `Attempting to create PaymentIntent for order: ${createPaymentIntentDto.orderId || 'N/A'}, amount: ${createPaymentIntentDto.amount}`,
    );
    try {
      const paymentIntent: Stripe.PaymentIntent = await this.stripeService.createPaymentIntent(
        createPaymentIntentDto.amount, // Amount in smallest currency unit (e.g., cents)
        createPaymentIntentDto.currency || 'usd', // Default to USD if not provided
        createPaymentIntentDto.customerEmail,
        createPaymentIntentDto.orderId,
        createPaymentIntentDto.receiptEmail, // Pass receiptEmail to service
      );
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      this.logger.error(
        `Failed to create PaymentIntent: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Rethrow or handle as a standard HTTP exception
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create payment intent.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }
}
