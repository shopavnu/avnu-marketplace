import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

// Debug log to verify Redis env vars (do not print actual password)
console.log('[ioredis DEBUG] redisClient.ts loaded');
console.log('[ioredis DEBUG] REDIS_HOST:', process.env.REDIS_HOST);
console.log('[ioredis DEBUG] REDIS_PORT:', process.env.REDIS_PORT);
console.log('[ioredis DEBUG] REDIS_USERNAME:', process.env.REDIS_USERNAME);
console.log('[ioredis DEBUG] REDIS_PASSWORD is set:', !!process.env.REDIS_PASSWORD);
console.log('[ioredis DEBUG] REDIS_TLS_ENABLED:', process.env.REDIS_TLS_ENABLED);

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS_ENABLED === 'true' ? {} : undefined,
  lazyConnect: true,
  enableOfflineQueue: true,
};

const { password: _password, ...optionsToLog } = redisOptions; // Destructure to remove password
console.log('[ioredis DEBUG] redisClient.ts options:', {
  ...optionsToLog,
  passwordIsSet: !!_password, // Log whether password string exists
});

const client = new Redis(redisOptions);

client.on('error', err => {
  console.error('[ioredis DEBUG] Redis Client Error', err);
});

export default client;
