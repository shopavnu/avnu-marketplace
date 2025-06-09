// @ts-strict-mode: enabled
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/services/orders.service'; // Adjusted path
import { PaymentStatus } from '../orders/enums'; // Adjusted path
import { Order } from '../orders/entities/order.entity'; // Adjusted path
import { UpdateOrderDto } from '../orders/dto/update-order.dto'; // Adjusted path

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not configured.');
      throw new Error('Stripe secret key is not configured.');
    }
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification will fail.');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
      typescript: true,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerEmail?: string,
    orderId?: string,
    receiptEmail?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          ...(orderId && { order_id: orderId }),
          ...(customerEmail && { customer_email: customerEmail }),
        },
        ...(receiptEmail && { receipt_email: receiptEmail }),
      };

      if (customerEmail) {
        const customer = await this.findOrCreateStripeCustomer(customerEmail);
        paymentIntentParams.customer = customer.id;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);
      this.logger.log(`Created PaymentIntent: ${paymentIntent.id} for order: ${orderId || 'N/A'}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create PaymentIntent: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw new BadRequestException('Failed to create payment intent.', { cause: error });
    }
  }

  private async findOrCreateStripeCustomer(email: string): Promise<Stripe.Customer> {
    const customers = await this.stripe.customers.list({ email: email, limit: 1 });
    if (customers.data.length > 0) {
      return customers.data[0];
    }
    return this.stripe.customers.create({ email: email });
  }

  async handleWebhookEvent(payload: string | Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      if (!this.webhookSecret) {
        this.logger.error('Webhook secret is not configured. Cannot verify Stripe event signature.');
        throw new Error('Webhook secret is not configured.');
      }
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`, err.stack);
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
        this.logger.log(`PaymentIntent ${paymentIntentSucceeded.id} succeeded.`);
        await this.handlePaymentIntentSucceeded(paymentIntentSucceeded);
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        this.logger.log(`Handling payment_intent.payment_failed for PI: ${paymentIntentFailed.id}`);
        await this.handlePaymentIntentFailed(paymentIntentFailed);
        break;
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        this.logger.log(`Handling checkout.session.completed for session: ${checkoutSession.id}`);
        await this.handleCheckoutSessionCompleted(checkoutSession);
        break;
      case 'charge.refunded':
        const chargeRefunded = event.data.object as Stripe.Charge;
        this.logger.log(`Handling charge.refunded for Charge: ${chargeRefunded.id}`);
        await this.handleChargeRefunded(chargeRefunded);
        break;
      case 'charge.dispute.created':
        const disputeCreated = event.data.object as Stripe.Dispute;
        this.logger.log(`Handling charge.dispute.created for Dispute: ${disputeCreated.id}`);
        await this.handleChargeDisputeCreated(disputeCreated);
        break;
      case 'charge.dispute.closed':
        const disputeClosed = event.data.object as Stripe.Dispute;
        this.logger.log(`Handling charge.dispute.closed for Dispute: ${disputeClosed.id}, Status: ${disputeClosed.status}`);
        await this.handleChargeDisputeClosed(disputeClosed);
        break;
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata?.order_id;

    if (!orderId) {
      this.logger.warn(`PaymentIntent ${paymentIntent.id} succeeded but has no order_id in metadata. Cannot process.`);
      // Returning without error: Stripe will see a 2xx and won't retry. Appropriate if order_id is essential.
      return;
    }

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing PaymentIntent ${paymentIntent.id}.`);
          // Order doesn't exist. A 2xx response will prevent Stripe from retrying for a non-existent order.
          return;
        }
        // For other errors during findOne (e.g., database connection issue), re-throw to let Stripe retry.
        this.logger.error(`Error fetching order ${orderId} for PaymentIntent ${paymentIntent.id}: ${findError.message}`, findError.stack);
        throw findError; 
      }

      // Idempotency Check 1: Already processed this specific payment intent for this order.
      if (order.paymentStatus === PaymentStatus.COMPLETED && order.stripePaymentIntentId === paymentIntent.id) {
        this.logger.log(`PaymentIntent ${paymentIntent.id} for order ${orderId} has already been processed. Skipping.`);
        return;
      }

      // Idempotency Check 2: Order is marked COMPLETED but with a different PaymentIntent ID.
      if (order.paymentStatus === PaymentStatus.COMPLETED && order.stripePaymentIntentId && order.stripePaymentIntentId !== paymentIntent.id) {
        this.logger.warn(
          `Order ${orderId} is already marked COMPLETED with a different PaymentIntent ID (${order.stripePaymentIntentId}). ` +
          `Current PaymentIntent ID: ${paymentIntent.id}. Manual investigation may be needed. Skipping update.`
        );
        return;
      }

      const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string; stripeReceiptUrl?: string } = {
        paymentStatus: PaymentStatus.COMPLETED,
        stripePaymentIntentId: paymentIntent.id,
      };

      if (paymentIntent.latest_charge) {
        const chargeId = typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge.id;

        try {
          const charge = await this.stripe.charges.retrieve(chargeId);
          if (charge.receipt_url) {
            updatePayload.stripeReceiptUrl = charge.receipt_url;
          }
        } catch (chargeError: any) {
          this.logger.warn(`Failed to retrieve charge ${chargeId} for PI ${paymentIntent.id} to get receipt URL: ${chargeError.message}. Proceeding without receipt URL.`);
          // Not re-throwing, as failing to get receipt URL shouldn't stop order update.
        }
      }

      await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
      this.logger.log(`Order ${orderId} updated successfully to COMPLETED after PaymentIntent ${paymentIntent.id} succeeded.`);

    } catch (error: any) {
      this.logger.error(
        `Critical error in handlePaymentIntentSucceeded for order ${orderId}, PaymentIntent ${paymentIntent.id}: ${error.message}`,
        error.stack,
      );
      // Re-throw the error. If it's an HttpException (like BadRequest from ordersService.update), 
      // the controller will use its status. Otherwise, it becomes a 500. Stripe will retry.
      throw error;
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata?.order_id;

    if (!orderId) {
      this.logger.warn(`PaymentIntent ${paymentIntent.id} failed but has no order_id in metadata. Cannot process.`);
      return; // 2xx to Stripe, no retry
    }

    const failureReason = paymentIntent.last_payment_error?.message || 'No specific error message provided.';
    this.logger.log(`PaymentIntent ${paymentIntent.id} for order ${orderId} failed. Reason: ${failureReason}`);

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing failed PaymentIntent ${paymentIntent.id}.`);
          return; // 2xx to Stripe, no retry for non-existent order
        }
        this.logger.error(`Error fetching order ${orderId} for failed PaymentIntent ${paymentIntent.id}: ${findError.message}`, findError.stack);
        throw findError; // Re-throw for Stripe to retry (e.g., DB issues)
      }

      // Idempotency Check 1: Already processed this specific failed payment intent.
      if (order.paymentStatus === PaymentStatus.FAILED && order.stripePaymentIntentId === paymentIntent.id) {
        this.logger.log(`Failed PaymentIntent ${paymentIntent.id} for order ${orderId} has already been processed. Skipping.`);
        return;
      }

      // Idempotency Check 2: Order was COMPLETED by this same PaymentIntent. A later 'failed' event for the same PI is contradictory.
      if (order.paymentStatus === PaymentStatus.COMPLETED && order.stripePaymentIntentId === paymentIntent.id) {
        this.logger.warn(
          `Order ${orderId} was marked COMPLETED with PaymentIntent ${paymentIntent.id}, but a 'payment_failed' event was received. ` +
          `This is contradictory. Prioritizing 'completed' status. Skipping update to FAILED.`
        );
        return;
      }
      
      // If order is COMPLETED by a *different* PI, or PENDING, etc., then this failure is relevant for the current PI.
      const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string } = {
        paymentStatus: PaymentStatus.FAILED,
        stripePaymentIntentId: paymentIntent.id, // Record which PI attempt failed
        // Optionally, add a field to Order entity to store failureReason if needed
      };

      await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
      this.logger.log(`Order ${orderId} updated to FAILED after PaymentIntent ${paymentIntent.id} failed. Reason: ${failureReason}`);

    } catch (error: any) {
      this.logger.error(
        `Critical error in handlePaymentIntentFailed for order ${orderId}, PaymentIntent ${paymentIntent.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw for Stripe to retry
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.payment_status !== 'paid') {
      this.logger.log(`Checkout session ${session.id} status is ${session.payment_status}, not 'paid'. Skipping further processing.`);
      return;
    }

    const orderId = session.client_reference_id;
    if (!orderId) {
      this.logger.warn(`Checkout session ${session.id} completed but has no client_reference_id (order_id). Cannot process.`);
      return; // 2xx to Stripe, no retry
    }

    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
    if (!paymentIntentId) {
      this.logger.warn(`Checkout session ${session.id} for order ${orderId} has no valid payment_intent ID. Cannot associate.`);
      return; // 2xx to Stripe, no retry
    }

    this.logger.log(`Processing checkout.session.completed for order ${orderId}, PI: ${paymentIntentId}, Session: ${session.id}`);

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing checkout.session.completed ${session.id}.`);
          return; // 2xx to Stripe, no retry for non-existent order
        }
        this.logger.error(`Error fetching order ${orderId} for checkout.session.completed ${session.id}: ${findError.message}`, findError.stack);
        throw findError; // Re-throw for Stripe to retry (e.g., DB issues)
      }

      if (!order.stripePaymentIntentId) {
        this.logger.log(`Order ${orderId} has no Stripe PaymentIntent ID. Associating with PI ${paymentIntentId} from checkout session ${session.id}.`);
        const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string } = {
          stripePaymentIntentId: paymentIntentId,
        };
        await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
        this.logger.log(`Order ${orderId} successfully associated with PaymentIntent ID ${paymentIntentId}.`);
      } else if (order.stripePaymentIntentId === paymentIntentId) {
        this.logger.log(`Order ${orderId} is already associated with PaymentIntent ID ${paymentIntentId}. No action needed for checkout.session.completed.`);
      } else {
        this.logger.warn(
          `Order ${orderId} is already associated with a different PaymentIntent ID (${order.stripePaymentIntentId}). ` +
          `Checkout session ${session.id} refers to PI ${paymentIntentId}. Manual investigation may be needed. Not overwriting.`
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Critical error in handleCheckoutSessionCompleted for order ${orderId}, session ${session.id}, PI ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw for Stripe to retry
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = charge.payment_intent;
    if (typeof paymentIntentId !== 'string') {
      this.logger.warn(`Charge ${charge.id} refunded, but no associated PaymentIntent ID found. Cannot link to order.`);
      return; // 2xx to Stripe, no retry
    }

    let retrievedPaymentIntent: Stripe.PaymentIntent;
    try {
      retrievedPaymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (piError: any) {
      this.logger.error(`Failed to retrieve PaymentIntent ${paymentIntentId} for refunded charge ${charge.id}: ${piError.message}`);
      // If PI not found, we can't link to an order. If other Stripe error, Stripe might retry the webhook later.
      // For PI not found (Stripe's `invalid_request_error` with code `resource_missing`), a 2xx is fine.
      // For other errors, re-throwing might be too aggressive if the issue is temporary at Stripe's end.
      // Let's return 2xx to avoid excessive retries for now, assuming PI should exist if charge exists.
      return; 
    }

    const orderId = retrievedPaymentIntent.metadata?.order_id;
    if (!orderId) {
      this.logger.warn(`Refunded charge ${charge.id} (PI: ${paymentIntentId}) has no order_id in PaymentIntent metadata. Cannot process.`);
      return; // 2xx to Stripe, no retry
    }

    this.logger.log(`Processing charge.refunded for Charge: ${charge.id}, Order: ${orderId}, PI: ${paymentIntentId}`);

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing refunded charge ${charge.id}.`);
          return; // 2xx to Stripe, no retry
        }
        this.logger.error(`Error fetching order ${orderId} for refunded charge ${charge.id}: ${findError.message}`, findError.stack);
        throw findError; // Re-throw for Stripe to retry
      }

      let newPaymentStatus: PaymentStatus;
      if (charge.refunded && charge.amount_refunded === charge.amount) {
        newPaymentStatus = PaymentStatus.REFUNDED;
      } else if (charge.amount_refunded > 0) {
        newPaymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
      } else {
        this.logger.warn(`Charge ${charge.id} for order ${orderId} has 'charge.refunded' event but amount_refunded is 0 or charge.refunded is false. Current amount_refunded: ${charge.amount_refunded}, charge.refunded: ${charge.refunded}. Skipping status update.`);
        return;
      }

      // Idempotency: If status is already what we intend to set, skip.
      if (order.paymentStatus === newPaymentStatus) {
        this.logger.log(`Order ${orderId} paymentStatus is already ${newPaymentStatus} for charge ${charge.id}. No update needed.`);
        return;
      }
      
      // If order was COMPLETED, and now it's PARTIALLY_REFUNDED or REFUNDED, that's fine.
      // If order was FAILED, and now it's being marked REFUNDED (e.g. dispute lost, then refunded), that's also possible.

      const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string } = {
        paymentStatus: newPaymentStatus,
        stripePaymentIntentId: paymentIntentId, // Ensure PI is linked
      };

      // Potentially store more refund details on the order if entity supports it
      // e.g., order.lastRefundId = charge.refunds.data[0]?.id (if available and relevant)
      // order.totalAmountRefunded = charge.amount_refunded (if you track this sum on the order)

      await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
      this.logger.log(`Order ${orderId} paymentStatus updated to ${newPaymentStatus} due to charge ${charge.id} refund. Amount refunded: ${charge.amount_refunded}/${charge.amount}.`);

    } catch (error: any) {
      this.logger.error(
        `Critical error in handleChargeRefunded for order ${orderId}, charge ${charge.id}, PI ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw for Stripe to retry
    }
  }

  private async handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    const paymentIntentId = dispute.payment_intent;
    if (typeof paymentIntentId !== 'string') {
      this.logger.warn(`Dispute ${dispute.id} created, but no associated PaymentIntent ID found. Cannot link to order.`);
      return; // 2xx to Stripe, no retry
    }

    let retrievedPaymentIntent: Stripe.PaymentIntent;
    try {
      retrievedPaymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (piError: any) {
      this.logger.error(`Failed to retrieve PaymentIntent ${paymentIntentId} for dispute ${dispute.id}: ${piError.message}`);
      return; // Avoid retries if PI can't be fetched
    }

    const orderId = retrievedPaymentIntent.metadata?.order_id;
    if (!orderId) {
      this.logger.warn(`Dispute ${dispute.id} (PI: ${paymentIntentId}) has no order_id in PaymentIntent metadata. Cannot process.`);
      return; // 2xx to Stripe, no retry
    }

    this.logger.log(`Processing charge.dispute.created for Dispute: ${dispute.id}, Order: ${orderId}, PI: ${paymentIntentId}, Reason: ${dispute.reason}`);

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing dispute ${dispute.id}.`);
          return; // 2xx to Stripe, no retry
        }
        this.logger.error(`Error fetching order ${orderId} for dispute ${dispute.id}: ${findError.message}`, findError.stack);
        throw findError; // Re-throw for Stripe to retry
      }

      // Idempotency: If status is already ON_HOLD, assume it's handled (or being handled by another process for this dispute)
      // For more robust idempotency, we'd store dispute.id on the order and check against it.
      if (order.paymentStatus === PaymentStatus.ON_HOLD) {
        this.logger.log(`Order ${orderId} paymentStatus is already ON_HOLD. Assuming dispute ${dispute.id} (or another) is already noted. Skipping update.`);
        return;
      }

      const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string /*, stripeDisputeId?: string */ } = {
        paymentStatus: PaymentStatus.ON_HOLD,
        stripePaymentIntentId: paymentIntentId, // Ensure PI is linked
        // stripeDisputeId: dispute.id, // If you add this field to Order entity
      };

      await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
      this.logger.log(`Order ${orderId} paymentStatus updated to ON_HOLD due to dispute ${dispute.id}.`);

      // TODO: Consider sending notifications (admin, merchant) about the dispute.

    } catch (error: any) {
      this.logger.error(
        `Critical error in handleChargeDisputeCreated for order ${orderId}, dispute ${dispute.id}, PI ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw for Stripe to retry
    }
  }

  private async handleChargeDisputeClosed(dispute: Stripe.Dispute): Promise<void> {
    const paymentIntentId = dispute.payment_intent;
    if (typeof paymentIntentId !== 'string') {
      this.logger.warn(`Dispute ${dispute.id} closed, but no associated PaymentIntent ID found. Cannot link to order.`);
      return; // 2xx to Stripe, no retry
    }

    let retrievedPaymentIntent: Stripe.PaymentIntent;
    try {
      retrievedPaymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (piError: any) {
      this.logger.error(`Failed to retrieve PaymentIntent ${paymentIntentId} for closed dispute ${dispute.id}: ${piError.message}`);
      return; // Avoid retries if PI can't be fetched
    }

    const orderId = retrievedPaymentIntent.metadata?.order_id;
    if (!orderId) {
      this.logger.warn(`Closed dispute ${dispute.id} (PI: ${paymentIntentId}) has no order_id in PaymentIntent metadata. Cannot process.`);
      return; // 2xx to Stripe, no retry
    }

    this.logger.log(`Processing charge.dispute.closed for Dispute: ${dispute.id}, Order: ${orderId}, PI: ${paymentIntentId}, Status: ${dispute.status}`);

    try {
      let order: Order;
      try {
        order = await this.ordersService.findOne(orderId);
      } catch (findError: any) {
        if (findError instanceof NotFoundException) {
          this.logger.error(`Order ${orderId} not found when processing closed dispute ${dispute.id}.`);
          return; // 2xx to Stripe, no retry
        }
        this.logger.error(`Error fetching order ${orderId} for closed dispute ${dispute.id}: ${findError.message}`, findError.stack);
        throw findError; // Re-throw for Stripe to retry
      }

      let newPaymentStatus: PaymentStatus | null = null;

      switch (dispute.status) {
        case 'won':
          // If the dispute is won, and the order was ON_HOLD, revert to COMPLETED (assuming it was paid).
          // If it's already COMPLETED, no change needed.
          if (order.paymentStatus === PaymentStatus.ON_HOLD) {
            newPaymentStatus = PaymentStatus.COMPLETED;
            this.logger.log(`Dispute ${dispute.id} won for order ${orderId}. Setting paymentStatus to COMPLETED.`);
          } else if (order.paymentStatus === PaymentStatus.COMPLETED) {
            this.logger.log(`Dispute ${dispute.id} won for order ${orderId}. Order paymentStatus is already COMPLETED. No change needed.`);
          } else {
            this.logger.warn(`Dispute ${dispute.id} won for order ${orderId}, but order status is ${order.paymentStatus} (not ON_HOLD). Manual review may be needed. Not changing status.`);
          }
          break;
        case 'lost':
          // If the dispute is lost, payment should be considered REFUNDED.
          // The charge.refunded event might also handle this, but this ensures it.
          if (order.paymentStatus !== PaymentStatus.REFUNDED) {
            newPaymentStatus = PaymentStatus.REFUNDED;
            this.logger.log(`Dispute ${dispute.id} lost for order ${orderId}. Setting paymentStatus to REFUNDED.`);
          } else {
            this.logger.log(`Dispute ${dispute.id} lost for order ${orderId}. Order paymentStatus is already REFUNDED. No change needed.`);
          }
          break;
        default:
          this.logger.log(`Dispute ${dispute.id} for order ${orderId} closed with status: ${dispute.status}. No automatic status change implemented for this outcome.`);
          // If order was ON_HOLD, you might want to clear it or set to a review status.
          // For now, we leave it as is if not 'won' or 'lost'.
          break;
      }

      if (newPaymentStatus && order.paymentStatus !== newPaymentStatus) {
        const updatePayload: Partial<UpdateOrderDto> & { stripePaymentIntentId?: string } = {
          paymentStatus: newPaymentStatus,
          stripePaymentIntentId: paymentIntentId, // Ensure PI is linked
        };
        await this.ordersService.update(orderId, updatePayload as UpdateOrderDto);
        this.logger.log(`Order ${orderId} paymentStatus updated to ${newPaymentStatus} due to closed dispute ${dispute.id} (Status: ${dispute.status}).`);
      } else if (newPaymentStatus && order.paymentStatus === newPaymentStatus) {
        this.logger.log(`Order ${orderId} paymentStatus is already ${newPaymentStatus}. No update needed for closed dispute ${dispute.id}.`);
      }

      // TODO: Consider sending notifications (admin, merchant) about the dispute resolution.

    } catch (error: any) {
      this.logger.error(
        `Critical error in handleChargeDisputeClosed for order ${orderId}, dispute ${dispute.id}, PI ${paymentIntentId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw for Stripe to retry
    }
  }
}
