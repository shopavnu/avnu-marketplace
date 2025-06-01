import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AnalyticsService } from './services/analytics.service';
import { SearchAnalyticsService } from './services/search-analytics.service';
import { UserEngagementService } from './services/user-engagement.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { SessionAnalyticsService } from './services/session-analytics.service';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsDashboardResolver } from './resolvers/analytics-dashboard.resolver';
import { SearchAnalytics } from './entities/search-analytics.entity';
import { UserEngagement } from './entities/user-engagement.entity';
import { BusinessMetrics } from './entities/business-metrics.entity';
import { SessionEntity } from '../personalization/entities/session.entity';
import { SessionInteractionEntity } from '../personalization/entities/session-interaction.entity';
import { SearchModule } from '../search/search.module';
import { AnalyticsScheduler } from './analytics.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchAnalytics,
      SessionEntity,
      SessionInteractionEntity,
      UserEngagement,
      BusinessMetrics,
    ]),
    forwardRef(() => SearchModule),
    ScheduleModule.forRoot(),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY || '',
      },
      tls: {
        rejectUnauthorized: false,
      },
    }),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    SearchAnalyticsService,
    SessionAnalyticsService,
    AnalyticsDashboardService,
    UserEngagementService,
    BusinessMetricsService,
    GoogleAnalyticsService,
    AnalyticsResolver,
    AnalyticsDashboardResolver,
    AnalyticsScheduler,
  ],
  exports: [
    AnalyticsService,
    SearchAnalyticsService,
    SessionAnalyticsService,
    AnalyticsDashboardService,
    UserEngagementService,
    BusinessMetricsService,
    GoogleAnalyticsService,
  ],
})
export class AnalyticsModule {}
