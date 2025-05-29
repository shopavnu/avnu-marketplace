import { createClient } from 'redis';

// Debug log to verify Redis env vars (do not print actual password)
console.log('[Redis Client] REDIS_HOST:', process.env.REDIS_HOST);
console.log('[Redis Client] REDIS_PORT:', process.env.REDIS_PORT);
console.log('[Redis Client] REDIS_PASSWORD is set:', !!process.env.REDIS_PASSWORD);
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

client.on('error', err => {
  console.log('Redis Client Error', err);
});

export default client;
