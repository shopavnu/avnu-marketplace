import { Injectable, Logger } from '@nestjs/common';
import { Product } from '../src/modules/products/entities/product.entity';
import { PaginationDto } from '../src/common/dto/pagination.dto';

/**
 * Mock search service for testing NLP functionality
 */
@Injectable()
export class MockSearchService {
  private readonly logger = new Logger(MockSearchService.name);

  /**
   * Mock search products method
   */
  async searchProducts(
    query: string,
    paginationDto: PaginationDto,
    filters?: Record<string, any>,
  ): Promise<{
    items: Product[];
    total: number;
  }> {
    this.logger.log(`Mock search for: ${query}`);
    if (filters) {
      this.logger.log(`With filters: ${JSON.stringify(filters)}`);
    }

    // Return mock data
    return {
      items: [],
      total: 0,
    };
  }

  /**
   * Mock get product suggestions method
   */
  async getProductSuggestions(partialQuery: string, limit = 5): Promise<string[]> {
    this.logger.log(`Mock suggestions for: ${partialQuery}`);

    // Return mock suggestions
    return [
      `${partialQuery} suggestion 1`,
      `${partialQuery} suggestion 2`,
      `${partialQuery} suggestion 3`,
    ];
  }
}
