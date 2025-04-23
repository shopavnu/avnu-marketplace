import { Resolver, Query, Args, Context } from '@nestjs/graphql';
// import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // TODO: Implement or restore CurrentUser decorator
import { DiscoverySearchService } from '../services/discovery-search.service';
import { SearchResponseType } from '../graphql/search-response.type';
import { DiscoverySuggestionsType } from '../types/discovery-suggestions.type';
import { DiscoveryHomepageType } from '../types/discovery-homepage.type';
import {} from /* User */ '../../users/entities/user.entity';
import { SearchOptionsInput } from '../dto/search-options.dto'; // Corrected import path

@Resolver()
export class DiscoverySearchResolver {
  constructor(private readonly discoverySearchService: DiscoverySearchService) {}

  @Query(() => SearchResponseType, { name: 'discoverySearch' })
  async discoverySearch(
    @Context() context,
    @Args('query', { nullable: true }) query: string = '',
    @Args('options', { nullable: true }) options?: SearchOptionsInput,
    // @CurrentUser() user?: User, // TODO: Implement or restore CurrentUser decorator
  ) {
    const userId = undefined; // Placeholder
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.discoverySearchService.discoverySearch(query, userId, sessionId, options);
  }

  @Query(() => DiscoverySuggestionsType, { name: 'discoverySuggestions' })
  async discoverySuggestions(
    @Args('query') query: string,
    @Args('limit', { nullable: true }) limit?: number,
    // @CurrentUser() user?: User, // TODO: Implement or restore CurrentUser decorator
  ) {
    const userId = undefined; // Placeholder

    return this.discoverySearchService.getDiscoverySuggestions(query, userId, limit);
  }

  @Query(() => DiscoveryHomepageType, { name: 'discoveryHomepage' })
  async discoveryHomepage(
    @Context() context,
    @Args('options', { type: () => SearchOptionsInput, nullable: true })
    options?: SearchOptionsInput,
    // @CurrentUser() user?: User, // TODO: Implement or restore CurrentUser decorator
  ) {
    const userId = undefined; // Placeholder
    const sessionId = context.req?.headers['x-session-id'] || null;

    return this.discoverySearchService.getDiscoveryHomepage(userId, sessionId, options);
  }
}
