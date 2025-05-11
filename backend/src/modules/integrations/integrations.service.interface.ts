// @ts-strict-mode: enabled
import { IntegrationType } from './types/integration-type.enum';

/**
 * Interface definitions for the integrations module
 * 
 * This file defines the core interfaces used throughout the integrations module,
 * providing a single source of truth for type definitions related to platform integrations.
 * 
 * These interfaces ensure consistent type usage across the codebase and improve type safety
 * when working with third-party platform integrations like Shopify and WooCommerce.
 */

/**
 * Interface for integration credentials
 * Used to handle authentication details for different e-commerce platforms
 */
export interface IntegrationCredentials {
  shopify?: ShopifyCredentials;
  woocommerce?: WooCommerceCredentials;
  // Add fields for any platform-specific credential needs
}

/**
 * Shopify-specific credentials
 */
export interface ShopifyCredentials {
  shopDomain: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
}

/**
 * WooCommerce-specific credentials
 */
export interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  version?: string;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
  errors?: string[];
}

/**
 * Interface for the integration service
 */
export interface IntegrationsService {
  /**
   * Authenticate with a platform
   */
  authenticate(type: IntegrationType, credentials: IntegrationCredentials): Promise<boolean>;

  /**
   * Sync products from a platform
   */
  syncProducts(
    type: IntegrationType,
    credentials: IntegrationCredentials,
    merchantId: string
  ): Promise<SyncResult>;

  /**
   * Handle webhook from a platform
   */
  handleWebhook(
    type: IntegrationType,
    payload: Record<string, unknown>,
    topic: string,
    merchantId: string
  ): Promise<boolean>;
}
