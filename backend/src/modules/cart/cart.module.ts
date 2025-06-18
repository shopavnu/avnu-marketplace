import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartService } from './services/cart.service';
import { CartResolver } from './resolvers/cart.resolver';
import { CartController } from './controllers/cart.controller';
import { PrismaModule } from '../../prisma';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CartGateway } from '../../gateways/cart.gateway';

// Import Redis store at the top level as done in app.module.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require('cache-manager-redis-store').default;

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    PrismaModule,
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const username = configService.get<string>('REDIS_USERNAME', 'default');
        const password = configService.get<string>('REDIS_PASSWORD', '');
        const ttl = configService.get('CART_CACHE_TTL_SECONDS', 86400); // 24 hours default
        const tlsEnabled =
          configService.get<string>('REDIS_TLS_ENABLED', 'false')?.toLowerCase() === 'true';

        const redisOptions: any = {
          store: redisStore,
          host: host,
          port: port,
          ttl: ttl,
          password: password,
          username: username,
          db: configService.get<number>('REDIS_DB', 0),
          max: configService.get<number>('REDIS_MAX_ITEMS', 1000),
        };

        if (tlsEnabled) {
          redisOptions.tls = {}; // Enable TLS
        }

        const logger = new Logger('CartModuleRedisConfig');
        logger.log(`Using REDIS_HOST: ${host}`);
        logger.log(`Using REDIS_PORT: ${port}`);
        logger.log(`Using REDIS_USERNAME: ${username}`);
        logger.log(`REDIS_PASSWORD is set: ${!!password}`);
        logger.log(`Using REDIS_TLS_ENABLED: ${tlsEnabled}`);
        logger.log(`Using REDIS_DB: ${redisOptions.db}`);

        return redisOptions;
      },
    }),
  ],
  providers: [CartService, CartResolver, CartGateway],
  controllers: [CartController],
  exports: [CartService, CartGateway],
})
export class CartModule {}
