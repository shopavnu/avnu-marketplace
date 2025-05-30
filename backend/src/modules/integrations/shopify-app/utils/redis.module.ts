import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis factory provider for creating Redis clients
 *
 * This provider ensures consistent Redis configuration throughout the application
 * and allows for different Redis instances for different purposes (cache, queues, etc.)
 */
export const REDIS_CACHE_CLIENT = 'REDIS_CACHE_CLIENT';
export const REDIS_WEBHOOK_CLIENT = 'REDIS_WEBHOOK_CLIENT';
export const REDIS_QUEUE_CLIENT = 'REDIS_QUEUE_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // Redis Cache Client - Used for application caching
    {
      provide: REDIS_CACHE_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return createRedisClient(configService, {
          db: configService.get('REDIS_CACHE_DB', 0),
          keyPrefix: 'shopify:cache:',
          maxRetriesPerRequest: 3,
        });
      },
    },

    // Redis Webhook Client - Used for webhook deduplication and tracking
    {
      provide: REDIS_WEBHOOK_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return createRedisClient(configService, {
          db: configService.get('REDIS_WEBHOOK_DB', 2),
          keyPrefix: 'shopify:webhooks:',
          maxRetriesPerRequest: 2,
        });
      },
    },

    // Redis Queue Client - Used for Bull queues
    {
      provide: REDIS_QUEUE_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return createRedisClient(configService, {
          db: configService.get('REDIS_QUEUE_DB', 1),
          keyPrefix: 'shopify:queue:',
          maxRetriesPerRequest: 5,
          // Higher values for queue connection since it's critical
          connectTimeout: 10000, // 10 seconds
          retryStrategy(times) {
            return Math.min(times * 50, 2000); // Exponential backoff capped at 2s
          },
        });
      },
    },
  ],
  exports: [REDIS_CACHE_CLIENT, REDIS_WEBHOOK_CLIENT, REDIS_QUEUE_CLIENT],
})
export class RedisModule {}

/**
 * Create a Redis client with appropriate error handling and configuration
 */
function createRedisClient(configService: ConfigService, options: RedisOptions = {}): Redis {
  // Explicit debug log for REDIS_USERNAME
  console.log('[ioredis DEBUG] REDIS_USERNAME:', configService.get('REDIS_USERNAME'));

  const redisOptions: RedisOptions = {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    // Hardcoding username for Redis Cloud troubleshooting
    username: 'default',
    password: configService.get('REDIS_PASSWORD'), // do not default to empty string
    tls: configService.get('REDIS_TLS_ENABLED') === 'true' ? {} : undefined,
    reconnectOnError: err => {
      // Only reconnect on specific errors
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // This error occurs when connecting to a read-only Redis replica
        return true; // Auto-reconnect to find the primary
      }
      return false; // Don't auto-reconnect for other errors
    },
    // Default options that can be overridden
    lazyConnect: true, // Don't connect immediately
    enableOfflineQueue: true, // Queue commands when disconnected
    ...options,
  };

  // Debug log for RedisModule config
  console.log('[ioredis DEBUG] redis.module.ts loaded with options:', {
    host: redisOptions.host,
    port: redisOptions.port,
    db: redisOptions.db,
    keyPrefix: redisOptions.keyPrefix,
    username: redisOptions.username,
    passwordIsSet: !!redisOptions.password,
    tls: !!redisOptions.tls,
  });
  // Log the entire redisOptions for troubleshooting
  console.log('[ioredis DEBUG] Redis options:', redisOptions);

  // Debug log to verify Redis config (do not print actual password)
  console.log('[ioredis] Creating Redis client:', {
    host: redisOptions.host,
    port: redisOptions.port,
    db: redisOptions.db,
    keyPrefix: redisOptions.keyPrefix,
    username: redisOptions.username,
    passwordIsSet: !!redisOptions.password,
  });

  const client = new Redis(redisOptions);

  // Listen for connection events
  client.on('connect', () => {
    console.log(
      `Redis client connected to ${redisOptions.host}:${redisOptions.port}, DB: ${redisOptions.db}`,
    );
  });

  client.on('error', err => {
    console.error(`Redis client error: ${err.message}`, {
      host: redisOptions.host,
      port: redisOptions.port,
      db: redisOptions.db,
      keyPrefix: redisOptions.keyPrefix,
    });
  });

  client.on('ready', () => {
    console.log(`Redis client ready (DB: ${redisOptions.db})`);
  });

  return client;
}
