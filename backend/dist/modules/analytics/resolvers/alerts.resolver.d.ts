import { AlertsService } from '../services/alerts.service';
import { AlertEntity } from '../entities/alert.entity';
export declare class AlertsResolver {
  private readonly alertsService;
  constructor(alertsService: AlertsService);
  alerts(status?: string, type?: string, period?: number): Promise<AlertEntity[]>;
  updateAlertStatus(id: string, status: string): Promise<AlertEntity>;
}
