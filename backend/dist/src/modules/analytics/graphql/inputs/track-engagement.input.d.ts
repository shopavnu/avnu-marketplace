import { EngagementType } from '../../entities/user-engagement.entity';
export declare class TrackEngagementInput {
    id?: string;
    userId?: string;
    sessionId?: string;
    engagementType: EngagementType;
    entityId?: string;
    entityType?: string;
    pagePath?: string;
    referrer?: string;
    durationSeconds?: number;
    metadata?: string;
    deviceType?: string;
    platform?: string;
    ipAddress?: string;
    userAgent?: string;
}
