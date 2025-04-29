import { SessionEntity } from './session.entity';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';
export declare class SessionInteractionEntity {
    id: string;
    session: SessionEntity;
    type: SessionInteractionType;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: Date;
    durationMs?: number;
    createdAt: Date;
}
