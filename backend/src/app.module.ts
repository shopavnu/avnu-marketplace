import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule } from '@common/common.module';
import { HealthModule } from './health/health.module';

// Import feature modules
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users';
import { ProductsModule } from '@modules/products';
import { MerchantsModule } from '@modules/merchants';
import { OrdersModule } from '@modules/orders';
import { IntegrationsModule } from '@modules/integrations';
import { SearchModule } from '@modules/search';
import { PaymentsModule } from '@modules/payments';
import { ShippingModule } from '@modules/shipping';
import { NlpModule } from '@modules/nlp';
import { PersonalizationModule } from '@modules/personalization';
import { AnalyticsModule } from '@modules/analytics';
import { AbTestingModule } from '@modules/ab-testing';

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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    CommonModule,
    HealthModule,

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'avnu_marketplace'),
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
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60, // 1 hour
      max: 1000, // Maximum number of items in cache
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProductsModule,
    MerchantsModule,
    OrdersModule,
    IntegrationsModule,
    SearchModule,
    PaymentsModule,
    ShippingModule,
    NlpModule,
    PersonalizationModule,
    AnalyticsModule,
    AbTestingModule,
  ],
})
export class AppModule {}
