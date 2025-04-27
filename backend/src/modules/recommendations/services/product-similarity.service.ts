import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSimilarity, SimilarityType } from '../entities/product-similarity.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductService } from '../../products/services/product.service';
import { UserBehaviorService } from '../../personalization/services/user-behavior.service';

/**
 * Service for calculating and managing product similarities
 */
@Injectable()
export class ProductSimilarityService {
  private readonly logger = new Logger(ProductSimilarityService.name);

  constructor(
    @InjectRepository(ProductSimilarity)
    private readonly productSimilarityRepository: Repository<ProductSimilarity>,
    private readonly productService: ProductService,
    private readonly userBehaviorService: UserBehaviorService,
  ) {}

  /**
   * Calculate attribute-based similarity between products
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateAttributeBasedSimilarity(
    productId: string,
    limit: number = 20,
  ): Promise<ProductSimilarity[]> {
    try {
      // Get source product
      const sourceProduct = await this.productService.findOne(productId);
      if (!sourceProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Get all products (in a real system, this would be paginated or filtered)
      const allProductsResult = await this.productService.findAll({
        limit: 1000, // Limit for performance
      });

      // Calculate similarity scores
      const similarities: ProductSimilarity[] = [];
      const allProducts = allProductsResult.items || [];
      
      // Filter out the source product
      const filteredProducts = allProducts.filter(product => product.id !== productId);

      for (const targetProduct of filteredProducts) {
        // No need to check for self anymore since we filtered above

        const similarityScore = this.calculateProductAttributeSimilarity(
          sourceProduct,
          targetProduct,
        );

        // Create similarity record
        const similarity = this.productSimilarityRepository.create({
          sourceProductId: productId,
          targetProductId: targetProduct.id,
          similarityType: SimilarityType.ATTRIBUTE_BASED,
          score: similarityScore,
          metadata: {
            matchedAttributes: this.getMatchedAttributes(sourceProduct, targetProduct),
          },
        });

        similarities.push(similarity);
      }

      // Sort by score descending and limit
      similarities.sort((a, b) => b.score - a.score);
      const topSimilarities = similarities.slice(0, limit);

      // Save to database
      await this.productSimilarityRepository.save(topSimilarities);

      return topSimilarities;
    } catch (error) {
      this.logger.error(`Failed to calculate attribute-based similarity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate similarity score between two products based on attributes
   * @param sourceProduct Source product
   * @param targetProduct Target product
   */
  private calculateProductAttributeSimilarity(
    sourceProduct: Product,
    targetProduct: Product,
  ): number {
    let score = 0;
    let totalWeight = 0;

    // Category similarity (highest weight)
    const categoryWeight = 0.4;
    totalWeight += categoryWeight;
    if (this.hasCommonElements(sourceProduct.categories, targetProduct.categories)) {
      score += categoryWeight;
    }

    // Brand similarity
    const brandWeight = 0.2;
    totalWeight += brandWeight;
    if (sourceProduct.brandName === targetProduct.brandName) {
      score += brandWeight;
    }

    // Price similarity (within 20% range)
    const priceWeight = 0.15;
    totalWeight += priceWeight;
    const priceDiff = Math.abs(sourceProduct.price - targetProduct.price);
    const priceAvg = (sourceProduct.price + targetProduct.price) / 2;
    if (priceAvg > 0 && priceDiff / priceAvg <= 0.2) {
      score += priceWeight;
    }

    // Description similarity (basic implementation)
    const descriptionWeight = 0.1;
    totalWeight += descriptionWeight;
    if (
      sourceProduct.description &&
      targetProduct.description &&
      this.hasCommonKeywords(sourceProduct.description, targetProduct.description)
    ) {
      score += descriptionWeight;
    }

    // Normalize score
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Get matched attributes between two products
   * @param sourceProduct Source product
   * @param targetProduct Target product
   */
  private getMatchedAttributes(
    sourceProduct: Product,
    targetProduct: Product,
  ): Record<string, any> {
    const matches: Record<string, any> = {};

    // Check categories
    if (this.hasCommonElements(sourceProduct.categories, targetProduct.categories)) {
      matches.categories = this.getCommonElements(
        sourceProduct.categories,
        targetProduct.categories,
      );
    }

    // Check brand
    if (sourceProduct.brandName === targetProduct.brandName) {
      matches.brand = sourceProduct.brandName;
    }

    // Check price range
    const priceDiff = Math.abs(sourceProduct.price - targetProduct.price);
    const priceAvg = (sourceProduct.price + targetProduct.price) / 2;
    if (priceAvg > 0 && priceDiff / priceAvg <= 0.2) {
      matches.priceRange = {
        sourcePrice: sourceProduct.price,
        targetPrice: targetProduct.price,
        difference: priceDiff,
        percentDifference: priceAvg > 0 ? (priceDiff / priceAvg) * 100 : 0,
      };
    }

    return matches;
  }

  /**
   * Check if two arrays have common elements
   * @param arr1 First array
   * @param arr2 Second array
   */
  private hasCommonElements(arr1: any[], arr2: any[]): boolean {
    if (!arr1 || !arr2) return false;
    return arr1.some(item => arr2.includes(item));
  }

  /**
   * Get common elements between two arrays
   * @param arr1 First array
   * @param arr2 Second array
   */
  private getCommonElements(arr1: any[], arr2: any[]): any[] {
    if (!arr1 || !arr2) return [];
    return arr1.filter(item => arr2.includes(item));
  }

  /**
   * Check if two text strings have common keywords
   * @param text1 First text
   * @param text2 Second text
   */
  private hasCommonKeywords(text1: string, text2: string): boolean {
    if (!text1 || !text2) return false;
    
    // Extract keywords (simple implementation)
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    
    return this.hasCommonElements(keywords1, keywords2);
  }

  /**
   * Extract keywords from text
   * @param text Text to extract keywords from
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Simple implementation: split by spaces, lowercase, remove punctuation
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words longer than 3 chars
      .filter(word => !['this', 'that', 'with', 'from', 'have', 'your'].includes(word)); // Remove common words
  }

  /**
   * Calculate view-based similarity between products based on user behavior
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateViewBasedSimilarity(
    productId: string,
    _limit: number = 20,
  ): Promise<ProductSimilarity[]> {
    try {
      this.logger.log(`Calculating view-based similarity for product ${productId}`);
      
      // In a real implementation, we would use user behavior data to calculate view-based similarity
      // For now, we'll return an empty array as this is just a placeholder
      return [];
    } catch (error) {
      this.logger.error(`Failed to calculate view-based similarity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate hybrid similarity combining multiple similarity types
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateHybridSimilarity(
    productId: string,
    limit: number = 20,
  ): Promise<ProductSimilarity[]> {
    try {
      this.logger.log(`Calculating hybrid similarity for product ${productId}`);
      
      // In a real implementation, we would combine attribute and view-based similarities
      // For now, we'll just use attribute-based similarity as a placeholder
      const attributeSimilarities = await this.calculateAttributeBasedSimilarity(productId, limit);
      return attributeSimilarities;
    } catch (error) {
      this.logger.error(`Failed to calculate hybrid similarity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get similar products
   * @param productId Source product ID
   * @param similarityType Type of similarity to use
   * @param limit Maximum number of similar products to return
   */
  async getSimilarProducts(
    productId: string,
    similarityType: SimilarityType = SimilarityType.HYBRID,
    limit: number = 10,
  ): Promise<Product[]> {
    try {
      // Get similarities
      let similarities: ProductSimilarity[] = [];

      switch (similarityType) {
        case SimilarityType.ATTRIBUTE_BASED:
          similarities = await this.productSimilarityRepository.find({
            where: {
              sourceProductId: productId,
              similarityType: SimilarityType.ATTRIBUTE_BASED,
            },
            order: {
              score: 'DESC',
            },
            take: limit,
          });

          if (similarities.length === 0) {
            similarities = await this.calculateAttributeBasedSimilarity(productId, limit);
          }
          break;

        case SimilarityType.VIEW_BASED:
          similarities = await this.productSimilarityRepository.find({
            where: {
              sourceProductId: productId,
              similarityType: SimilarityType.VIEW_BASED,
            },
            order: {
              score: 'DESC',
            },
            take: limit,
          });

          if (similarities.length === 0) {
            similarities = await this.calculateViewBasedSimilarity(productId, limit);
          }
          break;

        case SimilarityType.HYBRID:
        default:
          similarities = await this.productSimilarityRepository.find({
            where: {
              sourceProductId: productId,
              similarityType: SimilarityType.HYBRID,
            },
            order: {
              score: 'DESC',
            },
            take: limit,
          });

          if (similarities.length === 0) {
            similarities = await this.calculateHybridSimilarity(productId, limit);
          }
          break;
      }

      // Get product details
      const productIds = similarities.map(similarity => similarity.targetProductId);
      const products = await this.productService.findByIds(productIds);

      // Sort products by similarity score
      const productMap = new Map(products.map(product => [product.id, product]));
      return similarities
        .map(similarity => productMap.get(similarity.targetProductId))
        .filter((product): product is Product => !!product);
    } catch (error) {
      this.logger.error(`Failed to get similar products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update product similarities
   * @param productId Product ID to update similarities for
   */
  async updateProductSimilarities(productId: string): Promise<void> {
    try {
      await this.calculateAttributeBasedSimilarity(productId);
      await this.calculateViewBasedSimilarity(productId);
      await this.calculateHybridSimilarity(productId);
    } catch (error) {
      this.logger.error(`Failed to update product similarities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch update product similarities
   * @param productIds List of product IDs to update
   */
  async batchUpdateSimilarities(productIds: string[]): Promise<void> {
    try {
      for (const productId of productIds) {
        await this.updateProductSimilarities(productId);
      }
    } catch (error) {
      this.logger.error(`Failed to batch update similarities: ${error.message}`);
      throw error;
    }
  }
}
