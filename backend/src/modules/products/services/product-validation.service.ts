import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../entities/product.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';

interface ProductValidationIssue {
  productId: string;
  productTitle: string;
  merchantId: string;
  issues: string[];
  suppressedFrom: string[];
}

@Injectable()
export class ProductValidationService {
  private readonly logger = new Logger(ProductValidationService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Validate a product for required data and suppress if necessary
   * @param product The product to validate
   * @returns Object with validation results
   */
  async validateProduct(product: Product): Promise<{
    isValid: boolean;
    issues: string[];
    suppressedFrom: string[];
  }> {
    const issues: string[] = [];
    const suppressedFrom: string[] = [];

    // Check for missing images
    if (!product.images || product.images.length === 0) {
      issues.push('Missing product images');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
    }

    // Check for missing title
    if (!product.title || product.title.trim() === '') {
      issues.push('Missing product title');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
      suppressedFrom.push('category pages');
    }

    // Check for missing price
    if (product.price === undefined || product.price === null) {
      issues.push('Missing product price');
      suppressedFrom.push('search results');
      suppressedFrom.push('product recommendations');
    }

    // Check for missing description
    if (!product.description || product.description.trim() === '') {
      issues.push('Missing product description');
      // Don't suppress, but flag as an issue
    }

    // Check for missing brand
    if (!product.brandName || product.brandName.trim() === '') {
      issues.push('Missing brand name');
      // Don't suppress, but flag as an issue
    }

    // Update product suppression status in database
    if (suppressedFrom.length > 0) {
      await this.updateProductSuppressionStatus(product.id, true, suppressedFrom);
    } else if (product.isSuppressed) {
      // If product was previously suppressed but now valid, unsuppress it
      await this.updateProductSuppressionStatus(product.id, false, []);
    }

    return {
      isValid: issues.length === 0,
      issues,
      suppressedFrom,
    };
  }

  /**
   * Update a product's suppression status
   * @param productId The ID of the product
   * @param isSuppressed Whether the product should be suppressed
   * @param suppressedFrom Array of locations from which the product is suppressed
   */
  private async updateProductSuppressionStatus(
    productId: string,
    isSuppressed: boolean,
    suppressedFrom: string[],
  ): Promise<void> {
    try {
      await this.productRepository.update(
        { id: productId },
        {
          isSuppressed,
          suppressedFrom: suppressedFrom.length > 0 ? suppressedFrom : null,
          lastValidationDate: new Date(),
        },
      );

      this.logger.log(
        `Updated product ${productId} suppression status: ${isSuppressed ? 'Suppressed' : 'Visible'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update product suppression status: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Validate all products for a merchant and emit notification event if issues are found
   * @param merchantId The ID of the merchant
   */
  async validateMerchantProducts(merchantId: string): Promise<void> {
    try {
      // Get all products for the merchant
      const products = await this.productRepository.find({
        where: { merchantId },
      });

      if (!products || products.length === 0) {
        this.logger.log(`No products found for merchant ${merchantId}`);
        return;
      }

      const productIssues: ProductValidationIssue[] = [];

      // Validate each product
      for (const product of products) {
        const validation = await this.validateProduct(product);

        if (validation.issues.length > 0) {
          productIssues.push({
            productId: product.id,
            productTitle: product.title || 'Untitled Product',
            merchantId,
            issues: validation.issues,
            suppressedFrom: validation.suppressedFrom,
          });
        }
      }

      // If there are issues, emit an event to notify the merchant
      if (productIssues.length > 0) {
        const merchant = await this.merchantRepository.findOne({
          where: { id: merchantId },
        });

        if (merchant) {
          this.eventEmitter.emit('merchant.product.issues', {
            merchantId,
            merchantEmail: merchant.email,
            productIssues,
          });

          this.logger.log(
            `Emitted product issues notification event for merchant ${merchantId} with ${productIssues.length} affected products`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate products for merchant ${merchantId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Validate all products in the system
   */
  async validateAllProducts(): Promise<void> {
    try {
      // Get all merchants
      const merchants = await this.merchantRepository.find();

      // Validate products for each merchant
      for (const merchant of merchants) {
        await this.validateMerchantProducts(merchant.id);
      }

      this.logger.log(`Completed validation of all products for ${merchants.length} merchants`);
    } catch (error) {
      this.logger.error(`Failed to validate all products: ${error.message}`, error.stack);
    }
  }
}
