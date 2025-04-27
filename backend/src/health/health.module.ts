import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { RenderHealthController } from './render-health.controller';
import { LoggerService } from '@common/services/logger.service';

@Module({
  imports: [TerminusModule, HttpModule, ConfigModule],
  controllers: [HealthController, RenderHealthController],
  providers: [LoggerService],
})
export class HealthModule {}
