import { Resolver, Query, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PersonalizedSearchService } from '../services/personalized-search.service';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { SearchResponseType } from '../graphql/search-response.type';
import { SearchOptionsInput } from '../dto/search-options.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class PersonalizedSearchResolver {
  constructor(private readonly personalizedSearchService: PersonalizedSearchService) {}

  @Query(() => SearchResponseType)
  async personalizedSearch(
    @Context() context,
    @Args('query') query: string,
    @Args('options', { nullable: true }) options?: SearchOptionsInput,
  ) {
    return this.personalizedSearchService.personalizedSearch(
      context.req.user.id,
      query,
      options || {},
    );
  }

  @Query(() => SearchResponseType)
  async personalizedRecommendations(
    @Context() context,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.personalizedSearchService.getPersonalizedRecommendations(
      context.req.user.id,
      limit || 10,
    );
  }

  @Query(() => SearchResponseType)
  async discoveryFeed(
    @Context() context,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.personalizedSearchService.getDiscoveryFeed(context.req.user.id, {
      limit: limit || 20,
    });
  }

  @Query(() => SearchResponseType)
  async personalizedSimilarProducts(
    @Context() context,
    @Args('productId') productId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('options', { type: () => SearchOptionsInput, nullable: true })
    _options?: SearchOptionsInput,
  ) {
    return this.personalizedSearchService.getSimilarProducts(
      productId,
      context.req.user.id,
      limit || 10,
    );
  }
}
