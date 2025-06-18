import { Args, Mutation, Resolver, ObjectType, Field } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { SearchAnalyticsService } from '../services/search-analytics.service';
import { SearchEventInput, SearchEventType } from '../graphql/search-event.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

/**
 * Response type for search event tracking
 */
@ObjectType()
class TrackSearchEventResponse {
  @Field(() => Boolean)
  success: boolean;
}

/**
 * Resolver for search analytics operations
 */
@Resolver()
export class SearchAnalyticsResolver {
  private readonly logger = new Logger(SearchAnalyticsResolver.name);

  constructor(private readonly searchAnalyticsService: SearchAnalyticsService) {}

  /**
   * Track a search-related event
   */
  @Mutation(() => TrackSearchEventResponse)
  async trackSearchEvent(
    @Args('event') event: SearchEventInput,
    @CurrentUser() user?: User,
  ): Promise<TrackSearchEventResponse> {
    try {
      // TODO: infer proper event type; defaulting to SEARCH_QUERY for now
      const success = await this.searchAnalyticsService.trackEvent(
        event.eventType,
        { ...event },
        user,
      );

      return { success };
    } catch (error) {
      this.logger.error(`Failed to track search event: ${error.message}`, error.stack);
      return { success: false };
    }
  }
}
