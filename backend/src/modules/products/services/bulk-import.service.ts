import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataNormalizationService } from './data-normalization.service';
import { ProductService } from './product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import * as ProductSchema from '../utils/product-schema';

/**
 * Data source enum for import sources
 */
export enum DataSource {
  MANUAL = 'manual',
  CSV = 'csv',
  SHOPIFY = 'shopify',
  API = 'api'
}

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
  products: Array<string>; // IDs of successfully imported products
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
 * Uses schema compatibility utilities for safe property access
 */
@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);
  
  constructor(
    private readonly dataNormalizationService: DataNormalizationService,
    private readonly productService: ProductService,
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
            try {
              const existingProduct = await this.productService.findByExternalId(
                rawProduct.externalId,
                importOptions.source,
              );
              
              if (existingProduct) {
                this.logger.log(
                  `Skipping existing product with externalId: ${rawProduct.externalId}`,
                );
                return null;
              }
            } catch (error: any) {
              // If product not found, continue with import
              if (error.status !== 404) {
                throw error;
              }
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
          
          // In validate-only mode, don't actually create the product
          if (importOptions.validateOnly) {
            return {
              success: true,
              productId: null,
              index: originalIndex,
            };
          }
          
          // Create product in database
          const createdProduct = await this.productService.create({
            ...normalizedProduct,
            merchantId: importOptions.merchantId,
            externalSource: importOptions.source,
            externalId: rawProduct.id || rawProduct.externalId || null,
          });
          
          return {
            success: true,
            productId: createdProduct.id,
            index: originalIndex,
          };
        } catch (error: any) {
          this.logger.error(
            `Error importing product at index ${originalIndex}: ${error.message}`,
            error.stack,
          );
          
          return {
            success: false,
            error: error.message || 'Unknown error',
            index: originalIndex,
            externalId: rawProduct.id || rawProduct.externalId,
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Update result statistics
      batchResults.forEach((batchResult) => {
        if (!batchResult) {
          // Skip null results (existing products that were skipped)
          return;
        }
        
        if (batchResult.success) {
          // Count as successful
          if (batchResult.productId) {
            result.products.push(batchResult.productId.toString());
          }
          result.successful++;
        } else {
          // Count as failed
          result.failed++;
          result.errors.push({
            index: batchResult.index,
            externalId: batchResult.externalId || '',
            error: batchResult.error || 'Unknown error',
          });
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
    this.logger.log(`Importing ${shopifyData.length} products from Shopify`);
    
    // Add Shopify as the data source
    options.source = DataSource.SHOPIFY;
    
    // Process the data to match our normalized format
    const processedProducts = shopifyData.map((item: any) => {
      // Extract variant information for price and inventory
      const variants = item.variants || [];
      const firstVariant = variants.length > 0 ? variants[0] : {};
      
      // Extract main image URL
      const images = item.images || [];
      const mainImage = images.length > 0 ? images[0].src : null;
      
      // Get product tags as an array
      const tags = Array.isArray(item.tags) ? item.tags : 
                  (typeof item.tags === 'string' ? item.tags.split(',').map((tag: string) => tag.trim()) : []);
      
      return {
        externalId: `shopify_${item.id}`,
        title: item.title,
        description: item.body_html,
        slug: item.handle,
        price: parseFloat(firstVariant.price) || 0,
        compareAtPrice: parseFloat(firstVariant.compare_at_price) || null,
        sku: firstVariant.sku || '',
        barcode: firstVariant.barcode || '',
        inventoryQuantity: parseInt(firstVariant.inventory_quantity, 10) || 0,
        weight: parseFloat(firstVariant.weight) || 0,
        weightUnit: firstVariant.weight_unit || 'kg',
        vendor: item.vendor,
        productType: item.product_type,
        tags: tags,
        published: item.published_at ? true : false,
        images: images.map((img: any) => ({
          src: img.src,
          position: img.position || 1,
          alt: img.alt || item.title
        })),
        mainImage: mainImage,
        platformType: 'shopify',
        metadata: {
          shopifyId: item.id,
          shopifyStatus: item.status,
          publishedAt: item.published_at,
          productUrl: `https://${item.shop?.shop_domain || 'shop.myshopify.com'}/products/${item.handle}`,
          integrationType: 'shopify'
        }
      };
    });
    
    return this.importProducts(processedProducts, options);
  }

  /**
   * Import products from Etsy export JSON
   * @param etsyData Etsy products JSON
   * @param options Import options
   * @returns Import result
   */


  /**
   * Validate products without importing them
   * @param products Products to validate
   * @param source Data source
   * @returns Validation result with normalized products
   */
  async validateProducts(
    products: any[],
    source: DataSource = DataSource.MANUAL,
  ): Promise<{
    valid: Array<CreateProductDto>;
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
      } catch (error: any) {
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
    const processingOptions = {
      processImages: options?.processImages ?? true,
      updateSlug: options?.updateSlug ?? true,
      batchSize: options?.batchSize ?? 20,
    };
    
    // Get products to process
    let productsToProcess: Product[] = [];
    
    try {
      if (productIds && productIds.length > 0) {
        // Find products by IDs
        productsToProcess = await this.productService.findByIds(productIds);
      } else {
        // Get all products
        const paginationDto = { page: 1, limit: 1000 }; // Use pagination to get all products
        const result = await this.productService.findAll(paginationDto);
        productsToProcess = result.items;
      }
    } catch (error: any) {
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
      
      const batchPromises = batch.map(async product => {
        try {
          // Normalize the product
          const normalizedProduct = await this.dataNormalizationService.normalizeProduct(product);
          
          // Update the product
          await this.productService.update(product.id, normalizedProduct);
          
          return { success: true };
        } catch (error: any) {
          this.logger.error(`Error processing product ${product.id}: ${error.message}`);
          
          return {
            error: true,
            id: product.id,
            message: error.message,
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(batchResult => {
        if ('error' in batchResult && batchResult.error) {
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
   * Get product brand name using schema compatibility utilities
   * @param product Product entity
   * @returns Brand name
   */
  getBrandName(product: Product): string {
    return ProductSchema.getBrandName(product);
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
