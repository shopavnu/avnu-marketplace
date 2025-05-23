import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductsPrismaService } from '../services/products-prisma.service';

@Resolver('Product')
export class ProductsPrismaResolver {
  constructor(private readonly productsService: ProductsPrismaService) {}

  @Query('products')
  async getProducts(
    @Args('skip', { nullable: true, type: () => Int }) skip?: number,
    @Args('take', { nullable: true, type: () => Int }) take?: number,
  ) {
    return this.productsService.findAll({
      skip,
      take,
      includeVariants: true,
      includeBrand: true,
    });
  }

  @Query('product')
  async getProduct(@Args('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Mutation('createProduct')
  async createProduct(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('price') price: number,
    @Args('imageUrl') imageUrl: string,
    @Args('brandId') brandId: string,
    @Args('variants', { nullable: true }) variants?: any[],
  ) {
    return this.productsService.create({
      title,
      description,
      price,
      imageUrl,
      brandId,
      variants,
    });
  }

  @Mutation('updateProduct')
  async updateProduct(
    @Args('id') id: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('price', { nullable: true }) price?: number,
    @Args('imageUrl', { nullable: true }) imageUrl?: string,
    @Args('brandId', { nullable: true }) brandId?: string,
  ) {
    return this.productsService.update(id, {
      title,
      description,
      price,
      imageUrl,
      brandId,
    });
  }

  @Mutation('deleteProduct')
  async deleteProduct(@Args('id') id: string) {
    return this.productsService.remove(id);
  }

  @Query('searchProducts')
  async searchProducts(@Args('query') query: string) {
    return this.productsService.searchProducts(query);
  }

  @Query('productsByBrand')
  async getProductsByBrand(@Args('brandId') brandId: string) {
    return this.productsService.getProductsByBrand(brandId);
  }
}
