import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BrandsPrismaService } from '../services/brands-prisma.service';

@Resolver('Brand')
export class BrandsPrismaResolver {
  constructor(private readonly brandsService: BrandsPrismaService) {}

  @Query('brands')
  async getBrands(
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
    @Args('includeProducts', { nullable: true, type: () => Boolean }) includeProducts?: boolean,
  ) {
    return this.brandsService.findAll({
      skip,
      take,
      includeProducts,
    });
  }

  @Query('brand')
  async getBrand(
    @Args('id') id: string,
    @Args('includeProducts', { nullable: true, type: () => Boolean }) includeProducts?: boolean,
  ) {
    return this.brandsService.findOne(id, includeProducts);
  }

  @Mutation('createBrand')
  async createBrand(@Args('name') name: string) {
    return this.brandsService.create({ name });
  }

  @Mutation('updateBrand')
  async updateBrand(@Args('id') id: string, @Args('name', { nullable: true }) name?: string) {
    return this.brandsService.update(id, { name });
  }

  @Mutation('deleteBrand')
  async deleteBrand(@Args('id') id: string) {
    return this.brandsService.remove(id);
  }

  @Query('searchBrandsSimpleList')
  async searchBrands(@Args('query') query: string) {
    return this.brandsService.searchBrands(query);
  }

  @Query('brandWithProducts')
  async getBrandWithProducts(@Args('id') id: string) {
    return this.brandsService.getBrandWithProducts(id);
  }
}
