import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BaseWebhookHandler,
  WebhookContext,
  WebhookHandlerResult,
} from '../webhook-handler.interface';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';
import { PlatformType } from '../../../enums/platform-type.enum';

/**
 * Handler for customer-related webhooks
 *
 * Processes customer create, update, delete, and data request events
 */
@Injectable()
export class CustomerWebhookHandler extends BaseWebhookHandler {
  private readonly logger = new Logger(CustomerWebhookHandler.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {
    super([
      'customers/create',
      'customers/update',
      'customers/delete',
      'customers/data_request',
      'customers/redact',
    ]);
  }

  /**
   * Process customer webhooks
   */
  async process(context: WebhookContext): Promise<WebhookHandlerResult> {
    try {
      const { shop, payload, topic } = context;

      // Find merchant by shop domain
      const merchantId = await this.getMerchantIdByShop(shop);
      if (!merchantId) {
        this.logger.warn(`No merchant found for shop ${shop}`);
        return this.createErrorResult(
          new Error(`No merchant found for shop ${shop}`),
          'Merchant not found',
        );
      }

      // Extract the event from the topic (e.g., 'create' from 'customers/create')
      const event = topic.split('/')[1];

      // Process based on event type
      switch (event) {
        case 'create':
          await this.handleCustomerCreate(merchantId, payload);
          break;
        case 'update':
          await this.handleCustomerUpdate(merchantId, payload);
          break;
        case 'delete':
          await this.handleCustomerDelete(merchantId, payload);
          break;
        case 'data_request':
          await this.handleCustomerDataRequest(merchantId, payload);
          break;
        case 'redact':
          await this.handleCustomerRedact(merchantId, payload);
          break;
        default:
          this.logger.warn(`Unhandled customer event: ${event}`);
          return this.createErrorResult(
            new Error(`Unhandled customer event: ${event}`),
            'Unknown customer event',
          );
      }

      return this.createSuccessResult(`Successfully processed ${topic} webhook`, {
        merchantId,
        customerId: payload.id,
      });
    } catch (error) {
      this.logger.error(`Error processing customer webhook: ${error.message}`, error.stack);
      return this.createErrorResult(error, `Failed to process customer webhook: ${error.message}`);
    }
  }

  /**
   * Handle customer creation
   */
  private async handleCustomerCreate(merchantId: string, customerData: any): Promise<void> {
    this.logger.log(`Customer created: ${customerData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Transform the Shopify customer data to your internal format
    // 2. Save the customer to your database
    // 3. Trigger any necessary events or side effects (notifications, etc)
  }

  /**
   * Handle customer update
   */
  private async handleCustomerUpdate(merchantId: string, customerData: any): Promise<void> {
    this.logger.log(`Customer updated: ${customerData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the existing customer in your database
    // 2. Update it with the new data
    // 3. Trigger any necessary events or side effects
  }

  /**
   * Handle customer deletion
   */
  private async handleCustomerDelete(merchantId: string, customerData: any): Promise<void> {
    this.logger.log(`Customer deleted: ${customerData.id} for merchant ${merchantId}`);

    // Here you would:
    // 1. Find the customer in your database
    // 2. Mark it as deleted or remove associated data
    // 3. Maintain compliance with privacy requirements
  }

  /**
   * Handle customer data request (GDPR)
   *
   * This is a GDPR compliance webhook that Shopify sends when a customer
   * requests their data. You must respond within 30 days with the customer's data.
   */
  private async handleCustomerDataRequest(merchantId: string, requestData: any): Promise<void> {
    this.logger.log(
      `Customer data request for: ${requestData.customer.id} for merchant ${merchantId}`,
    );

    // Here you would:
    // 1. Gather all data related to this customer
    // 2. Format it according to your privacy policy
    // 3. Send it back to Shopify or to the customer directly
    // 4. Log the request and your response for compliance purposes
  }

  /**
   * Handle customer data redaction (GDPR)
   *
   * This is a GDPR compliance webhook that Shopify sends when a customer's
   * data should be redacted/deleted from your systems.
   */
  private async handleCustomerRedact(merchantId: string, redactData: any): Promise<void> {
    this.logger.log(
      `Customer redaction request for: ${redactData.customer.id} for merchant ${merchantId}`,
    );

    // Here you would:
    // 1. Find all data related to this customer in your system
    // 2. Redact or anonymize the data according to your privacy policy
    // 3. Log the redaction for compliance purposes
  }

  /**
   * Get merchant ID by shop domain
   */
  private async getMerchantIdByShop(shop: string): Promise<string | null> {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        platformType: PlatformType.SHOPIFY as unknown as PlatformType,
        platformIdentifier: shop,
        isActive: true,
      },
    });

    return connection ? connection.merchantId : null;
  }
}
