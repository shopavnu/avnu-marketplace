import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan, Not, IsNull } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../products.service';
import { DataNormalizationService } from './data-normalization.service';
import {
  BatchSectionsRequestDto,
  BatchSectionsResponseDto,
  SectionRequestDto,
  SectionResponseDto,
} from '../dto/batch-sections.dto';

/**
 * Service for batch loading multiple product sections efficiently
 * Optimized for continuous scroll interfaces
 */
@Injectable()
export class BatchSectionsService {
  private readonly logger = new Logger(BatchSectionsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsService: ProductsService,
    private readonly dataNormalizationService: DataNormalizationService,
  ) {}

  /**
   * Load multiple product sections in a single batch request
   * @param batchRequest Batch sections request
   * @returns Batch sections response
   */
  async loadBatchSections(
    batchRequest: BatchSectionsRequestDto,
  ): Promise<BatchSectionsResponseDto> {
    const startTime = Date.now();

    // Process sections in parallel or sequentially based on request
    let sectionResponses: SectionResponseDto[];

    if (batchRequest.parallel) {
      // Process sections in parallel for better performance
      sectionResponses = await Promise.all(
        batchRequest.sections.map(section => this.loadSection(section)),
      );
    } else {
      // Process sections sequentially to reduce server load
      sectionResponses = [];
      for (const section of batchRequest.sections) {
        const response = await this.loadSection(section);
        sectionResponses.push(response);
      }
    }

    // Calculate metadata
    const totalProducts = sectionResponses.reduce((sum, section) => sum + section.items.length, 0);

    const endTime = Date.now();
    const loadTimeMs = endTime - startTime;

    return {
      sections: sectionResponses,
      meta: {
        totalSections: sectionResponses.length,
        totalProducts,
        loadTimeMs,
      },
    };
  }

  /**
   * Load a single product section
   * @param sectionRequest Section request
   * @returns Section response
   */
  private async loadSection(sectionRequest: SectionRequestDto): Promise<SectionResponseDto> {
    try {
      const { id, title, pagination, filter } = sectionRequest;

      // Apply section-specific filtering based on section ID
      let sectionFilter: FindOptionsWhere<Product> = {};

      // Apply custom filter logic based on section ID
      switch (id) {
        case 'new-arrivals':
          // Products created in the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          sectionFilter = {
            createdAt: MoreThan(thirtyDaysAgo),
          };
          break;

        case 'featured':
          // Featured products - assuming we have a featured column
          // If the featured field doesn't exist in the Product entity, we need to add it
          sectionFilter = {
            // Use type assertion to handle custom properties
            featured: true as any,
          };
          break;

        case 'on-sale':
          // Products with a sale price
          sectionFilter = {
            compareAtPrice: Not(IsNull()),
          };
          break;

        case 'recommended':
          // This would typically use user preferences
          // For now, just use a basic filter
          sectionFilter = {};
          break;

        default:
          // Apply custom filters if provided
          if (filter) {
            sectionFilter = { ...filter };
          }
      }

      // Get products with cursor pagination
      // First, extend the pagination DTO with our filter
      const paginationWithFilter = {
        ...pagination,
        // We'll handle the filter separately in the service
      };

      // Pass the filter as a separate parameter or modify the query in the service
      // Use the updated findWithCursor method that accepts a filter parameter
      const result = await this.productsService.findWithCursor(paginationWithFilter, sectionFilter);

      // Normalize products to ensure consistent data
      const normalizedProducts = await Promise.all(
        result.items.map(product => this.dataNormalizationService.normalizeProduct(product)),
      );

      return {
        id,
        title,
        items: normalizedProducts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        totalCount: result.totalCount,
      };
    } catch (error) {
      this.logger.error(
        `Error loading section ${sectionRequest.id}: ${error.message}`,
        error.stack,
      );

      // Return empty section on error
      return {
        id: sectionRequest.id,
        title: sectionRequest.title,
        items: [],
        hasMore: false,
      };
    }
  }
}
