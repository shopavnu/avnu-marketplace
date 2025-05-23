import { OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
export declare class RedisHealthService implements OnModuleInit {
    private cacheManager;
    private readonly eventEmitter;
    private readonly configService;
    private readonly logger;
    private readonly healthCheckKey;
    private readonly healthCheckValue;
    private readonly healthCheckTTL;
    constructor(cacheManager: Cache, eventEmitter: EventEmitter2, configService: ConfigService);
    onModuleInit(): Promise<void>;
    checkHealth(): Promise<boolean>;
    handleHealthCheckRequest(payload: {
        service: string;
    }): Promise<void>;
    ping(): Promise<boolean>;
}
