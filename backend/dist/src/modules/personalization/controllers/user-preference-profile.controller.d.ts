import { UserPreferenceProfileService } from '../services/user-preference-profile.service';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
export declare class UserPreferenceProfileController {
  private readonly userPreferenceProfileService;
  constructor(userPreferenceProfileService: UserPreferenceProfileService);
  getUserPreferenceProfile(req: any): Promise<UserPreferenceProfile>;
  updateProfileFromSession(req: any, sessionId: string): Promise<UserPreferenceProfile>;
  getPersonalizedRecommendations(req: any): Promise<string[]>;
}
