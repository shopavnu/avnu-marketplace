import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated products' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({ status: 200, description: 'Return search results' })
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
  search(
    @Query('query') query: string,
    @Query() paginationDto: PaginationDto,
    @Query('categories') categories?: string[],
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
    @Query('merchantId') merchantId?: string,
    @Query('inStock') inStock?: boolean,
    @Query('values') values?: string[],
  ) {
    return this.productsService.search(query, paginationDto, {
      categories,
      priceMin,
      priceMax,
      merchantId,
      inStock,
      values,
    });
  }

  @Get('recommended/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended products for a user' })
  @ApiResponse({ status: 200, description: 'Return recommended products' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  getRecommendedProducts(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.productsService.getRecommendedProducts(userId, limit);
  }

  @Get('discovery')
  @ApiOperation({ summary: 'Get discovery products' })
  @ApiResponse({ status: 200, description: 'Return discovery products' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  getDiscoveryProducts(@Query('limit') limit?: number) {
    return this.productsService.getDiscoveryProducts(limit);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Get products by merchant' })
  @ApiResponse({ status: 200, description: 'Return merchant products' })
  findByMerchant(@Param('merchantId') merchantId: string, @Query() paginationDto: PaginationDto) {
    return this.productsService.findByMerchant(merchantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({ status: 200, description: 'Stock successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateStock(@Param('id') id: string, @Body() body: { inStock: boolean; quantity?: number }) {
    return this.productsService.updateStock(id, body.inStock, body.quantity);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create products' })
  @ApiResponse({ status: 201, description: 'Products successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  bulkCreate(@Body() products: CreateProductDto[]) {
    return this.productsService.bulkCreate(products);
  }

  @Patch('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update products' })
  @ApiResponse({ status: 200, description: 'Products successfully updated' })
  @ApiResponse({ status: 404, description: 'One or more products not found' })
  bulkUpdate(@Body() products: { id: string; data: UpdateProductDto }[]) {
    return this.productsService.bulkUpdate(products);
  }
}
