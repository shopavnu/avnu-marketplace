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
exports.TestNlpModule = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const elasticsearch_1 = require('@nestjs/elasticsearch');
const nlp_module_1 = require('../src/modules/nlp/nlp.module');
const mock_search_service_1 = require('./mock-search.service');
let TestNlpModule = class TestNlpModule {};
exports.TestNlpModule = TestNlpModule;
exports.TestNlpModule = TestNlpModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        config_1.ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
        }),
        elasticsearch_1.ElasticsearchModule.register({
          node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
          auth: {
            username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
            password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
          },
        }),
        nlp_module_1.NlpModule,
      ],
      providers: [
        {
          provide: 'SearchService',
          useClass: mock_search_service_1.MockSearchService,
        },
      ],
      exports: ['SearchService'],
    }),
  ],
  TestNlpModule,
);
//# sourceMappingURL=test-nlp.module.js.map
