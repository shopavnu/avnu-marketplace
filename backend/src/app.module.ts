import { Module, MiddlewareConsumer, NestModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
// Import Redis store at the top level
// No need for type imports as we're using direct configuration
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require('cache-manager-redis-store').default;
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma';
import { ProductsPrismaModule } from '@modules/products/products-prisma.module';
import { BrandsPrismaModule } from '@modules/brands/brands-prisma.module';
import { ClerkAuthModule, ClerkAuthMiddleware } from '@modules/clerk-auth';

// Import feature modules
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users';
import { ProductsModule } from '@modules/products';
import { MerchantsModule } from '@modules/merchants';
import { CategoriesModule } from '@modules/categories/categories.module';
import { OrdersModule } from '@modules/orders';
import { IntegrationsModule } from '@modules/integrations';
import { SearchModule } from '@modules/search';
import { PaymentsModule } from '@modules/payments';
import { ShippingModule } from '@modules/shipping';
import { NlpModule } from '@modules/nlp';
import { PersonalizationModule } from '@modules/personalization';
import { AnalyticsModule } from '@modules/analytics';
import { AbTestingModule } from '@modules/ab-testing';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { AccessibilityModule } from './modules/accessibility/accessibility.module';
import { RedisModule } from './modules/redis/redis.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module'; // Added CheckoutModule
import { CartGateway } from './gateways/cart.gateway';

// Enum registration for GraphQL
import { registerEnumType } from '@nestjs/graphql';
import { SearchEntityType } from './modules/search/enums/search-entity-type.enum';
import { ExperimentStatus } from './modules/ab-testing/entities/experiment.entity';

// Register enums globally
registerEnumType(SearchEntityType, {
  name: 'SearchEntityType',
  description: 'The type of entity to search for (Product, Merchant, Brand, All)',
});

registerEnumType(ExperimentStatus, {
  name: 'ExperimentStatus',
});

@Module({
  imports: [
    // Configuration
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', `.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    CommonModule,
    HealthModule,
    PrismaModule,
    ProductsPrismaModule,
    BrandsPrismaModule,
    ClerkAuthModule,

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');
        // Only allow synchronize=true in development by default
        const defaultSyncValue = nodeEnv === 'development';
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USER') || 'avnu',
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME') || 'avnu_db',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // Only sync in development by default, always require explicit opt-in for production
          synchronize: configService.get<boolean>('DB_SYNC', defaultSyncValue),
          // Warn about synchronize being enabled in non-development environments
          logging: configService.get<boolean>('DB_LOGGING', true),
        };
      },
    }),

    // GraphQL configuration using Apollo Server v4 with graphql-ws for subscriptions
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Using schema first approach with typePaths
      typePaths: [
        './src/**/*.graphql',
        './src/modules/graphql/schema/order.graphql',
        './src/modules/graphql/schema/common.graphql',
        './src/modules/graphql/schema/personalization.graphql',
        './src/modules/graphql/schema/recommendations.graphql',
        './src/modules/graphql/schema/advertising.graphql',
        './src/modules/graphql/schema/accessibility.graphql',
        './src/modules/graphql/schema/product-accessibility.graphql',
      ],
      playground: true, // Enable Apollo Sandbox
      debug: true,
      subscriptions: {
        'graphql-ws': true, // Enable GraphQL WebSocket subscriptions
      },
      // CORS is handled at the application level in main.ts
    }),

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const username = configService.get<string>('REDIS_USERNAME', 'default');
        const tlsEnabled =
          configService.get<string>('REDIS_TLS_ENABLED', 'false')?.toLowerCase() === 'true';

        const redisOptions: any = {
          store: redisStore,
          host: host,
          port: port,
          ttl: configService.get('REDIS_TTL', 60 * 60),
          password: password,
          username: username,
          db: configService.get<number>('REDIS_DB', 0),
          max: configService.get<number>('REDIS_MAX_ITEMS', 1000),
        };

        if (tlsEnabled) {
          redisOptions.tls = {}; // Enable TLS
        }

        const logger = new Logger('CacheModuleRedisConfig');
        logger.log(`Using REDIS_HOST: ${host}`);
        logger.log(`Using REDIS_PORT: ${port}`);
        logger.log(`Using REDIS_USERNAME: ${username}`);
        logger.log(`REDIS_PASSWORD is set: ${!!password}`);
        logger.log(`Using REDIS_TLS_ENABLED: ${tlsEnabled}`);
        logger.log(`Using REDIS_DB: ${redisOptions.db}`);

        return redisOptions;
      },
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    MerchantsModule,
    CategoriesModule,
    OrdersModule,
    IntegrationsModule,
    SearchModule,
    PaymentsModule,
    ShippingModule,
    NlpModule,
    PersonalizationModule,
    AnalyticsModule,
    AbTestingModule,
    RecommendationsModule,
    AdvertisingModule,
    AccessibilityModule,
    CartModule,
    CheckoutModule, // Added CheckoutModule
  ],
  controllers: [],
  providers: [CartGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Clerk auth middleware globally
    consumer.apply(ClerkAuthMiddleware).forRoutes('*');
  }
}
