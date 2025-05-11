'use strict';
var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
        context,
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppModule = void 0;
var common_1 = require('@nestjs/common');
var config_1 = require('@nestjs/config');
var typeorm_1 = require('@nestjs/typeorm');
var graphql_1 = require('@nestjs/graphql');
var apollo_1 = require('@nestjs/apollo');
var path_1 = require('path');
var cache_manager_1 = require('@nestjs/cache-manager');
var common_module_1 = require('@common/common.module');
var health_module_1 = require('./health/health.module');
// Import feature modules
var auth_module_1 = require('@modules/auth/auth.module');
var users_1 = require('@modules/users');
var products_1 = require('@modules/products');
var merchants_1 = require('@modules/merchants');
var orders_1 = require('@modules/orders');
var integrations_1 = require('@modules/integrations');
var search_1 = require('@modules/search');
var payments_1 = require('@modules/payments');
var shipping_1 = require('@modules/shipping');
var nlp_1 = require('@modules/nlp');
var personalization_1 = require('@modules/personalization');
var analytics_1 = require('@modules/analytics');
var ab_testing_1 = require('@modules/ab-testing');
// Enum registration for GraphQL
var graphql_2 = require('@nestjs/graphql');
var search_entity_type_enum_1 = require('./modules/search/enums/search-entity-type.enum');
var experiment_entity_1 = require('./modules/ab-testing/entities/experiment.entity');
// Register enums globally
(0, graphql_2.registerEnumType)(search_entity_type_enum_1.SearchEntityType, {
  name: 'SearchEntityType',
  description: 'The type of entity to search for (Product, Merchant, Brand, All)',
});
(0, graphql_2.registerEnumType)(experiment_entity_1.ExperimentStatus, {
  name: 'ExperimentStatus',
});
var AppModule = (function () {
  var _classDecorators = [
    (0, common_1.Module)({
      imports: [
        // Configuration
        config_1.ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.'.concat(process.env.NODE_ENV || 'development'),
        }),
        common_module_1.CommonModule,
        health_module_1.HealthModule,
        // Database
        typeorm_1.TypeOrmModule.forRootAsync({
          imports: [config_1.ConfigModule],
          inject: [config_1.ConfigService],
          useFactory: function (configService) {
            return {
              type: 'postgres',
              host: configService.get('DB_HOST', 'localhost'),
              port: configService.get('DB_PORT', 5432),
              username: configService.get('DB_USERNAME', 'postgres'),
              password: configService.get('DB_PASSWORD', 'postgres'),
              database: configService.get('DB_DATABASE', 'avnu_marketplace'),
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: configService.get('DB_SYNC', true),
              logging: configService.get('DB_LOGGING', true),
            };
          },
        }),
        // GraphQL
        graphql_1.GraphQLModule.forRoot({
          driver: apollo_1.ApolloDriver,
          autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: process.env.NODE_ENV !== 'production',
        }),
        // Redis Cache
        cache_manager_1.CacheModule.register({
          isGlobal: true,
          ttl: 60 * 60, // 1 hour
          max: 1000, // Maximum number of items in cache
        }),
        // Feature modules
        auth_module_1.AuthModule,
        users_1.UsersModule,
        products_1.ProductsModule,
        merchants_1.MerchantsModule,
        orders_1.OrdersModule,
        integrations_1.IntegrationsModule,
        search_1.SearchModule,
        payments_1.PaymentsModule,
        shipping_1.ShippingModule,
        nlp_1.NlpModule,
        personalization_1.PersonalizationModule,
        analytics_1.AnalyticsModule,
        ab_testing_1.AbTestingModule,
      ],
    }),
  ];
  var _classDescriptor;
  var _classExtraInitializers = [];
  var _classThis;
  var AppModule = (_classThis = /** @class */ (function () {
    function AppModule_1() {}
    return AppModule_1;
  })());
  __setFunctionName(_classThis, 'AppModule');
  (function () {
    var _metadata = typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
    __esDecorate(
      null,
      (_classDescriptor = { value: _classThis }),
      _classDecorators,
      { kind: 'class', name: _classThis.name, metadata: _metadata },
      null,
      _classExtraInitializers,
    );
    AppModule = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (AppModule = _classThis);
})();
exports.AppModule = AppModule;
