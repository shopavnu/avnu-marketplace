import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
// Unused import but kept for reference
// import { User } from '../../users/entities/user.entity';

/**
 * Service for managing recommendation experiments
 * This service handles A/B testing and experimentation for recommendation algorithms
 */
@Injectable()
export class RecommendationExperimentService {
  private readonly logger = new Logger(RecommendationExperimentService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Get experiment variant for a user
   * @param userId User ID
   * @param experimentId Experiment ID
   * @returns Variant name
   */
  async getVariant(userId: string, experimentId: string): Promise<string> {
    // Simple hash-based assignment for now
    // In a real implementation, this would use a proper experimentation framework
    const hash = this.hashString(`${userId}-${experimentId}`);
    const variants = ['control', 'variantA', 'variantB'];
    const variantIndex = hash % variants.length;

    return variants[variantIndex];
  }

  /**
   * Record an experiment event
   * @param userId User ID
   * @param experimentId Experiment ID
   * @param variant Variant name
   * @param event Event name
   * @param metadata Additional metadata
   */
  async recordEvent(
    userId: string,
    experimentId: string,
    variant: string,
    event: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // In a real implementation, this would store events in a database
    // and/or send them to an analytics service
    this.logger.log(
      `Experiment event: ${experimentId}, user: ${userId}, variant: ${variant}, event: ${event}`,
      metadata,
    );
  }

  /**
   * Simple string hashing function
   * @param str String to hash
   * @returns Hash value
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
