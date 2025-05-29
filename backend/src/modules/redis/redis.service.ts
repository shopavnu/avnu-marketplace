import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import client from '../../redisClient';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  get client() {
    return client;
  }

  async onModuleInit() {
    if (!client.isOpen) {
      await client.connect();
    }
  }

  async onModuleDestroy() {
    if (client.isOpen) {
      await client.disconnect();
    }
  }
}
