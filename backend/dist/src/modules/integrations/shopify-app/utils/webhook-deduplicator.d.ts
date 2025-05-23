import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
export declare class ShopifyWebhookDeduplicator {
    private configService;
    private readonly redisClient;
    private readonly logger;
    private readonly useRedis;
    private readonly processingWindowMs;
    private readonly memoryProcessed;
    constructor(configService: ConfigService, redisClient: Redis);
    isAlreadyProcessed(webhookId: string): Promise<boolean>;
    markAsProcessed(webhookId: string, metadata?: Record<string, any>): Promise<void>;
    processWithDeduplication<T>(webhookId: string, processor: () => Promise<T>, metadata?: Record<string, any>): Promise<T | undefined>;
    private isProcessedRedis;
    private markProcessedRedis;
    private isProcessedMemory;
    private markProcessedMemory;
    private cleanupMemoryStorage;
    private getRedisKey;
    getProcessedInfo(webhookId: string): Promise<Record<string, any> | null>;
}
