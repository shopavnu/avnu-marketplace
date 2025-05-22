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
exports.QueueDashboardModule = void 0;
const common_1 = require('@nestjs/common');
const bull_1 = require('@nestjs/bull');
const core_1 = require('@nestjs/core');
const api_1 = require('@bull-board/api');
const bullAdapter_1 = require('@bull-board/api/bullAdapter');
const express_1 = require('@bull-board/express');
const config_1 = require('@nestjs/config');
const scalability_module_1 = require('../utils/scalability.module');
let QueueDashboardModule = class QueueDashboardModule {};
exports.QueueDashboardModule = QueueDashboardModule;
exports.QueueDashboardModule = QueueDashboardModule = __decorate(
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
          }),
        }),
        bull_1.BullModule.registerQueue({
          name: 'shopify-webhooks',
        }),
        core_1.RouterModule.register([
          {
            path: 'admin/queues',
            module: QueueDashboardModule,
          },
        ]),
        scalability_module_1.ShopifyScalabilityModule,
      ],
      controllers: [],
      providers: [
        {
          provide: 'BULL_BOARD',
          useFactory: configService => {
            const serverAdapter = new express_1.ExpressAdapter();
            serverAdapter.setBasePath('/admin/queues');
            (0, api_1.createBullBoard)({
              queues: [
                new bullAdapter_1.BullAdapter(configService.get('bull_shopify_webhooks_queue')),
              ],
              serverAdapter,
            });
            return serverAdapter;
          },
          inject: [config_1.ConfigService],
        },
      ],
    }),
  ],
  QueueDashboardModule,
);
//# sourceMappingURL=queue-dashboard.module.js.map
