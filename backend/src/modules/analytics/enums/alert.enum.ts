import { registerEnumType } from '@nestjs/graphql';

export enum AlertType {
  PERSONALIZATION_DROP = 'PERSONALIZATION_DROP',
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',
  AB_TEST_RESULT = 'AB_TEST_RESULT',
}

export enum AlertSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

registerEnumType(AlertType, {
  name: 'AlertType',
  description: 'Type of alert',
});

registerEnumType(AlertSeverity, {
  name: 'AlertSeverity',
  description: 'Severity level of alert',
});

registerEnumType(AlertStatus, {
  name: 'AlertStatus',
  description: 'Status of alert',
});
