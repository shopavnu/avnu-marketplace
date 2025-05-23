import { AlertStatus, AlertType, AlertSeverity } from '../enums/alert.enum';
import { AlertMetricEntity } from './alert-metric.entity';
import { UserSegmentEntity } from '../../users/entities/user-segment.entity';
export declare class AlertEntity {
    id: string;
    title: string;
    description: string;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    metrics: AlertMetricEntity[];
    affectedSegments: UserSegmentEntity[];
    createdAt: Date;
    updatedAt: Date;
}
