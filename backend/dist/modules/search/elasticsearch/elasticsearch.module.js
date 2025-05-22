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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ElasticsearchConfigModule = void 0;
const common_1 = require('@nestjs/common');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const config_1 = require('@nestjs/config');
const indices_config_1 = require('./indices.config');
const logger_service_1 = require('../../../common/services/logger.service');
let ElasticsearchConfigModule = class ElasticsearchConfigModule {
  constructor(indicesConfigService, logger) {
    this.indicesConfigService = indicesConfigService;
    this.logger = logger;
    this.logger.setContext('ElasticsearchConfigModule');
  }
  async onModuleInit() {
    try {
      this.logger.log('Initializing Elasticsearch indices...');
      await this.indicesConfigService.initIndices();
      this.logger.log('Elasticsearch indices initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Elasticsearch indices: ${error.message}`,
        error.stack,
      );
    }
  }
};
exports.ElasticsearchConfigModule = ElasticsearchConfigModule;
exports.ElasticsearchConfigModule = ElasticsearchConfigModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        elasticsearch_1.ElasticsearchModule.registerAsync({
          imports: [config_1.ConfigModule],
          useFactory: async configService => ({
            node: configService.get('ELASTICSEARCH_NODE') || 'http://localhost:9200',
            auth: {
              username: configService.get('ELASTICSEARCH_USERNAME') || '',
              password: configService.get('ELASTICSEARCH_PASSWORD') || '',
            },
            tls: {
              rejectUnauthorized: false,
            },
            maxRetries: 10,
            requestTimeout: 60000,
          }),
          inject: [config_1.ConfigService],
        }),
      ],
      providers: [indices_config_1.IndicesConfigService, logger_service_1.LoggerService],
      exports: [elasticsearch_1.ElasticsearchModule, indices_config_1.IndicesConfigService],
    }),
    __metadata('design:paramtypes', [
      indices_config_1.IndicesConfigService,
      logger_service_1.LoggerService,
    ]),
  ],
  ElasticsearchConfigModule,
);
//# sourceMappingURL=elasticsearch.module.js.map
