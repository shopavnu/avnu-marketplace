import { registerAs } from '@nestjs/config';

/**
 * Shopify configuration options
 * These can be set via environment variables to make deployment more flexible
 */
export const shopifyConfig = registerAs('shopify', () => ({
  // API credentials
  apiKey: process.env.SHOPIFY_API_KEY || 'YOUR_SHOPIFY_API_KEY',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || 'YOUR_SHOPIFY_API_SECRET',

  // API version to use (update this regularly)
  apiVersion: process.env.SHOPIFY_API_VERSION || '2023-07',

  // Scopes required for the app
  scopes: process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders',

  // Webhook settings
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET',

  // Callback URLs
  hostName: process.env.HOST_NAME || 'localhost:3000',
  authCallbackPath: '/api/integrations/shopify/callback',

  // Rate limiting settings
  maxRetries: parseInt(process.env.SHOPIFY_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.SHOPIFY_RETRY_DELAY || '1000', 10),

  // Webhook topics to register
  webhookTopics: [
    'products/create',
    'products/update',
    'products/delete',
    'orders/create',
    'orders/updated',
    'orders/cancelled',
    'inventory_items/update',
  ],
}));
