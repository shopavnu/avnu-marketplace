import { SessionEntity } from './session.entity';
import { SessionInteractionType } from '../services/session.service';
export declare class SessionInteractionEntity {
  id: string;
  session: SessionEntity;
  type: SessionInteractionType;
  data: Record<string, any>;
  timestamp: Date;
  durationMs?: number;
  createdAt: Date;
}
