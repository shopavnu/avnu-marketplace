import { AlertEntity } from './alert.entity';
export declare class AlertMetricEntity {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercentage: number;
  threshold: number;
  alert: AlertEntity;
}
