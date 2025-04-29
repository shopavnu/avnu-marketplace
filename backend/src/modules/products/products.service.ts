import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  LessThan,
  In,
  Like,
  MoreThan as _MoreThan,
  FindOperator as _FindOperator,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CursorPaginationDto, PaginatedResponseDto } from '../../common/dto/cursor-pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(newProduct);

    // Emit product created event
    this.eventEmitter.emit('product.created', savedProduct);

    return savedProduct;
  }

  /**
   * Find all products with offset-based pagination
   * @param paginationDto Pagination parameters
   * @returns Paginated products
   */
  async findAll(paginationDto?: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto || {};
    const skip = (page - 1) * limit;

    const [items, total] = await this.productsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find products with cursor-based pagination (ideal for continuous scroll)
   * @param paginationDto Cursor pagination parameters
   * @param filter Optional filter conditions
   * @returns Paginated products with cursor
   */
  async findWithCursor(
    paginationDto: CursorPaginationDto,
    filter?: FindOptionsWhere<Product>,
  ): Promise<PaginatedResponseDto<Product>> {
    const { cursor, limit = 20, withCount = false } = paginationDto;

    // Build query conditions
    let where: FindOptionsWhere<Product> = filter || {};
    let prevCursor: string | undefined;

    if (cursor) {
      try {
        // Decode cursor (base64 encoded JSON with id and createdAt)
        const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

        // Store previous cursor for backward navigation
        prevCursor = cursor;

        // Query for items created before the cursor
        where = {
          createdAt: LessThan(decodedCursor.createdAt),
        };

        // If we have an ID, add it to ensure stable ordering
        if (decodedCursor.id) {
          // Use a more specific approach for TypeORM
          where = {
            createdAt: LessThan(decodedCursor.createdAt),
          };
        }
      } catch (error) {
        this.logger.warn(`Invalid cursor format: ${error.message}`);
        // If cursor is invalid, start from the beginning
      }
    }

    // Execute query with limit + 1 to determine if there are more items
    const items = await this.productsRepository.find({
      where,
      take: limit + 1,
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });

    // Check if there are more items
    const hasMore = items.length > limit;
    if (hasMore) {
      // Remove the extra item we fetched
      items.pop();
    }

    // Generate next cursor from the last item
    let nextCursor: string | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      const cursorData = {
        id: lastItem.id,
        createdAt: lastItem.createdAt,
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    // Get total count if requested
    let totalCount: number | undefined;
    if (withCount) {
      totalCount = await this.productsRepository.count();
    }

    return {
      items,
      nextCursor,
      prevCursor,
      hasMore,
      totalCount,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByExternalId(externalId: string, externalSource: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { externalId, externalSource },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with external ID ${externalId} from ${externalSource} not found`,
      );
    }

    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];

    return this.productsRepository.find({
      where: { id: In(ids) },
    });
  }

  async findAllForIndexing(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const updatedProduct = this.productsRepository.merge(product, updateProductDto);
    const savedProduct = await this.productsRepository.save(updatedProduct);

    // Emit product updated event
    this.eventEmitter.emit('product.updated', savedProduct);

    return savedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Emit product deleted event
    this.eventEmitter.emit('product.deleted', id);
  }

  async search(
    query: string,
    paginationDto: PaginationDto,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
    },
  ): Promise<{ items: Product[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<Product> = {};

    // Add text search
    if (query) {
      where.title = Like(`%${query}%`);
    }

    // Add filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        // This is a simplification - for proper category filtering with simple-array
        // you might need a custom query or consider using a different approach
        // for storing categories (e.g., a join table)
        where.categories = Like(`%${filters.categories[0]}%`);
      }

      if (filters.merchantId) {
        where.merchantId = filters.merchantId;
      }

      if (filters.inStock !== undefined) {
        where.inStock = filters.inStock;
      }

      // Price filtering requires a custom query
      let query = this.productsRepository.createQueryBuilder('product');

      if (filters.priceMin !== undefined) {
        query = query.andWhere('product.price >= :priceMin', { priceMin: filters.priceMin });
      }

      if (filters.priceMax !== undefined) {
        query = query.andWhere('product.price <= :priceMax', { priceMax: filters.priceMax });
      }

      // Apply pagination
      query = query.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');

      const [items, total] = await query.getManyAndCount();
      return { items, total };
    }

    // If no price filters, use the repository's findAndCount
    const [items, total] = await this.productsRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findByMerchant(
    merchantId: string,
    paginationDto: PaginationDto,
  ): Promise<{ items: Product[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await this.productsRepository.findAndCount({
      where: { merchantId },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async updateStock(id: string, inStock: boolean, quantity?: number): Promise<Product> {
    const product = await this.findOne(id);

    product.inStock = inStock;

    if (quantity !== undefined) {
      product.quantity = quantity;
    }

    return this.productsRepository.save(product);
  }

  /**
   * Find products that don't have alt text for their images
   * @param limit Maximum number of products to return
   * @returns Array of products without alt text
   */
  async findProductsWithoutAltText(limit = 10): Promise<Product[]> {
    this.logger.log(`Finding up to ${limit} products without alt text`);

    // Find products that have images but no imageAltTexts or accessibilityMetadata
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.images IS NOT NULL')
      .andWhere('product.images != :emptyArray', { emptyArray: '{}' })
      .andWhere('(product.imageAltTexts IS NULL OR product.accessibilityMetadata IS NULL)')
      .orderBy('product.updatedAt', 'DESC')
      .take(limit)
      .getMany();

    this.logger.log(`Found ${products.length} products without alt text`);
    return products;
  }

  async bulkCreate(products: CreateProductDto[]): Promise<Product[]> {
    const newProducts = products.map(product => this.productsRepository.create(product));
    const savedProducts = await this.productsRepository.save(newProducts);

    // Emit bulk products created event
    this.eventEmitter.emit('products.bulk_created', savedProducts);

    return savedProducts;
  }

  async bulkUpdate(products: { id: string; data: UpdateProductDto }[]): Promise<Product[]> {
    const updatedProducts: Product[] = [];

    for (const item of products) {
      const product = await this.findOne(item.id);
      const updatedProduct = this.productsRepository.merge(product, item.data);
      const savedProduct = await this.productsRepository.save(updatedProduct);
      updatedProducts.push(savedProduct);

      // Emit product updated event for each product
      this.eventEmitter.emit('product.updated', savedProduct);
    }

    return updatedProducts;
  }

  async getRecommendedProducts(userId: string, limit = 10): Promise<Product[]> {
    // This is a placeholder for a recommendation engine
    // In a real implementation, this would use user behavior data and ML models

    // For now, just return some random products
    const products = await this.productsRepository.find({
      where: { isActive: true, inStock: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return products;
  }

  async getDiscoveryProducts(limit = 10): Promise<Product[]> {
    // This is a placeholder for the discovery algorithm
    // In a real implementation, this would use a mix of new, trending, and diverse products

    // For now, just return some random products
    const products = await this.productsRepository.find({
      where: { isActive: true, inStock: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return products;
  }
}
