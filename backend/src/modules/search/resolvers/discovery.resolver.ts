import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DiscoverySearchService } from '../services/discovery-search.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { DiscoveryHomepageResponse } from '../graphql/discovery-response.type';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Resolver()
export class DiscoveryResolver {
  constructor(private readonly discoverySearchService: DiscoverySearchService) {}

  @Query(() => DiscoveryHomepageResponse)
  @UseGuards(OptionalAuthGuard)
  async discoveryHomepage(
    @CurrentUser() user: User | null,
    @Args('sessionId', { type: () => ID, nullable: true }) sessionId?: string,
    @Args('options', { nullable: true }) options?: SearchOptionsInput,
  ): Promise<any> {
    return this.discoverySearchService.getDiscoveryHomepage(user?.id, sessionId, options);
  }
}
