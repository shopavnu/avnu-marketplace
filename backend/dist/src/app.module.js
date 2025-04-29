"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const cache_manager_1 = require("@nestjs/cache-manager");
const redisStore = require('cache-manager-redis-store').default;
const common_module_1 = require("./common/common.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_1 = require("./modules/users");
const products_1 = require("./modules/products");
const merchants_1 = require("./modules/merchants");
const categories_module_1 = require("./modules/categories/categories.module");
const orders_1 = require("./modules/orders");
const integrations_1 = require("./modules/integrations");
const search_1 = require("./modules/search");
const payments_1 = require("./modules/payments");
const shipping_1 = require("./modules/shipping");
const nlp_1 = require("./modules/nlp");
const personalization_1 = require("./modules/personalization");
const analytics_1 = require("./modules/analytics");
const ab_testing_1 = require("./modules/ab-testing");
const recommendations_module_1 = require("./modules/recommendations/recommendations.module");
const advertising_module_1 = require("./modules/advertising/advertising.module");
const accessibility_module_1 = require("./modules/accessibility/accessibility.module");
const graphql_2 = require("@nestjs/graphql");
const search_entity_type_enum_1 = require("./modules/search/enums/search-entity-type.enum");
const experiment_entity_1 = require("./modules/ab-testing/entities/experiment.entity");
(0, graphql_2.registerEnumType)(search_entity_type_enum_1.SearchEntityType, {
    name: 'SearchEntityType',
    description: 'The type of entity to search for (Product, Merchant, Brand, All)',
});
(0, graphql_2.registerEnumType)(experiment_entity_1.ExperimentStatus, {
    name: 'ExperimentStatus',
});
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            }),
            common_module_1.CommonModule,
            health_module_1.HealthModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE', 'avnu_marketplace'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('DB_SYNC', true),
                    logging: configService.get('DB_LOGGING', true),
                }),
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                typePaths: ['./src/**/*.graphql'],
                playground: true,
                debug: true,
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    store: redisStore,
                    ttl: configService.get('REDIS_TTL', 60 * 60),
                    url: `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`,
                    password: configService.get('REDIS_PASSWORD', ''),
                    database: configService.get('REDIS_DB', 0),
                    max: configService.get('REDIS_MAX_ITEMS', 1000),
                }),
            }),
            auth_module_1.AuthModule,
            users_1.UsersModule,
            products_1.ProductsModule,
            merchants_1.MerchantsModule,
            categories_module_1.CategoriesModule,
            orders_1.OrdersModule,
            integrations_1.IntegrationsModule,
            search_1.SearchModule,
            payments_1.PaymentsModule,
            shipping_1.ShippingModule,
            nlp_1.NlpModule,
            personalization_1.PersonalizationModule,
            analytics_1.AnalyticsModule,
            ab_testing_1.AbTestingModule,
            recommendations_module_1.RecommendationsModule,
            advertising_module_1.AdvertisingModule,
            accessibility_module_1.AccessibilityModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map