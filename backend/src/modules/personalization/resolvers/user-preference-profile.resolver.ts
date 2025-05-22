import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserPreferenceProfileService } from '../services/user-preference-profile.service';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Resolver(() => UserPreferenceProfile)
export class UserPreferenceProfileResolver {
  constructor(private readonly userPreferenceProfileService: UserPreferenceProfileService) {}

  @Query(() => UserPreferenceProfile)
  @UseGuards(GqlAuthGuard)
  async userPreferenceProfile(@CurrentUser() user: User): Promise<UserPreferenceProfile> {
    return this.userPreferenceProfileService.getUserPreferenceProfile(user.id);
  }

  @Mutation(() => UserPreferenceProfile)
  @UseGuards(GqlAuthGuard)
  async updateUserPreferenceProfileFromSession(
    @CurrentUser() user: User,
    @Args('sessionId', { type: () => ID }) sessionId: string,
  ): Promise<UserPreferenceProfile> {
    return this.userPreferenceProfileService.updateProfileFromSession(user.id, sessionId);
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async personalizedRecommendations(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<string[]> {
    return this.userPreferenceProfileService.getPersonalizedRecommendations(user.id, limit);
  }
}
