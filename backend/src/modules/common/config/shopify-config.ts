/**
 * Centralized configuration for the Shopify integration
 * This file contains all configuration settings for the Shopify integration
 */

import { registerAs } from '@nestjs/config';
import { env } from 'process';

/**
 * Constants for Shopify integration
 */
export const SHOPIFY_CONSTANTS = {
  INJECTION_TOKENS: {
    SHOPIFY_CLIENT_SERVICE: 'SHOPIFY_CLIENT_SERVICE',
    SHOPIFY_AUTH_SERVICE: 'SHOPIFY_AUTH_SERVICE',
    SHOPIFY_PRODUCT_SERVICE: 'SHOPIFY_PRODUCT_SERVICE',
    SHOPIFY_ORDER_SERVICE: 'SHOPIFY_ORDER_SERVICE',
    SHOPIFY_CUSTOMER_SERVICE: 'SHOPIFY_CUSTOMER_SERVICE',
    SHOPIFY_FULFILLMENT_SERVICE: 'SHOPIFY_FULFILLMENT_SERVICE',
    SHOPIFY_WEBHOOK_SERVICE: 'SHOPIFY_WEBHOOK_SERVICE',
    SHOPIFY_BULK_OPERATION_SERVICE: 'SHOPIFY_BULK_OPERATION_SERVICE',
  },
};

/**
 * Default GraphQL queries and mutations
 */
