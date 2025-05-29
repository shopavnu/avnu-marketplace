import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

client.on('error', err => {
  console.log('Redis Client Error', err);
});

export default client;
