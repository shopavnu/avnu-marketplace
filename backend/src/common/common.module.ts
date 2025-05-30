import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CircuitBreakerService, RedisHealthService, ResilientCacheService } from './services';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    CircuitBreakerService,
    RedisHealthService,
    ResilientCacheService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [LoggerService, CircuitBreakerService, RedisHealthService, ResilientCacheService],
})
export class CommonModule {}
