export declare const shopifyConfig: (() => {
    apiKey: string;
    apiSecretKey: string;
    apiVersion: string;
    scopes: string;
    webhookSecret: string;
    hostName: string;
    authCallbackPath: string;
    maxRetries: number;
    retryDelay: number;
    webhookTopics: string[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    apiKey: string;
    apiSecretKey: string;
    apiVersion: string;
    scopes: string;
    webhookSecret: string;
    hostName: string;
    authCallbackPath: string;
    maxRetries: number;
    retryDelay: number;
    webhookTopics: string[];
}>;
