'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.RedisModule =
  exports.REDIS_QUEUE_CLIENT =
  exports.REDIS_WEBHOOK_CLIENT =
  exports.REDIS_CACHE_CLIENT =
    void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const ioredis_1 = require('ioredis');
exports.REDIS_CACHE_CLIENT = 'REDIS_CACHE_CLIENT';
exports.REDIS_WEBHOOK_CLIENT = 'REDIS_WEBHOOK_CLIENT';
exports.REDIS_QUEUE_CLIENT = 'REDIS_QUEUE_CLIENT';
let RedisModule = class RedisModule {};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate(
  [
    (0, common_1.Global)(),
    (0, common_1.Module)({
      imports: [config_1.ConfigModule],
      providers: [
        {
          provide: exports.REDIS_CACHE_CLIENT,
          inject: [config_1.ConfigService],
          useFactory: async configService => {
            return createRedisClient(configService, {
              db: configService.get('REDIS_CACHE_DB', 0),
              keyPrefix: 'shopify:cache:',
              maxRetriesPerRequest: 3,
            });
          },
        },
        {
          provide: exports.REDIS_WEBHOOK_CLIENT,
          inject: [config_1.ConfigService],
          useFactory: async configService => {
            return createRedisClient(configService, {
              db: configService.get('REDIS_WEBHOOK_DB', 2),
              keyPrefix: 'shopify:webhooks:',
              maxRetriesPerRequest: 2,
            });
          },
        },
        {
          provide: exports.REDIS_QUEUE_CLIENT,
          inject: [config_1.ConfigService],
          useFactory: async configService => {
            return createRedisClient(configService, {
              db: configService.get('REDIS_QUEUE_DB', 1),
              keyPrefix: 'shopify:queue:',
              maxRetriesPerRequest: 5,
              connectTimeout: 10000,
              retryStrategy(times) {
                return Math.min(times * 50, 2000);
              },
            });
          },
        },
      ],
      exports: [
        exports.REDIS_CACHE_CLIENT,
        exports.REDIS_WEBHOOK_CLIENT,
        exports.REDIS_QUEUE_CLIENT,
      ],
    }),
  ],
  RedisModule,
);
function createRedisClient(configService, options = {}) {
  const redisOptions = {
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD', ''),
    tls: configService.get('REDIS_TLS_ENABLED') === 'true' ? {} : undefined,
    reconnectOnError: err => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    lazyConnect: true,
    enableOfflineQueue: true,
    ...options,
  };
  const client = new ioredis_1.Redis(redisOptions);
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
//# sourceMappingURL=redis.module.js.map
