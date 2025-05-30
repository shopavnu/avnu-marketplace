import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

const {
  REDIS_HOST = 'localhost',
  REDIS_PORT = '6379',
  REDIS_USERNAME = '',
  REDIS_PASSWORD = '',
  REDIS_TLS_ENABLED = '',
} = process.env;

const port = parseInt(REDIS_PORT, 10);

const redisOptions: any = {
  host: REDIS_HOST,
  port,
  username: REDIS_USERNAME || undefined,
  password: REDIS_PASSWORD || undefined,
  lazyConnect: false,
  enableOfflineQueue: false,
};

if (REDIS_TLS_ENABLED === 'true') {
  redisOptions.tls = {};
}

console.log('[Redis Test] Connecting with options:', {
  host: redisOptions.host,
  port: redisOptions.port,
  username: redisOptions.username,
  password: !!redisOptions.password, // Do not log the actual password
  tls: !!redisOptions.tls,
});

const redis = new Redis(redisOptions);

redis.on('error', (err) => {
  // Avoid printing password in error logs
  console.error('[Redis Test] Connection error:', err.message);
  process.exit(1);
});

redis.on('ready', async () => {
  try {
    // Try a simple command
    await redis.set('redis_test_key', 'ok', 'EX', 10);
    const value = await redis.get('redis_test_key');
    if (value === 'ok') {
      console.log('[Redis Test] Connection and authentication successful!');
    } else {
      console.error('[Redis Test] Connected, but test key not found. Check permissions.');
    }
    await redis.quit();
    process.exit(0);
  } catch (err: any) {
    console.error('[Redis Test] Command error:', err.message);
    await redis.quit();
    process.exit(2);
  }
});
