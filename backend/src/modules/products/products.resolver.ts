import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ObjectType as _ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProductPaginatedResponse } from './dto/product-paginated.dto';

@InputType()
class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field(() => UpdateProductDto)
  data: UpdateProductDto;
}

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  createProduct(@Args('createProductInput') createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Query(() => ProductPaginatedResponse, { name: 'products' })
  findAll(@Args('pagination', { nullable: true }) paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto || { page: 1, limit: 10 });
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findOne(id);
  }

  @Query(() => ProductPaginatedResponse, { name: 'searchProducts' })
  search(
    @Args('query', { nullable: true }) query: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
    @Args('categories', { type: () => [String], nullable: true }) categories?: string[],
    @Args('priceMin', { type: () => Int, nullable: true }) priceMin?: number,
    @Args('priceMax', { type: () => Int, nullable: true }) priceMax?: number,
    @Args('merchantId', { nullable: true }) merchantId?: string,
    @Args('inStock', { nullable: true }) inStock?: boolean,
    @Args('values', { type: () => [String], nullable: true }) values?: string[],
  ) {
    return this.productsService.search(query, paginationDto || { page: 1, limit: 10 }, {
      categories,
      priceMin,
      priceMax,
      merchantId,
      inStock,
      values,
    });
  }

  @Query(() => [Product], { name: 'recommendedProducts' })
  @UseGuards(GqlAuthGuard)
  getRecommendedProducts(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.productsService.getRecommendedProducts(userId, limit);
  }

  @Query(() => [Product], { name: 'discoveryProducts' })
  getDiscoveryProducts(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
    return this.productsService.getDiscoveryProducts(limit);
  }

  @Query(() => ProductPaginatedResponse, { name: 'merchantProducts' })
  findByMerchant(
    @Args('merchantId', { type: () => ID }) merchantId: string,
    @Args('pagination', { nullable: true }) paginationDto: PaginationDto,
  ) {
    return this.productsService.findByMerchant(merchantId, paginationDto || { page: 1, limit: 10 });
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateProductInput') updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  removeProduct(@Args('id', { type: () => ID }) id: string) {
    this.productsService.remove(id);
    return true;
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  updateProductStock(
    @Args('id', { type: () => ID }) id: string,
    @Args('inStock') inStock: boolean,
    @Args('quantity', { type: () => Int, nullable: true }) quantity?: number,
  ) {
    return this.productsService.updateStock(id, inStock, quantity);
  }

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard)
  bulkCreateProducts(
    @Args('products', { type: () => [CreateProductDto] }) products: CreateProductDto[],
  ) {
    return this.productsService.bulkCreate(products);
  }

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard)
  bulkUpdateProducts(
    @Args('products', { type: () => [UpdateProductInput] })
    products: UpdateProductInput[],
  ) {
    return this.productsService.bulkUpdate(products);
  }
}
