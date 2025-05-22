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
var HealthController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.HealthController = void 0;
const common_1 = require('@nestjs/common');
const terminus_1 = require('@nestjs/terminus');
const config_1 = require('@nestjs/config');
const logger_service_1 = require('@common/services/logger.service');
let HealthController = (HealthController_1 = class HealthController {
  constructor(health, http, db, memory, configService, logger) {
    this.health = health;
    this.http = http;
    this.db = db;
    this.memory = memory;
    this.configService = configService;
    this.logger = logger;
    this.logger.setContext(HealthController_1.name);
  }
  async check() {
    this.logger.debug('Performing health check');
    return this.health
      .check([
        () => this.db.pingCheck('database'),
        () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
        () => this.http.pingCheck('elasticsearch', this.configService.get('ELASTICSEARCH_NODE')),
      ])
      .then(result => {
        this.logger.debug('Health check completed successfully');
        return result;
      })
      .catch(error => {
        this.logger.error(`Health check failed: ${error.message}`, error.stack);
        throw error;
      });
  }
});
exports.HealthController = HealthController;
__decorate(
  [
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  HealthController.prototype,
  'check',
  null,
);
exports.HealthController =
  HealthController =
  HealthController_1 =
    __decorate(
      [
        (0, common_1.Controller)('health'),
        __metadata('design:paramtypes', [
          terminus_1.HealthCheckService,
          terminus_1.HttpHealthIndicator,
          terminus_1.TypeOrmHealthIndicator,
          terminus_1.MemoryHealthIndicator,
          config_1.ConfigService,
          logger_service_1.LoggerService,
        ]),
      ],
      HealthController,
    );
//# sourceMappingURL=health.controller.js.map
