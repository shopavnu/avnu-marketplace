import Redis, { RedisOptions } from 'ioredis';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Added

// Logger remains at the module level
const logger = new Logger('RedisClientFactory');

export function createApplicationRedisClient(configService: ConfigService): Redis {
  // Get Redis configuration using ConfigService
  const host = configService.get<string>('REDIS_HOST', 'localhost');
  const port = configService.get<number>('REDIS_PORT', 6379);
  const username = configService.get<string>('REDIS_USERNAME', 'default');
  const password = configService.get<string>('REDIS_PASSWORD');
  const tlsEnabledStr = configService.get<string>('REDIS_TLS_ENABLED', 'false');
  const enableTls = tlsEnabledStr?.toLowerCase().trim() === 'true';
  const db = configService.get<number>('REDIS_DB', 0);

  // Log raw values obtained from ConfigService for debugging
  logger.log(`Using REDIS_HOST: ${host}`);
  logger.log(`Using REDIS_PORT: ${port}`);
  logger.log(`Using REDIS_USERNAME: ${username}`);
  logger.log(`REDIS_PASSWORD is set: ${!!password}`);
  logger.log(`Using REDIS_TLS_ENABLED: ${enableTls} (raw string: "${tlsEnabledStr}")`);
  logger.log(`Using REDIS_DB: ${db}`);

  const redisOptions: RedisOptions = {
    host: host,
    port: port,
    username: username,
    password: password,
    db: db,
    tls: enableTls ? {} : undefined,
    lazyConnect: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 15000,
    // connectionName: `avnu-marketplace-backend-main-${process.env.NODE_ENV || 'unknown'}`,
  };

  const loggableOptions = {
    ...redisOptions,
    password: redisOptions.password ? '********' : undefined,
  };
  logger.log('Attempting to connect to Redis with options (from factory):');
  logger.log(JSON.stringify(loggableOptions, null, 2));

  const client = new Redis(redisOptions);

  client.on('connect', () => {
    logger.log('Successfully connected to Redis (from factory).');
  });

  client.on('error', err => {
    logger.error('Redis connection error (from factory):', err.message);
    logger.error(
      'Redis options at time of error (from factory): ' + JSON.stringify(loggableOptions, null, 2),
    );
  });

  client.on('reconnecting', () => {
    logger.warn('Redis client is reconnecting (from factory)...');
  });

  return client;
}
