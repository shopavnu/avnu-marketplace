import Redis, { RedisOptions } from 'ioredis';
import { Logger } from '@nestjs/common'; // Ensure Logger is imported if not already

const logger = new Logger('RedisClient');

// Raw environment variables
const rawRedisHost = process.env.REDIS_HOST;
const rawRedisPort = process.env.REDIS_PORT;
const rawRedisUsername = process.env.REDIS_USERNAME;
const rawRedisPassword = process.env.REDIS_PASSWORD; // For checking presence
const rawRedisTlsEnabled = process.env.REDIS_TLS_ENABLED;

// Log raw values for debugging
logger.log(`Raw REDIS_HOST: ${rawRedisHost}`);
logger.log(`Raw REDIS_PORT: ${rawRedisPort}`);
logger.log(`Raw REDIS_USERNAME: ${rawRedisUsername}`);
logger.log(`Raw REDIS_PASSWORD is set: ${!!rawRedisPassword}`);
logger.log(`Raw REDIS_TLS_ENABLED: "${rawRedisTlsEnabled}", type: ${typeof rawRedisTlsEnabled}`);

// Robust parsing for REDIS_TLS_ENABLED
const enableTls =
  typeof rawRedisTlsEnabled === 'string' && rawRedisTlsEnabled.toLowerCase().trim() === 'true';

logger.log(`Parsed enableTls: ${enableTls}`);

const redisOptions: RedisOptions = {
  host: rawRedisHost,
  port: Number(rawRedisPort),
  username: rawRedisUsername || 'default', // Fallback to 'default' if not provided
  password: rawRedisPassword,
  tls: enableTls ? {} : undefined,
  lazyConnect: true,
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3, // Optional: helps with transient network issues
  connectTimeout: 15000, // Optional: increased timeout
  // It might be useful to add a name for the connection for logging/debugging purposes in Redis itself
  // connectionName: `avnu-marketplace-backend-${process.env.NODE_ENV || 'unknown'}`,
};

// Log the options that will be used (mask password)
const loggableOptions = {
  ...redisOptions,
  password: redisOptions.password ? '********' : undefined,
};
logger.log('Attempting to connect to Redis with options:');
logger.log(JSON.stringify(loggableOptions, null, 2));

const redisClient = new Redis(redisOptions);

redisClient.on('connect', () => {
  logger.log('Successfully connected to Redis.');
});

redisClient.on('error', err => {
  logger.error('Redis connection error:', err.message);
  // Log the options again on error to correlate with failure
  logger.error('Redis options at time of error: ' + JSON.stringify(loggableOptions, null, 2));
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client is reconnecting...');
});

export default redisClient;
