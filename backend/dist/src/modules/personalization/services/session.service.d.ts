import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { SessionInteractionEntity } from '../entities/session-interaction.entity';
export declare enum SessionInteractionType {
    SEARCH = "search",
    CLICK = "click",
    VIEW = "view",
    FILTER = "filter",
    SORT = "sort",
    IMPRESSION = "impression",
    DWELL = "dwell",
    ADD_TO_CART = "add_to_cart",
    PURCHASE = "purchase",
    SCROLL_DEPTH = "scroll_depth",
    PRODUCT_VIEW = "product_view"
}
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
