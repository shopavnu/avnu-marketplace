import { SessionInteractionEntity } from './session-interaction.entity';
export declare class SessionEntity {
  id: string;
  sessionId: string;
  startTime: Date;
  lastActivityTime: Date;
  deviceInfo?: Record<string, any>;
  referrer?: string;
  searchQueries: string[];
  clickedResults: string[];
  viewedCategories: string[];
  viewedBrands: string[];
  filters: Record<string, any>[];
  userId?: string;
  interactions: SessionInteractionEntity[];
  createdAt: Date;
  updatedAt: Date;
}
