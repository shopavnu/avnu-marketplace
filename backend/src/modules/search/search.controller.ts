import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search products with advanced filtering' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({
    name: 'categories',
    required: false,
    isArray: true,
    description: 'Filter by categories',
  })
  @ApiQuery({ name: 'priceMin', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'priceMax', required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'merchantId', required: false, description: 'Filter by merchant ID' })
  @ApiQuery({ name: 'inStock', required: false, description: 'Filter by stock status' })
  @ApiQuery({ name: 'values', required: false, isArray: true, description: 'Filter by values' })
  @ApiQuery({ name: 'brandName', required: false, description: 'Filter by brand name' })
  @ApiQuery({ name: 'sortField', required: false, description: 'Field to sort by' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  searchProducts(
    @Query('query') query: string,
    @Query() paginationDto: PaginationDto,
    @Query('categories') categories?: string[],
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('merchantId') merchantId?: string,
    @Query('inStock') inStock?: boolean,
    @Query('values') values?: string[],
    @Query('brandName') brandName?: string,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters = {
      categories,
      priceMin,
      priceMax,
      merchantId,
      inStock,
      values,
      brandName,
    };

    const sort = sortField ? { field: sortField, order: sortOrder || 'asc' } : undefined;

    return this.searchService.searchProducts(query, paginationDto, filters, sort);
  }

  @Get('products/suggestions')
  @ApiOperation({ summary: 'Get product suggestions for autocomplete' })
  @ApiResponse({ status: 200, description: 'Returns suggestions' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of suggestions to return' })
  getProductSuggestions(@Query('query') query: string, @Query('limit') limit?: number) {
    return this.searchService.getProductSuggestions(query, limit);
  }

  @Get('products/related/:productId')
  @ApiOperation({ summary: 'Get related products' })
  @ApiResponse({ status: 200, description: 'Returns related products' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  getRelatedProducts(@Param('productId') productId: string, @Query('limit') limit?: number) {
    return this.searchService.getRelatedProducts(productId, limit);
  }

  @Get('products/trending')
  @ApiOperation({ summary: 'Get trending products' })
  @ApiResponse({ status: 200, description: 'Returns trending products' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  getTrendingProducts(@Query('limit') limit?: number) {
    return this.searchService.getTrendingProducts(limit);
  }

  @Get('products/discovery')
  @ApiOperation({ summary: 'Get discovery products' })
  @ApiResponse({ status: 200, description: 'Returns discovery products' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID for personalization' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  @ApiQuery({ name: 'values', required: false, isArray: true, description: 'Values to prioritize' })
  getDiscoveryProducts(
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
    @Query('values') values?: string[],
  ) {
    return this.searchService.getDiscoveryProducts(userId, limit, values);
  }

  @Get('natural')
  @ApiOperation({ summary: 'Natural language search' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  @ApiQuery({ name: 'query', required: true, description: 'Natural language query' })
  naturalLanguageSearch(@Query('query') query: string, @Query() paginationDto: PaginationDto) {
    return this.searchService.naturalLanguageSearch(query, paginationDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Search across all entities' })
  @ApiResponse({
    status: 200,
    description: 'Returns search results for products, merchants, and brands',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  searchAll(@Query('query') query: string, @Query() paginationDto: PaginationDto) {
    return this.searchService.searchAll(query, paginationDto);
  }

  @Get('reindex')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reindex all products' })
  @ApiResponse({ status: 200, description: 'Products reindexed successfully' })
  reindexAllProducts() {
    return this.searchService.reindexAllProducts();
  }
}
