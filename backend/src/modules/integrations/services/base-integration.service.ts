// @ts-strict-mode: enabled
import { Injectable, Logger } from '@nestjs/common';
import { IntegrationType } from '../types/integration-type.enum';

/**
 * Base class for platform integration services
 * Provides common functionality that all integration services should implement
 */
@Injectable()
export abstract class BaseIntegrationService {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * The integration type that this service handles
   */
  abstract readonly integrationType: IntegrationType;

  /**
   * Initialize the integration service
   */
  abstract initialize(): Promise<void>;

  /**
   * Authenticate with the platform
   * @param credentials Platform-specific credentials
   */
  abstract authenticate(credentials: Record<string, any>): Promise<string | null>;

  /**
   * Sync products from the platform
   * @param merchantId Merchant ID in our system
   * @param options Additional sync options
   */
  abstract syncProducts(
    merchantId: string,
    options?: Record<string, any>,
  ): Promise<{ created: number; updated: number; failed: number }>;

  /**
   * Handle webhook from the platform
   * @param topic Webhook topic
   * @param shop Shop identifier
   * @param data Webhook payload
   */
  abstract handleWebhook(topic: string, shop: string, data: Record<string, any>): Promise<void>;
}
