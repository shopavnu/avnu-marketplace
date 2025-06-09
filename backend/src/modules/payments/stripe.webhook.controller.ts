// @ts-strict-mode: enabled
import { Controller, Post, Req, Headers, Logger, HttpException, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express'; // For RawBodyRequest type

@Controller('stripe') // Base path for Stripe specific endpoints like webhooks
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('webhooks')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>, // Use RawBodyRequest to access req.rawBody
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Received Stripe webhook event.');

    if (!signature) {
      this.logger.warn('Stripe webhook call missing signature.');
      throw new HttpException('Missing stripe-signature header', HttpStatus.BAD_REQUEST);
    }

    // NestJS with Express typically makes the raw body available on req.rawBody
    // if app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })); is used in main.ts
    // Or if app.use(express.raw({ type: 'application/json' })) is used for this route.
    // We are assuming req.rawBody is populated.
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error('Raw body not available for Stripe webhook. Ensure rawBodyParser is enabled or body is not pre-parsed for this route.');
      throw new HttpException('Raw body not available for signature verification.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      await this.stripeService.handleWebhookEvent(rawBody, signature);
      this.logger.log('Stripe webhook event processed successfully.');
      // Stripe expects a 2xx response to acknowledge receipt of the event
      // No explicit return needed here as NestJS defaults to 200 for POST if no error
    } catch (error) {
      this.logger.error(
        `Stripe webhook processing failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Determine appropriate HTTP status code based on the error
      if (error instanceof HttpException) {
        throw error; // Rethrow if it's already an HttpException (e.g., from StripeService)
      }
      // For other errors, respond with a generic server error or a specific Stripe-related error code
      throw new HttpException('Webhook handler failed', HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
