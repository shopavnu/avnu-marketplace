import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { MerchantAuthGuard } from '../../auth/guards/merchant-auth.guard';

@ApiTags('merchant-products')
@Controller('merchant/:merchantId/products')
@UseGuards(MerchantAuthGuard)
export class MerchantProductsController {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  @Get('suppressed')
  @ApiOperation({ summary: 'Get suppressed products for a merchant' })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiQuery({ name: 'limit', description: 'Maximum number of products to return', required: false })
  @ApiResponse({ status: 200, description: 'List of suppressed products for the merchant' })
  async getSuppressedProducts(
    @Param('merchantId') merchantId: string,
    @Query('limit') limit = 50,
  ): Promise<{ success: boolean; data: Product[]; count: number }> {
    // Find all suppressed products for the merchant
    const products = await this.productRepository.find({
      where: {
        merchantId,
        isSuppressed: true,
      },
      take: limit,
      order: {
        lastValidationDate: 'DESC',
      },
    });

    return {
      success: true,
      data: products,
      count: products.length,
    };
  }
}
