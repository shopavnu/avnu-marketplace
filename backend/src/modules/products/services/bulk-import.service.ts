import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataNormalizationService, DataSource } from './data-normalization.service';
import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';

/**
 * Import result statistics
 */
export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    externalId?: string;
    error: string;
  }>;
  products: string[]; // IDs of successfully imported products
}

/**
 * Bulk import options
 */
export interface BulkImportOptions {
  source: DataSource;
  merchantId: string;
  skipExisting: boolean;
  batchSize: number;
  validateOnly: boolean;
  processImages: boolean;
}

/**
 * Service for bulk importing and normalizing products
 */
@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    private readonly dataNormalizationService: DataNormalizationService,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Import products in bulk from any supported source
   * @param products Raw product data array
   * @param options Import options
   * @returns Import result statistics
   */
  async importProducts(
    products: any[],
    options: Partial<BulkImportOptions> = {},
  ): Promise<ImportResult> {
    // Default options
    const defaultOptions: BulkImportOptions = {
      source: DataSource.MANUAL,
      merchantId: '',
      skipExisting: true,
      batchSize: 10,
      validateOnly: false,
      processImages: true,
    };

    const importOptions: BulkImportOptions = { ...defaultOptions, ...options };

    // Initialize result
    const result: ImportResult = {
      total: products.length,
      successful: 0,
      failed: 0,
      errors: [],
      products: [],
    };

    // Process in batches to avoid overwhelming the server
    const batches = this.chunkArray(products, importOptions.batchSize);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.logger.log(
        `Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products)`,
      );

      // Process each product in the batch concurrently
      const batchPromises = batch.map(async (rawProduct, index) => {
        const originalIndex = batchIndex * importOptions.batchSize + index;

        try {
          // Check if product already exists (if skipExisting is true)
          if (importOptions.skipExisting && rawProduct.externalId) {
            const existingProduct = await this.productsService.findByExternalId(
              rawProduct.externalId,
              importOptions.source,
            );

            if (existingProduct) {
              this.logger.log(
                `Skipping existing product with externalId: ${rawProduct.externalId}`,
              );
              return null;
            }
          }

          // Normalize product data
          const normalizedProduct = await this.dataNormalizationService.normalizeProductData(
            rawProduct,
            importOptions.source,
            {
              processImages: importOptions.processImages,
              validateImages: true,
              sanitizeText: true,
              enforceRequiredFields: true,
            },
          );

          // Add merchantId if provided
          if (importOptions.merchantId) {
            normalizedProduct.merchantId = importOptions.merchantId;
          }

          // If validateOnly, don't actually create the product
          if (importOptions.validateOnly) {
            return { validated: true, product: normalizedProduct };
          }

          // Create the product
          const createdProduct = await this.productsService.create(normalizedProduct);

          return { created: true, product: createdProduct, id: createdProduct.id };
        } catch (error) {
          // Log the error and add to result errors
          this.logger.error(`Error importing product at index ${originalIndex}: ${error.message}`);
          result.errors.push({
            index: originalIndex,
            externalId: rawProduct.externalId || rawProduct.id,
            error: error.message,
          });

          return { error: true, message: error.message };
        }
      });

      // Wait for all products in the batch to be processed
      const batchResults = await Promise.all(batchPromises);

      // Update statistics
      batchResults.forEach(batchResult => {
        if (!batchResult) {
          // Skip existing product
          return;
        }

        if (batchResult.error) {
          result.failed++;
        } else {
          result.successful++;
          if (batchResult.created && batchResult.product && 'id' in batchResult.product) {
            result.products.push(batchResult.product.id);
          }
        }
      });
    }

    return result;
  }

  /**
   * Import products from Shopify export JSON
   * @param shopifyData Shopify products JSON
   * @param options Import options
   * @returns Import result
   */
  async importFromShopify(
    shopifyData: any,
    options: Partial<BulkImportOptions> = {},
  ): Promise<ImportResult> {
    // Ensure we have an array of products
    const shopifyProducts = Array.isArray(shopifyData) ? shopifyData : shopifyData.products || [];

    return this.importProducts(shopifyProducts, {
      ...options,
      source: DataSource.SHOPIFY,
    });
  }

  /**
   * Import products from WooCommerce export JSON
   * @param wooCommerceData WooCommerce products JSON
   * @param options Import options
   * @returns Import result
   */
  async importFromWooCommerce(
    wooCommerceData: any,
    options: Partial<BulkImportOptions> = {},
  ): Promise<ImportResult> {
    // Ensure we have an array of products
    const wooProducts = Array.isArray(wooCommerceData)
      ? wooCommerceData
      : wooCommerceData.products || [];

    return this.importProducts(wooProducts, {
      ...options,
      source: DataSource.WOOCOMMERCE,
    });
  }

  /**
   * Import products from Etsy export JSON
   * @param etsyData Etsy products JSON
   * @param options Import options
   * @returns Import result
   */
  async importFromEtsy(
    etsyData: any,
    options: Partial<BulkImportOptions> = {},
  ): Promise<ImportResult> {
    // Ensure we have an array of products
    const etsyProducts = Array.isArray(etsyData) ? etsyData : etsyData.results || [];

    return this.importProducts(etsyProducts, {
      ...options,
      source: DataSource.ETSY,
    });
  }

  /**
   * Validate products without importing them
   * @param products Raw product data array
   * @param source Data source
   * @returns Validation result with normalized products
   */
  async validateProducts(
    products: any[],
    source: DataSource = DataSource.MANUAL,
  ): Promise<{
    valid: CreateProductDto[];
    invalid: Array<{ index: number; errors: string[] }>;
  }> {
    const valid: CreateProductDto[] = [];
    const invalid: Array<{ index: number; errors: string[] }> = [];

    // Process each product
    for (let i = 0; i < products.length; i++) {
      try {
        const normalizedProduct = await this.dataNormalizationService.normalizeProductData(
          products[i],
          source,
          {
            processImages: false, // Don't process images during validation
            validateImages: true,
            sanitizeText: true,
            enforceRequiredFields: true,
          },
        );

        valid.push(normalizedProduct);
      } catch (error) {
        invalid.push({
          index: i,
          errors: [error.message],
        });
      }
    }

    return { valid, invalid };
  }

  /**
   * Process existing products to update their image metadata and ensure consistency
   * @param productIds Optional array of product IDs to process (all if not provided)
   * @param options Processing options
   * @returns Processing result
   */
  async processExistingProducts(
    productIds?: string[],
    options?: {
      processImages?: boolean;
      updateSlug?: boolean;
      batchSize?: number;
    },
  ): Promise<{
    total: number;
    processed: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    // Default options
    const processingOptions = {
      processImages: options?.processImages ?? true,
      updateSlug: options?.updateSlug ?? true,
      batchSize: options?.batchSize ?? 20,
    };

    // Get products to process
    let productsToProcess: Product[] = [];

    try {
      if (productIds && productIds.length > 0) {
        // Find products by IDs one by one if bulk find is not available
        const productPromises = productIds.map(id => this.productsService.findOne(id));
        const products = await Promise.all(productPromises);
        productsToProcess = products.filter(product => product !== null) as Product[];
      } else {
        // Get all products
        const paginationDto = { page: 1, limit: 1000 }; // Use pagination to get all products
        const result = await this.productsService.findAll(paginationDto);
        productsToProcess = Array.isArray(result) ? result : result.items;
      }
    } catch (error) {
      this.logger.error(`Error fetching products: ${error.message}`);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const result = {
      total: productsToProcess.length,
      processed: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    // Process in batches
    const batches = this.chunkArray(productsToProcess, processingOptions.batchSize);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.logger.log(`Processing existing products batch ${batchIndex + 1}/${batches.length}`);

      // Process each product in the batch concurrently
      const batchPromises = batch.map(async product => {
        try {
          // Normalize the product
          const normalizedProduct = await this.dataNormalizationService.normalizeProduct(product);

          // Update the product
          await this.productsService.update(product.id, normalizedProduct);

          return { success: true };
        } catch (error) {
          this.logger.error(`Error processing product ${product.id}: ${error.message}`);
          return {
            error: true,
            id: product.id,
            message: error.message,
          };
        }
      });

      // Wait for all products in the batch to be processed
      const batchResults = await Promise.all(batchPromises);

      // Update statistics
      batchResults.forEach(batchResult => {
        if (batchResult.error) {
          result.failed++;
          result.errors.push({
            id: batchResult.id,
            error: batchResult.message,
          });
        } else {
          result.processed++;
        }
      });
    }

    return result;
  }

  /**
   * Split array into chunks of specified size
   * @param array Array to split
   * @param chunkSize Size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
