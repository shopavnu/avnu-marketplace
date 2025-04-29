import { UserPreferenceProfileService } from '../services/user-preference-profile.service';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { User } from '../../users/entities/user.entity';
export declare class UserPreferenceProfileResolver {
    private readonly userPreferenceProfileService;
    constructor(userPreferenceProfileService: UserPreferenceProfileService);
    userPreferenceProfile(user: User): Promise<UserPreferenceProfile>;
    updateUserPreferenceProfileFromSession(user: User, sessionId: string): Promise<UserPreferenceProfile>;
    personalizedRecommendations(user: User, limit?: number): Promise<string[]>;
}
