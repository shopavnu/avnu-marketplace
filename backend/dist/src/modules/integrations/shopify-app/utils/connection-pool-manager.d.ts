import { ConfigService } from '@nestjs/config';
type AxiosRequestConfig = any;
type AxiosResponse = any;
type AxiosInstance = any;
interface StoreConnectionState {
    currentCalls: number;
    maxCalls: number;
    resetAt: Date;
    pendingRequests: Array<{
        config: AxiosRequestConfig;
        resolve: (value: any) => void;
        reject: (reason: any) => void;
        priority: number;
        timestamp: number;
    }>;
    throttled: boolean;
    client: AxiosInstance;
}
export declare class ShopifyConnectionPoolManager {
    private configService;
    private readonly logger;
    private connectionsByStore;
    private readonly DEFAULT_MAX_CALLS;
    private readonly DEFAULT_WINDOW_MS;
    private readonly PRIORITY;
    constructor(configService: ConfigService);
    executeRequest(shopDomain: string, config: AxiosRequestConfig, priority?: number): Promise<AxiosResponse>;
    private processPendingRequests;
    private executeRequestImmediately;
    private initializeConnectionForStore;
    private updateRateLimitInfo;
    private handleRateLimitExceeded;
    getConnectionState(shopDomain: string): StoreConnectionState | undefined;
    getPriorities(): {
        CRITICAL: number;
        HIGH: number;
        MEDIUM: number;
        LOW: number;
        BACKGROUND: number;
    };
}
export {};
