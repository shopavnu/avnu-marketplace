import { Resolver, Query, Args } from '@nestjs/graphql';
import { RelatedProductsService } from '../services/related-products.service';
import { SearchResponseType } from '../graphql/search-response.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Resolver()
export class RelatedProductsResolver {
  constructor(private readonly relatedProductsService: RelatedProductsService) {}

  @Query(() => SearchResponseType, { name: 'relatedProducts' })
  async getRelatedProducts(
    @Args('productId') productId: string,
    @Args('limit', { nullable: true }) limit?: number,
    @CurrentUser() user?: User,
  ) {
    const userId = user?.id;

    return this.relatedProductsService.getRelatedProducts(productId, userId, { limit });
  }

  @Query(() => SearchResponseType, { name: 'complementaryProducts' })
  async getComplementaryProducts(
    @Args('productId') productId: string,
    @Args('limit', { nullable: true }) limit?: number,
    @CurrentUser() user?: User,
  ) {
    const userId = user?.id;

    return this.relatedProductsService.getComplementaryProducts(productId, userId, limit);
  }

  @Query(() => SearchResponseType, { name: 'frequentlyBoughtTogether' })
  async getFrequentlyBoughtTogether(
    @Args('productId') productId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ) {
    return this.relatedProductsService.getFrequentlyBoughtTogether(productId, limit);
  }
}
