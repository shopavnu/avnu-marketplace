import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis'; // Import Redis type from ioredis
import { createApplicationRedisClient } from '../../redisClient'; // Import the factory

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly _client: Redis;

  constructor(private readonly configService: ConfigService) {
    // The client is created in the constructor using the factory and ConfigService
    this._client = createApplicationRedisClient(this.configService);
  }

  async onModuleInit() {
    // Optional: If lazyConnect is false, or you want to ensure connection on init
    // await this._client.connect().catch(err => console.error('Failed to connect Redis onModuleInit', err));
  }

  async onModuleDestroy() {
    // Gracefully disconnect the client when the module is destroyed
    if (this._client) {
      await this._client.quit();
    }
  }

  get client(): Redis {
    return this._client;
  }
}
