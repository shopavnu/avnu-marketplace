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
exports.WebhookQueueModule = void 0;
const common_1 = require('@nestjs/common');
const bull_1 = require('@nestjs/bull');
const config_1 = require('@nestjs/config');
const distributed_webhook_processor_1 = require('./distributed-webhook-processor');
let WebhookQueueModule = class WebhookQueueModule {};
exports.WebhookQueueModule = WebhookQueueModule;
exports.WebhookQueueModule = WebhookQueueModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        bull_1.BullModule.forRootAsync({
          imports: [config_1.ConfigModule],
          inject: [config_1.ConfigService],
          useFactory: configService => ({
            redis: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
              password: configService.get('REDIS_PASSWORD', ''),
              db: configService.get('REDIS_QUEUE_DB', 1),
            },
            prefix: 'shopify:',
            defaultJobOptions: {
              removeOnComplete: 100,
              removeOnFail: 1000,
            },
          }),
        }),
        bull_1.BullModule.registerQueue({
          name: 'shopify-webhooks',
          limiter: {
            max: 200,
            duration: 1000,
            bounceBack: false,
          },
        }),
      ],
      providers: [distributed_webhook_processor_1.DistributedWebhookProcessor],
      exports: [distributed_webhook_processor_1.DistributedWebhookProcessor],
    }),
  ],
  WebhookQueueModule,
);
//# sourceMappingURL=webhook-queue.module.js.map
