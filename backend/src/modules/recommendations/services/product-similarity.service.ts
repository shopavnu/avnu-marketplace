import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductSimilarity, SimilarityType } from '../entities/product-similarity.entity';
import { ProductService } from '../../products/services';
import { Product } from '../../products/entities/product.entity';
import { SessionService } from '../../personalization/services/session.service';
import { SessionInteractionType } from '../../personalization/services/session.service';
import { SessionInteractionEntity } from '../../personalization/entities/session-interaction.entity';

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
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Calculate attribute-based similarity between products
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateAttributeBasedSimilarity(productId: string, limit: number = 20): Promise<ProductSimilarity[]> {
    try {
      // Get source product
      const sourceProduct = await this.productService.findOne(productId);
      if (!sourceProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Get all products (in a real system, this would be paginated or filtered)
      const allProducts = await this.productService.findAll({
        take: 1000, // Limit for performance
        where: {
          id: In([productId]), // Exclude source product
        },
      });

      // Calculate similarity scores
      const similarities: ProductSimilarity[] = [];

      for (const targetProduct of allProducts) {
        if (targetProduct.id === productId) continue; // Skip self

        const similarityScore = this.calculateProductAttributeSimilarity(sourceProduct, targetProduct);

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
  private calculateProductAttributeSimilarity(sourceProduct: Product, targetProduct: Product): number {
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
    const priceDifference = Math.abs(sourceProduct.price - targetProduct.price);
    const priceRange = Math.max(sourceProduct.price, targetProduct.price) * 0.2;
    if (priceDifference <= priceRange) {
      score += priceWeight * (1 - priceDifference / priceRange);
    }

    // Tags similarity
    const tagsWeight = 0.15;
    totalWeight += tagsWeight;
    if (sourceProduct.tags && targetProduct.tags) {
      const commonTags = this.getCommonElements(sourceProduct.tags, targetProduct.tags);
      const tagSimilarity = commonTags.length / Math.max(sourceProduct.tags.length, targetProduct.tags.length);
      score += tagsWeight * tagSimilarity;
    }

    // Attributes similarity
    const attributesWeight = 0.1;
    totalWeight += attributesWeight;
    if (sourceProduct.attributes && targetProduct.attributes) {
      const sourceAttrs = Object.entries(sourceProduct.attributes);
      const targetAttrs = Object.entries(targetProduct.attributes);
      
      let matchingAttributes = 0;
      for (const [key, value] of sourceAttrs) {
        if (targetProduct.attributes[key] === value) {
          matchingAttributes++;
        }
      }
      
      const attributeSimilarity = matchingAttributes / Math.max(sourceAttrs.length, targetAttrs.length);
      score += attributesWeight * attributeSimilarity;
    }

    // Normalize score
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Get matched attributes between two products
   * @param sourceProduct Source product
   * @param targetProduct Target product
   */
  private getMatchedAttributes(sourceProduct: Product, targetProduct: Product): Record<string, any> {
    const matched: Record<string, any> = {};

    // Match categories
    if (this.hasCommonElements(sourceProduct.categories, targetProduct.categories)) {
      matched.categories = this.getCommonElements(sourceProduct.categories, targetProduct.categories);
    }

    // Match brand
    if (sourceProduct.brandName === targetProduct.brandName) {
      matched.brand = sourceProduct.brandName;
    }

    // Match price range
    const priceDifference = Math.abs(sourceProduct.price - targetProduct.price);
    const priceRange = Math.max(sourceProduct.price, targetProduct.price) * 0.2;
    if (priceDifference <= priceRange) {
      matched.priceRange = {
        source: sourceProduct.price,
        target: targetProduct.price,
        difference: priceDifference,
      };
    }

    // Match tags
    if (sourceProduct.tags && targetProduct.tags) {
      const commonTags = this.getCommonElements(sourceProduct.tags, targetProduct.tags);
      if (commonTags.length > 0) {
        matched.tags = commonTags;
      }
    }

    // Match attributes
    if (sourceProduct.attributes && targetProduct.attributes) {
      const matchedAttrs: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(sourceProduct.attributes)) {
        if (targetProduct.attributes[key] === value) {
          matchedAttrs[key] = value;
        }
      }
      
      if (Object.keys(matchedAttrs).length > 0) {
        matched.attributes = matchedAttrs;
      }
    }

    return matched;
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
   * Calculate view-based similarity between products based on user behavior
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateViewBasedSimilarity(productId: string, limit: number = 20): Promise<ProductSimilarity[]> {
    try {
      // Get all product view interactions
      const productViewInteractions = await this.sessionService.getInteractionsByType(
        SessionInteractionType.PRODUCT_VIEW,
        1000
      );

      // Get sessions that viewed the source product
      const sessionsViewedSource = productViewInteractions
        .filter(interaction => interaction.data?.productId === productId)
        .map(interaction => interaction.session.sessionId);

      if (sessionsViewedSource.length === 0) {
        return [];
      }

      // Count co-viewed products
      const coViewCounts: Record<string, number> = {};
      
      for (const interaction of productViewInteractions) {
        const viewedProductId = interaction.data?.productId;
        const sessionId = interaction.session.sessionId;
        
        if (viewedProductId && viewedProductId !== productId && sessionsViewedSource.includes(sessionId)) {
          coViewCounts[viewedProductId] = (coViewCounts[viewedProductId] || 0) + 1;
        }
      }

      // Calculate similarity scores
      const similarities: ProductSimilarity[] = [];
      const maxCoViews = Math.max(...Object.values(coViewCounts), 1);

      for (const [targetProductId, coViewCount] of Object.entries(coViewCounts)) {
        // Normalize score between 0 and 1
        const similarityScore = coViewCount / maxCoViews;

        // Create similarity record
        const similarity = this.productSimilarityRepository.create({
          sourceProductId: productId,
          targetProductId,
          similarityType: SimilarityType.VIEW_BASED,
          score: similarityScore,
          metadata: {
            coViewCount,
            totalSourceViews: sessionsViewedSource.length,
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
      this.logger.error(`Failed to calculate view-based similarity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate hybrid similarity combining multiple similarity types
   * @param productId Source product ID
   * @param limit Maximum number of similar products to return
   */
  async calculateHybridSimilarity(productId: string, limit: number = 20): Promise<ProductSimilarity[]> {
    try {
      // Get existing similarities
      const attributeSimilarities = await this.productSimilarityRepository.find({
        where: {
          sourceProductId: productId,
          similarityType: SimilarityType.ATTRIBUTE_BASED,
        },
      });

      const viewSimilarities = await this.productSimilarityRepository.find({
        where: {
          sourceProductId: productId,
          similarityType: SimilarityType.VIEW_BASED,
        },
      });

      // If no existing similarities, calculate them
      if (attributeSimilarities.length === 0) {
        await this.calculateAttributeBasedSimilarity(productId);
      }

      if (viewSimilarities.length === 0) {
        await this.calculateViewBasedSimilarity(productId);
      }

      // Get updated similarities
      const updatedAttributeSimilarities = await this.productSimilarityRepository.find({
        where: {
          sourceProductId: productId,
          similarityType: SimilarityType.ATTRIBUTE_BASED,
        },
      });

      const updatedViewSimilarities = await this.productSimilarityRepository.find({
        where: {
          sourceProductId: productId,
          similarityType: SimilarityType.VIEW_BASED,
        },
      });

      // Combine similarities with weights
      const attributeWeight = 0.6;
      const viewWeight = 0.4;

      const combinedScores: Record<string, { score: number; sources: Record<string, number> }> = {};

      // Add attribute-based scores
      for (const similarity of updatedAttributeSimilarities) {
        combinedScores[similarity.targetProductId] = {
          score: similarity.score * attributeWeight,
          sources: {
            attribute: similarity.score,
          },
        };
      }

      // Add view-based scores
      for (const similarity of updatedViewSimilarities) {
        if (combinedScores[similarity.targetProductId]) {
          combinedScores[similarity.targetProductId].score += similarity.score * viewWeight;
          combinedScores[similarity.targetProductId].sources.view = similarity.score;
        } else {
          combinedScores[similarity.targetProductId] = {
            score: similarity.score * viewWeight,
            sources: {
              view: similarity.score,
            },
          };
        }
      }

      // Create hybrid similarities
      const hybridSimilarities: ProductSimilarity[] = [];

      for (const [targetProductId, data] of Object.entries(combinedScores)) {
        const hybridSimilarity = this.productSimilarityRepository.create({
          sourceProductId: productId,
          targetProductId,
          similarityType: SimilarityType.HYBRID,
          score: data.score,
          metadata: {
            sources: data.sources,
            weights: {
              attribute: attributeWeight,
              view: viewWeight,
            },
          },
        });

        hybridSimilarities.push(hybridSimilarity);
      }

      // Sort by score descending and limit
      hybridSimilarities.sort((a, b) => b.score - a.score);
      const topSimilarities = hybridSimilarities.slice(0, limit);

      // Save to database
      await this.productSimilarityRepository.save(topSimilarities);

      return topSimilarities;
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
    limit: number = 10
  ): Promise<Product[]> {
    try {
      // Get similarities
      let similarities: ProductSimilarity[];

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
        .filter(product => !!product) as Product[];
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
