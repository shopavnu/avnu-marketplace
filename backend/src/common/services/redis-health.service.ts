import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  private readonly logger = new Logger(RedisHealthService.name);
  private readonly healthCheckKey = 'health:redis:check';
  private readonly healthCheckValue = 'OK';
  private readonly healthCheckTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    this.healthCheckTTL = this.configService.get<number>('REDIS_HEALTH_CHECK_TTL', 60); // 60 seconds
    // Debug log for cacheManager store
    console.log('[ioredis DEBUG] RedisHealthService constructed. cacheManager.store type:', typeof this.cacheManager.store);
    // Type guard and safe cast for debug logging only
    const storeAny = this.cacheManager.store as any;
    if (storeAny && typeof storeAny.getClient === 'function') {
      const client = storeAny.getClient();
      if (client && client.constructor) {
        console.log('[ioredis DEBUG] RedisHealthService underlying client constructor:', client.constructor.name);
      }
    }
  }

  async onModuleInit() {
    // Perform initial health check
    await this.checkHealth();
  }

  /**
   * Check Redis health by performing a simple set/get operation
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try to set a value in Redis
      await this.cacheManager.set(this.healthCheckKey, this.healthCheckValue, this.healthCheckTTL);

      // Try to get the value back
      const value = await this.cacheManager.get(this.healthCheckKey);

      // Check if the value matches
      const isHealthy = value === this.healthCheckValue;

      if (isHealthy) {
        this.logger.debug('Redis health check passed');
        this.eventEmitter.emit('redis.health.success');
      } else {
        this.logger.warn('Redis health check failed: value mismatch');
        this.eventEmitter.emit('redis.health.failure');
      }

      return isHealthy;
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error.message}`, error.stack);
      this.eventEmitter.emit('redis.health.failure', error);
      return false;
    }
  }

  /**
   * Handle circuit breaker health check request
   */
  @OnEvent('circuit.healthcheck.request')
  async handleHealthCheckRequest(payload: { service: string }): Promise<void> {
    if (payload.service === 'redis') {
      const isHealthy = await this.checkHealth();

      if (isHealthy) {
        this.eventEmitter.emit('circuit.healthcheck.success', { service: 'redis' });
      } else {
        this.eventEmitter.emit('circuit.healthcheck.failure', { service: 'redis' });
      }
    }
  }

  /**
   * Ping Redis to check if it's reachable
   */
  async ping(): Promise<boolean> {
    try {
      // Use a raw Redis client operation if available
      // For cache-manager-redis-store, we can use the store's client
      const store = this.cacheManager.store as any;

      if (store && store.getClient) {
        const client = store.getClient();
        if (client && client.ping) {
          const result = await client.ping();
          return result === 'PONG';
        }
      }

      // Fallback to our standard health check
      return this.checkHealth();
    } catch (error) {
      this.logger.error(`Redis ping failed: ${error.message}`, error.stack);
      return false;
    }
  }
}
