import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './services/alerts.service';
import { AlertsResolver } from './resolvers/alerts.resolver';
import { AlertEntity } from './entities/alert.entity';
import { AlertMetricEntity } from './entities/alert-metric.entity';
import { AnalyticsModule } from './analytics.module';
import { SearchModule } from '../search/search.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertEntity, AlertMetricEntity]),
    forwardRef(() => AnalyticsModule),
    forwardRef(() => SearchModule),
    forwardRef(() => UsersModule),
  ],
  providers: [AlertsService, AlertsResolver],
  exports: [AlertsService],
})
export class AlertsModule {}
