import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USER') || 'avnu',
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME') || 'avnu_db',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNC', true),
        logging: configService.get<boolean>('DB_LOGGING', true),
      }),
    }),

    // GraphQL - temporarily disabled schema generation for debugging
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Using schema first approach temporarily to bypass schema generation issues
      typePaths: ['./src/**/*.graphql'],
      playground: true,
      debug: true,
    }),

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        // Redis client options
        ttl: configService.get('REDIS_TTL', 60 * 60), // 1 hour default
        url: `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`,
        password: configService.get('REDIS_PASSWORD', ''),
        database: configService.get('REDIS_DB', 0),
        max: configService.get('REDIS_MAX_ITEMS', 1000), // Maximum number of items in cache
      }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Clerk auth middleware globally
    consumer.apply(ClerkAuthMiddleware).forRoutes('*');
  }
}
