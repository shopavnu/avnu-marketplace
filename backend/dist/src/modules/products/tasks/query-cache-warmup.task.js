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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var QueryCacheWarmupTask_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.QueryCacheWarmupTask = void 0;
const common_1 = require('@nestjs/common');
const schedule_1 = require('@nestjs/schedule');
const product_query_optimizer_service_1 = require('../services/product-query-optimizer.service');
let QueryCacheWarmupTask = (QueryCacheWarmupTask_1 = class QueryCacheWarmupTask {
  constructor(queryOptimizerService) {
    this.queryOptimizerService = queryOptimizerService;
    this.logger = new common_1.Logger(QueryCacheWarmupTask_1.name);
  }
  async warmupQueryCache() {
    this.logger.log('Starting scheduled query cache warmup');
    try {
      await this.queryOptimizerService.warmupQueryCache();
      this.logger.log('Scheduled query cache warmup completed successfully');
    } catch (error) {
      this.logger.error(`Error during query cache warmup: ${error.message}`, error.stack);
    }
  }
});
exports.QueryCacheWarmupTask = QueryCacheWarmupTask;
__decorate(
  [
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  QueryCacheWarmupTask.prototype,
  'warmupQueryCache',
  null,
);
exports.QueryCacheWarmupTask =
  QueryCacheWarmupTask =
  QueryCacheWarmupTask_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          product_query_optimizer_service_1.ProductQueryOptimizerService,
        ]),
      ],
      QueryCacheWarmupTask,
    );
//# sourceMappingURL=query-cache-warmup.task.js.map
