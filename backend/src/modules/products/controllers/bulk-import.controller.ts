import { Controller, Post, Body, UseGuards, Logger, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BulkImportService,
  ImportResult,
  BulkImportOptions,
} from '../services/bulk-import.service';
import { DataSource } from '../services/data-normalization.service';

/**
 * DTO for bulk import request
 */
class BulkImportDto {
  /**
   * Array of product data to import
   */
  products: any[];

  /**
   * Import options
   */
  options?: Partial<BulkImportOptions>;
}

/**
 * DTO for source-specific imports
 */
class SourceImportDto {
  /**
   * Source-specific product data (can be array or object with products property)
   */
  data: any;

  /**
   * Import options
   */
  options?: Partial<BulkImportOptions>;
}

/**
 * DTO for processing existing products
 */
class ProcessExistingDto {
  /**
   * Optional array of product IDs to process (all if not provided)
   */
  productIds?: string[];

  /**
   * Processing options
   */
  options?: {
    processImages?: boolean;
    updateSlug?: boolean;
    batchSize?: number;
  };
}

@ApiTags('bulk-import')
@Controller('products/bulk')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BulkImportController {
  private readonly logger = new Logger(BulkImportController.name);

  constructor(private readonly bulkImportService: BulkImportService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import products in bulk' })
  @ApiResponse({ status: 201, description: 'Products imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: BulkImportDto })
  async importProducts(@Body() importDto: BulkImportDto): Promise<ImportResult> {
    this.logger.log(`Bulk import request received for ${importDto.products.length} products`);

    return this.bulkImportService.importProducts(importDto.products, importDto.options);
  }

  @Post('import/shopify')
  @ApiOperation({ summary: 'Import products from Shopify' })
  @ApiResponse({ status: 201, description: 'Shopify products imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: SourceImportDto })
  async importFromShopify(@Body() importDto: SourceImportDto): Promise<ImportResult> {
    this.logger.log('Shopify import request received');

    return this.bulkImportService.importFromShopify(importDto.data, {
      ...importDto.options,
      source: DataSource.SHOPIFY,
    });
  }

  @Post('import/woocommerce')
  @ApiOperation({ summary: 'Import products from WooCommerce' })
  @ApiResponse({ status: 201, description: 'WooCommerce products imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: SourceImportDto })
  async importFromWooCommerce(@Body() importDto: SourceImportDto): Promise<ImportResult> {
    this.logger.log('WooCommerce import request received');

    return this.bulkImportService.importFromWooCommerce(importDto.data, {
      ...importDto.options,
      source: DataSource.WOOCOMMERCE,
    });
  }

  @Post('import/etsy')
  @ApiOperation({ summary: 'Import products from Etsy' })
  @ApiResponse({ status: 201, description: 'Etsy products imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: SourceImportDto })
  async importFromEtsy(@Body() importDto: SourceImportDto): Promise<ImportResult> {
    this.logger.log('Etsy import request received');

    return this.bulkImportService.importFromEtsy(importDto.data, {
      ...importDto.options,
      source: DataSource.ETSY,
    });
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate products without importing them' })
  @ApiResponse({ status: 200, description: 'Products validated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async validateProducts(
    @Body() importDto: BulkImportDto,
    @Query('source') source: DataSource = DataSource.MANUAL,
  ) {
    this.logger.log(`Validation request received for ${importDto.products.length} products`);

    return this.bulkImportService.validateProducts(importDto.products, source);
  }

  @Patch('process')
  @ApiOperation({ summary: 'Process existing products to ensure data consistency' })
  @ApiResponse({ status: 200, description: 'Products processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async processExistingProducts(@Body() processDto: ProcessExistingDto) {
    this.logger.log('Process existing products request received');

    return this.bulkImportService.processExistingProducts(
      processDto.productIds,
      processDto.options,
    );
  }
}