export const DEFAULT_GRAPHQL_QUERIES = {
  // Webhook registration mutation
  REGISTER_WEBHOOK: `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
          format
          topic
        }
      }
    }
  `,

  // Get all webhook subscriptions
  GET_WEBHOOKS: `
    query {
      webhookSubscriptions(first: 100) {
        edges {
          node {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
            format
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
};

/**
 * Configuration factory for Shopify integration
 * Use environment variables for sensitive information
 */
export const shopifyConfig = registerAs('shopify', () => ({
  // Include GraphQL queries in the configuration
  DEFAULT_GRAPHQL_QUERIES,

  // Add encryption key for secure token storage
  auth: {
    encryptionKey: env['ENCRYPTION_KEY'] || undefined,
    callbackUrl: env['APP_URL']
      ? `${env['APP_URL']}/auth/shopify/callback`
      : 'https://api.avnumarketplace.com/auth/shopify/callback',
    embedded: true,
    session: {
      secret: env['SESSION_SECRET'] || 'avnu-marketplace-session-secret',
      secure: env['NODE_ENV'] === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  /**
   * Shopify API credentials
   */
  api: {
    key: env['SHOPIFY_API_KEY'],
    secret: env['SHOPIFY_API_SECRET'],
    version: '2025-01', // Current API version
    scopes: [
      // Standard scopes
      'read_products',
      'write_products',
      'read_orders',
      'write_orders',
      'read_inventory',
      'write_inventory',
      'read_fulfillments',
      'write_fulfillments',
      'read_customers',
      'write_customers',
      'read_shipping',
      'write_shipping',

      // Fulfillment hold scopes (2025-01)
      'read_merchant_managed_fulfillment_orders',
      'write_merchant_managed_fulfillment_orders',
      'read_assigned_fulfillment_orders',
      'write_assigned_fulfillment_orders',
      'read_third_party_fulfillment_orders',
      'write_third_party_fulfillment_orders',
      'read_marketplace_fulfillment_orders',
      'write_marketplace_fulfillment_orders',
    ].join(','),
  },

  /**
   * Webhook configuration
   */
  webhooks: {
    // Base URL for webhook endpoints
    baseUrl: env['APP_URL']
      ? `${env['APP_URL']}/webhooks/shopify`
      : 'https://api.avnumarketplace.com/webhooks/shopify',

    // Required webhook topics to register
    topics: [
      'app/uninstalled',
      'products/create',
      'products/update',
      'products/delete',
      'orders/create',
      'orders/updated',
      'orders/cancelled',
      'orders/fulfilled',
      'orders/paid',
      'fulfillments/create',
      'fulfillments/update',
      'inventory_levels/update',
      'customers/create',
      'customers/update',
      'customer_tags/added',
      'customer_tags/removed',
      'customers/email_marketing_consent_update',
    ],

    // Priority settings for each topic
    priority: {
      'products/create': { priority: 'normal' },
      'products/update': { priority: 'normal' },
      'products/delete': { priority: 'normal' },
      'orders/create': { priority: 'high' },
      'orders/updated': { priority: 'high' },
      'orders/cancelled': { priority: 'high' },
      'orders/fulfilled': { priority: 'high' },
      'orders/paid': { priority: 'high' },
      'fulfillments/create': { priority: 'high' },
      'fulfillments/update': { priority: 'high' },
      'inventory_levels/update': { priority: 'high' },
      'app/uninstalled': { priority: 'critical' },
    },
  },

  // Authentication configuration is defined above

  /**
   * Fulfillment service configuration
   */
  fulfillment: {
    // Service name displayed in Shopify
    serviceName: 'Avnu Marketplace Fulfillment',

    // Callback URL for fulfillment requests
    callbackUrl: env['APP_URL']
      ? `${env['APP_URL']}/fulfillment/callback`
      : 'https://api.avnumarketplace.com/fulfillment/callback',

    // Fulfillment service configuration
    service: {
      name: 'Avnu Marketplace Fulfillment',
      handle: 'avnu_marketplace_fulfillment',
      callback_url: env['APP_URL']
        ? `${env['APP_URL']}/fulfillment/callback`
        : 'https://api.avnumarketplace.com/fulfillment/callback',
      inventory_management: true,
      tracking_support: true,
      requires_shipping_method: false,
      format: 'json',
    },

    // Shipping rates configuration
    shipping: {
      calculationMethod: 'static', // 'static' or 'dynamic'
      staticRates: [
        {
          name: 'Standard Shipping',
          price: '5.00',
          currencyCode: 'USD',
          minDeliveryDays: 3,
          maxDeliveryDays: 7,
        },
        {
          name: 'Express Shipping',
          price: '15.00',
          currencyCode: 'USD',
          minDeliveryDays: 1,
          maxDeliveryDays: 3,
        },
      ],
    },

    // Order status mapping
    statusMapping: {
      pending: 'PENDING',
      processing: 'PROCESSING',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
    },

    // Notification settings
    notifications: {
      sendOrderConfirmation: true,
      sendShippingUpdates: true,
      sendFulfillmentUpdates: true,
    },
  },

  /**
   * Error handling configuration
   */
  errorHandling: {
    // Maximum retry attempts
    maxRetryAttempts: 3,

    // Retry backoff strategy (in milliseconds)
    retryBackoff: [1000, 5000, 15000],

    // Error notification thresholds
    notifyAdminOnErrors: true,
    errorEmailThreshold: 5,
    errorNotificationPeriod: 60 * 60 * 1000, // 1 hour
  },

  /**
   * Rate limiting configuration
   */
  rateLimiting: {
    // REST API rate limits
    rest: {
      maxRequestsPerSecond: 2,
      maxBurstRequests: 40,
    },

    // GraphQL rate limits (cost-based)
    graphql: {
      maxCostPerSecond: 50,
      maxCostPerHour: 1000 * 60 * 60, // 1000 points per minute
    },
  },

  /**
   * Monitoring and metrics
   */
  monitoring: {
    // Log API calls
    logApiCalls: env['NODE_ENV'] !== 'production',

    // Metrics collection
    collectMetrics: true,
    metricPrefix: 'shopify_integration_',
  },
}));

// Constants are already defined at the top of the file

/**
 * Additional GraphQL queries - we'll merge these with the main DEFAULT_GRAPHQL_QUERIES
 */
// Extend the existing queries with these additional ones
Object.assign(DEFAULT_GRAPHQL_QUERIES, {
  GET_SHOP: `
    query {
      shop {
        id
        name
        email
        primaryDomain {
          url
          host
        }
        myshopifyDomain
        primaryLocale
        address {
          address1
          address2
          city
          province
          provinceCode
          country
          countryCode
          zip
          phone
        }
        currencyCode
        ianaTimezone
        plan {
          displayName
          partnerDevelopment
          shopifyPlus
        }
        weightUnit
      }
    }
  `,

  REGISTER_WEBHOOK: `
    mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
          format
          topic
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `,

  GET_WEBHOOKS: `
    query {
      webhookSubscriptions(first: 100) {
        edges {
          node {
            id
            topic
            endpoint {
              __typename
              ... on WebhookHttpEndpoint {
                callbackUrl
              }
            }
            format
            createdAt
            updatedAt
          }
        }
      }
    }
  `,

  GET_BULK_OPERATION_STATUS: `
    query getBulkOperation($id: ID!) {
      node(id: $id) {
        ... on BulkOperation {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
          partialDataUrl
        }
      }
    }
  `,

  CREATE_FULFILLMENT_HOLD: `
    mutation fulfillmentOrderHold($fulfillmentOrderId: ID!, $reason: String!) {
      fulfillmentOrderHold(fulfillmentOrderId: $fulfillmentOrderId, reason: $reason) {
        fulfillmentOrder {
          id
          status
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `,

  GET_FULFILLMENT_HOLDS: `
    query getFulfillmentOrder($id: ID!) {
      fulfillmentOrder(id: $id) {
        holds {
          id
          reason
          heldByApp {
            id
            title
          }
        }
      }
    }
  `,

  RELEASE_FULFILLMENT_HOLD: `
    mutation fulfillmentOrderReleaseHold($fulfillmentOrderId: ID!, $holdId: ID!) {
      fulfillmentOrderReleaseHold(fulfillmentOrderId: $fulfillmentOrderId, holdId: $holdId) {
        fulfillmentOrder {
          id
          status
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `,

  UPDATE_ORDER_LOCALIZED_FIELDS: `
    mutation orderUpdate($input: OrderInput!) {
      orderUpdate(input: $input) {
        order {
          id
          localizedFields {
            keys
            values
            locale
          }
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `,
});
