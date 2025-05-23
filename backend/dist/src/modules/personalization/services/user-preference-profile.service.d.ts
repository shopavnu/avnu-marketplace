import { Repository } from 'typeorm';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { SessionService } from './session.service';
export declare class UserPreferenceProfileService {
    private readonly userPreferenceProfileRepository;
    private readonly sessionService;
    private readonly logger;
    constructor(userPreferenceProfileRepository: Repository<UserPreferenceProfile>, sessionService: SessionService);
    getOrCreateProfile(userId: string): Promise<UserPreferenceProfile>;
    updateProfileFromSession(userId: string, sessionId: string): Promise<UserPreferenceProfile>;
    private processInteractionsForProfile;
    private getTopItems;
    private getPriceRangeKey;
    getUserPreferenceProfile(userId: string): Promise<UserPreferenceProfile>;
    getPersonalizedRecommendations(userId: string, limit?: number): Promise<string[]>;
}
