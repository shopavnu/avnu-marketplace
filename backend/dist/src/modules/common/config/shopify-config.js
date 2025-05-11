'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.shopifyConfig = exports.DEFAULT_GRAPHQL_QUERIES = exports.SHOPIFY_CONSTANTS = void 0;
const config_1 = require('@nestjs/config');
const process_1 = require('process');
exports.SHOPIFY_CONSTANTS = {
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
exports.DEFAULT_GRAPHQL_QUERIES = {
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
exports.shopifyConfig = (0, config_1.registerAs)('shopify', () => ({
  DEFAULT_GRAPHQL_QUERIES: exports.DEFAULT_GRAPHQL_QUERIES,
  auth: {
    encryptionKey: process_1.env['ENCRYPTION_KEY'] || undefined,
    callbackUrl: process_1.env['APP_URL']
      ? `${process_1.env['APP_URL']}/auth/shopify/callback`
      : 'https://api.avnumarketplace.com/auth/shopify/callback',
    embedded: true,
    session: {
      secret: process_1.env['SESSION_SECRET'] || 'avnu-marketplace-session-secret',
      secure: process_1.env['NODE_ENV'] === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    },
  },
  api: {
    key: process_1.env['SHOPIFY_API_KEY'],
    secret: process_1.env['SHOPIFY_API_SECRET'],
    version: '2025-01',
    scopes: [
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
  webhooks: {
    baseUrl: process_1.env['APP_URL']
      ? `${process_1.env['APP_URL']}/webhooks/shopify`
      : 'https://api.avnumarketplace.com/webhooks/shopify',
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
  fulfillment: {
    serviceName: 'Avnu Marketplace Fulfillment',
    callbackUrl: process_1.env['APP_URL']
      ? `${process_1.env['APP_URL']}/fulfillment/callback`
      : 'https://api.avnumarketplace.com/fulfillment/callback',
    service: {
      name: 'Avnu Marketplace Fulfillment',
      handle: 'avnu_marketplace_fulfillment',
      callback_url: process_1.env['APP_URL']
        ? `${process_1.env['APP_URL']}/fulfillment/callback`
        : 'https://api.avnumarketplace.com/fulfillment/callback',
      inventory_management: true,
      tracking_support: true,
      requires_shipping_method: false,
      format: 'json',
    },
    shipping: {
      calculationMethod: 'static',
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
    statusMapping: {
      pending: 'PENDING',
      processing: 'PROCESSING',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
    },
    notifications: {
      sendOrderConfirmation: true,
      sendShippingUpdates: true,
      sendFulfillmentUpdates: true,
    },
  },
  errorHandling: {
    maxRetryAttempts: 3,
    retryBackoff: [1000, 5000, 15000],
    notifyAdminOnErrors: true,
    errorEmailThreshold: 5,
    errorNotificationPeriod: 60 * 60 * 1000,
  },
  rateLimiting: {
    rest: {
      maxRequestsPerSecond: 2,
      maxBurstRequests: 40,
    },
    graphql: {
      maxCostPerSecond: 50,
      maxCostPerHour: 1000 * 60 * 60,
    },
  },
  monitoring: {
    logApiCalls: process_1.env['NODE_ENV'] !== 'production',
    collectMetrics: true,
    metricPrefix: 'shopify_integration_',
  },
}));
Object.assign(exports.DEFAULT_GRAPHQL_QUERIES, {
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
//# sourceMappingURL=shopify-config.js.map
