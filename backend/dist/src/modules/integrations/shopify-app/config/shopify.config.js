'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.shopifyConfig = void 0;
const config_1 = require('@nestjs/config');
exports.shopifyConfig = (0, config_1.registerAs)('shopify', () => ({
  apiKey: process.env.SHOPIFY_API_KEY || 'YOUR_SHOPIFY_API_KEY',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || 'YOUR_SHOPIFY_API_SECRET',
  apiVersion: process.env.SHOPIFY_API_VERSION || '2023-07',
  scopes: process.env.SHOPIFY_SCOPES || 'read_products,write_products,read_orders',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET',
  hostName: process.env.HOST_NAME || 'localhost:3000',
  authCallbackPath: '/api/integrations/shopify/callback',
  maxRetries: parseInt(process.env.SHOPIFY_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.SHOPIFY_RETRY_DELAY || '1000', 10),
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
//# sourceMappingURL=shopify.config.js.map
