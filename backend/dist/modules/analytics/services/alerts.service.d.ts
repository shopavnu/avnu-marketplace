import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SearchAnalyticsService } from './search-analytics.service';
import { SessionAnalyticsService } from './session-analytics.service';
import { ABTestingService } from '../../search/services/ab-testing.service';
import { AlertEntity } from '../entities/alert.entity';
import { AlertMetricEntity } from '../entities/alert-metric.entity';
import { AlertSeverity, AlertStatus, AlertType } from '../enums/alert.enum';
export declare class AlertsService {
  private readonly alertRepository;
  private readonly alertMetricRepository;
  private readonly searchAnalyticsService;
  private readonly sessionAnalyticsService;
  private readonly abTestingService;
  private readonly configService;
  private readonly logger;
  private readonly thresholds;
  constructor(
    alertRepository: Repository<AlertEntity>,
    alertMetricRepository: Repository<AlertMetricEntity>,
    searchAnalyticsService: SearchAnalyticsService,
    sessionAnalyticsService: SessionAnalyticsService,
    abTestingService: ABTestingService,
    configService: ConfigService,
  );
  getAlerts(status?: AlertStatus, type?: AlertType, period?: number): Promise<AlertEntity[]>;
  updateAlertStatus(id: string, status: AlertStatus): Promise<AlertEntity>;
  createAlert(
    type: AlertType,
    title: string,
    description: string,
    severity: AlertSeverity,
    metrics: Partial<AlertMetricEntity>[],
    affectedSegments?: any[],
  ): Promise<AlertEntity>;
  checkForPersonalizationDrops(): Promise<void>;
  checkForABTestResults(): Promise<void>;
}
