import { PlatformType } from '../enums/platform-type.enum';
export interface WebhookEvent {
  eventId: string;
  timestamp: Date;
  platformType: PlatformType;
  merchantId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  status: 'received' | 'processed' | 'failed';
  errorMessage?: string;
}
