export declare const SHOPIFY_CONSTANTS: {
    INJECTION_TOKENS: {
        SHOPIFY_CLIENT_SERVICE: string;
        SHOPIFY_AUTH_SERVICE: string;
        SHOPIFY_PRODUCT_SERVICE: string;
        SHOPIFY_ORDER_SERVICE: string;
        SHOPIFY_CUSTOMER_SERVICE: string;
        SHOPIFY_FULFILLMENT_SERVICE: string;
        SHOPIFY_WEBHOOK_SERVICE: string;
        SHOPIFY_BULK_OPERATION_SERVICE: string;
    };
};
export declare const DEFAULT_GRAPHQL_QUERIES: {
    REGISTER_WEBHOOK: string;
    GET_WEBHOOKS: string;
};
export declare const shopifyConfig: (() => {
    DEFAULT_GRAPHQL_QUERIES: {
        REGISTER_WEBHOOK: string;
        GET_WEBHOOKS: string;
    };
    auth: {
        encryptionKey: string;
        callbackUrl: string;
        embedded: boolean;
        session: {
            secret: string;
            secure: boolean;
            sameSite: string;
            maxAge: number;
        };
    };
    api: {
        key: string;
        secret: string;
        version: string;
        scopes: string;
    };
    webhooks: {
        baseUrl: string;
        topics: string[];
        priority: {
            'products/create': {
                priority: string;
            };
            'products/update': {
                priority: string;
            };
            'products/delete': {
                priority: string;
            };
            'orders/create': {
                priority: string;
            };
            'orders/updated': {
                priority: string;
            };
            'orders/cancelled': {
                priority: string;
            };
            'orders/fulfilled': {
                priority: string;
            };
            'orders/paid': {
                priority: string;
            };
            'fulfillments/create': {
                priority: string;
            };
            'fulfillments/update': {
                priority: string;
            };
            'inventory_levels/update': {
                priority: string;
            };
            'app/uninstalled': {
                priority: string;
            };
        };
    };
    fulfillment: {
        serviceName: string;
        callbackUrl: string;
        service: {
            name: string;
            handle: string;
            callback_url: string;
            inventory_management: boolean;
            tracking_support: boolean;
            requires_shipping_method: boolean;
            format: string;
        };
        shipping: {
            calculationMethod: string;
            staticRates: {
                name: string;
                price: string;
                currencyCode: string;
                minDeliveryDays: number;
                maxDeliveryDays: number;
            }[];
        };
        statusMapping: {
            pending: string;
            processing: string;
            shipped: string;
            delivered: string;
            cancelled: string;
            refunded: string;
        };
        notifications: {
            sendOrderConfirmation: boolean;
            sendShippingUpdates: boolean;
            sendFulfillmentUpdates: boolean;
        };
    };
    errorHandling: {
        maxRetryAttempts: number;
        retryBackoff: number[];
        notifyAdminOnErrors: boolean;
        errorEmailThreshold: number;
        errorNotificationPeriod: number;
    };
    rateLimiting: {
        rest: {
            maxRequestsPerSecond: number;
            maxBurstRequests: number;
        };
        graphql: {
            maxCostPerSecond: number;
            maxCostPerHour: number;
        };
    };
    monitoring: {
        logApiCalls: boolean;
        collectMetrics: boolean;
        metricPrefix: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    DEFAULT_GRAPHQL_QUERIES: {
        REGISTER_WEBHOOK: string;
        GET_WEBHOOKS: string;
    };
    auth: {
        encryptionKey: string;
        callbackUrl: string;
        embedded: boolean;
        session: {
            secret: string;
            secure: boolean;
            sameSite: string;
            maxAge: number;
        };
    };
    api: {
        key: string;
        secret: string;
        version: string;
        scopes: string;
    };
    webhooks: {
        baseUrl: string;
        topics: string[];
        priority: {
            'products/create': {
                priority: string;
            };
            'products/update': {
                priority: string;
            };
            'products/delete': {
                priority: string;
            };
            'orders/create': {
                priority: string;
            };
            'orders/updated': {
                priority: string;
            };
            'orders/cancelled': {
                priority: string;
            };
            'orders/fulfilled': {
                priority: string;
            };
            'orders/paid': {
                priority: string;
            };
            'fulfillments/create': {
                priority: string;
            };
            'fulfillments/update': {
                priority: string;
            };
            'inventory_levels/update': {
                priority: string;
            };
            'app/uninstalled': {
                priority: string;
            };
        };
    };
    fulfillment: {
        serviceName: string;
        callbackUrl: string;
        service: {
            name: string;
            handle: string;
            callback_url: string;
            inventory_management: boolean;
            tracking_support: boolean;
            requires_shipping_method: boolean;
            format: string;
        };
        shipping: {
            calculationMethod: string;
            staticRates: {
                name: string;
                price: string;
                currencyCode: string;
                minDeliveryDays: number;
                maxDeliveryDays: number;
            }[];
        };
        statusMapping: {
            pending: string;
            processing: string;
            shipped: string;
            delivered: string;
            cancelled: string;
            refunded: string;
        };
        notifications: {
            sendOrderConfirmation: boolean;
            sendShippingUpdates: boolean;
            sendFulfillmentUpdates: boolean;
        };
    };
    errorHandling: {
        maxRetryAttempts: number;
        retryBackoff: number[];
        notifyAdminOnErrors: boolean;
        errorEmailThreshold: number;
        errorNotificationPeriod: number;
    };
    rateLimiting: {
        rest: {
            maxRequestsPerSecond: number;
            maxBurstRequests: number;
        };
        graphql: {
            maxCostPerSecond: number;
            maxCostPerHour: number;
        };
    };
    monitoring: {
        logApiCalls: boolean;
        collectMetrics: boolean;
        metricPrefix: string;
    };
}>;
