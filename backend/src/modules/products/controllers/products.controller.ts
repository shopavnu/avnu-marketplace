import { Controller, Get, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsPrismaService } from '../services/products-prisma.service';
import { ClerkAuthGuard, Public } from '@modules/clerk-auth';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsPrismaService) {}

  @Public() // Making this endpoint public for now
  @Get()
  async list(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.productsService.findAll({
      skip,
      take,
      includeVariants: true,
      includeBrand: true,
    });
  }

  @Public() // Making this endpoint public for now
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // For demonstration of auth, this endpoint requires authentication
  @UseGuards(ClerkAuthGuard)
  @Get('search/:query')
  async search(@Param('query') query: string) {
    return this.productsService.searchProducts(query);
  }
}
