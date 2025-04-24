import { Repository } from 'typeorm';
import { SessionEntity } from '../../personalization/entities/session.entity';
import { SessionInteractionEntity } from '../../personalization/entities/session-interaction.entity';
export declare class SessionAnalyticsService {
    private readonly sessionRepository;
    private readonly interactionRepository;
    private readonly logger;
    constructor(sessionRepository: Repository<SessionEntity>, interactionRepository: Repository<SessionInteractionEntity>);
    getSessionAnalyticsOverview(period?: number): Promise<any>;
    private getInteractionTypeDistribution;
    private getAverageSessionDuration;
    private getPersonalizationEffectiveness;
    private getPersonalizedVsRegularClickThroughRates;
    private getDwellTimeMetrics;
    private getImpressionToClickRates;
    getSessionTimeSeriesData(period?: number, interval?: number): Promise<any[]>;
    getTopPersonalizedEntities(limit?: number, period?: number): Promise<any[]>;
}
