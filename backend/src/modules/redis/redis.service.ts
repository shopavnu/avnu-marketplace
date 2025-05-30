import { Injectable } from '@nestjs/common';
import client from '../../redisClient';

console.log('[ioredis DEBUG] RedisService using ioredis client from redisClient.ts');

@Injectable()
export class RedisService {
  get client() {
    return client;
  }
}
