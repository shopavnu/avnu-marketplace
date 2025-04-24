import { SessionService, SessionInteractionType } from '../services/session.service';
declare class TrackSessionInteractionDto {
    sessionId: string;
    type: SessionInteractionType;
    data: Record<string, any>;
    durationMs?: number;
}
export declare class SessionController {
    private readonly sessionService;
    private readonly logger;
    constructor(sessionService: SessionService);
    trackInteraction(dto: TrackSessionInteractionDto): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    initializeSession({ sessionId }: {
        sessionId: string;
    }): Promise<{
        success: boolean;
        sessionId: string;
        startTime: Date;
        lastActivityTime: Date;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        sessionId?: undefined;
        startTime?: undefined;
        lastActivityTime?: undefined;
    }>;
}
export {};
