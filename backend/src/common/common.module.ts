import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [LoggerService],
})
export class CommonModule {}
