import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';
export declare class SessionService {
    private readonly sessionRepository;
    private readonly interactionRepository;
    private readonly logger;
    constructor(sessionRepository: Repository<SessionEntity>, interactionRepository: Repository<SessionInteractionEntity>);
    getOrCreateSession(sessionId: string): Promise<SessionEntity>;
    trackInteraction(sessionId: string, type: SessionInteractionType, data: Record<string, any>, durationMs?: number): Promise<void>;
    getRecentInteractions(sessionId: string, type?: SessionInteractionType, limit?: number): Promise<SessionInteractionEntity[]>;
    getInteractionsByType(type: SessionInteractionType, limit?: number): Promise<SessionInteractionEntity[]>;
    calculateSessionWeights(sessionId: string): Promise<Record<string, any>>;
}
