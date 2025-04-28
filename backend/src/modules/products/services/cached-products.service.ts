import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  CursorPaginationDto,
  PaginatedResponseDto,
} from '../../../common/dto/cursor-pagination.dto';
import { ProductCacheService } from './product-cache.service';
import { ProductQueryOptimizerService } from './product-query-optimizer.service';

@Injectable()
export class CachedProductsService {
  private readonly logger = new Logger(CachedProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly eventEmitter: EventEmitter2,
    private readonly productCacheService: ProductCacheService,
    private readonly queryOptimizerService: ProductQueryOptimizerService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(newProduct);

    // Emit product created event
    this.eventEmitter.emit('product.created', savedProduct);

    return savedProduct;
  }

  async findAll(paginationDto?: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto || {};

    // Try to get from cache first
    const cachedProducts = await this.productCacheService.getCachedProductsList(page, limit);
    if (cachedProducts) {
      return {
        ...cachedProducts,
        page,
        limit,
        totalPages: Math.ceil(cachedProducts.total / limit),
      };
    }

    // If not in cache, fetch from database
    const startTime = Date.now();
    const skip = (page - 1) * limit;
    const [items, total] = await this.productsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const endTime = Date.now();

    // Emit response time without cache
    this.eventEmitter.emit('cache.response.time.without', endTime - startTime);

    const result = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result
    await this.productCacheService.cacheProductsList({ items, total }, page, limit);

    return result;
  }

  async findWithCursor(
    paginationDto: CursorPaginationDto,
    filter?: any, // Changed from FindOptionsWhere<Product> to avoid TypeScript errors
  ): Promise<PaginatedResponseDto<Product>> {
    const { cursor, limit = 20, withCount = false } = paginationDto;

    // Try to get from cache first
    const cachedProducts = await this.productCacheService.getCachedProductsByCursor(cursor, limit);
    if (cachedProducts) {
      return cachedProducts;
    }

    // Build query conditions
    let where: any = filter || {};
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
      where: where as any, // Type assertion to avoid TypeORM typing issues
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
    let total: number | undefined;
    if (withCount) {
      total = await this.productsRepository.count(where as any);
    }

    const result = {
      items,
      nextCursor,
      prevCursor,
      hasMore,
      total,
    };

    // Cache the result
    await this.productCacheService.cacheProductsByCursor(result, cursor, limit);

    return result;
  }

  async findOne(id: string): Promise<Product> {
    // Try to get from cache first
    const cachedProduct = await this.productCacheService.getCachedProduct(id);
    if (cachedProduct) {
      return cachedProduct;
    }

    // If not in cache, fetch from database
    const startTime = Date.now();
    const product = await this.productsRepository.findOne({
      where: { id } as any, // Type assertion to avoid TypeORM typing issues
    });
    const endTime = Date.now();

    // Emit response time without cache
    this.eventEmitter.emit('cache.response.time.without', endTime - startTime);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache the product
    await this.productCacheService.cacheProduct(product);

    return product;
  }

  async findByExternalId(externalId: string, externalSource: string): Promise<Product> {
    // This method is less frequently used, so we don't cache it directly
    const product = await this.productsRepository.findOne({
      where: { externalId, externalSource } as any, // Type assertion to avoid TypeORM typing issues
    });

    if (!product) {
      throw new NotFoundException(
        `Product with external ID ${externalId} from source ${externalSource} not found`,
      );
    }

    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    // For bulk operations, we check each product in cache first
    const products: Product[] = [];
    const missingIds: string[] = [];

    // Try to get each product from cache
    for (const id of ids) {
      const cachedProduct = await this.productCacheService.getCachedProduct(id);
      if (cachedProduct) {
        products.push(cachedProduct);
      } else {
        missingIds.push(id);
      }
    }

    // If some products are not in cache, fetch them from database
    if (missingIds.length > 0) {
      const fetchedProducts = await this.productsRepository.find({
        where: { id: In(missingIds) },
      });

      // Cache each fetched product
      for (const product of fetchedProducts) {
        await this.productCacheService.cacheProduct(product);
        products.push(product);
      }
    }

    return products;
  }

  async findAllForIndexing(): Promise<Product[]> {
    // This is used for search indexing, so we don't cache it
    return this.productsRepository.find();
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
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);

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
      featured?: boolean;
      isActive?: boolean;
    },
  ): Promise<{ items: Product[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;

    // Try to get from cache first
    const cachedResults = await this.productCacheService.getCachedSearchProducts(
      query,
      page,
      limit,
      filters,
    );
    if (cachedResults) {
      return cachedResults;
    }

    // Skip calculation not needed with query optimizer

    // Use the query optimizer service for efficient search with caching
    const queryFilters = {
      ...filters,
      searchQuery: query,
      isActive: true, // Default to active products
    };

    return this.queryOptimizerService.optimizedQuery(queryFilters, paginationDto);
  }

  async findByMerchant(
    merchantId: string,
    paginationDto: PaginationDto,
  ): Promise<{ items: Product[]; total: number }> {
    // Use the query optimizer service for efficient merchant filtering with caching
    return this.queryOptimizerService.optimizedQuery(
      {
        merchantId: merchantId,
        isActive: true,
      },
      paginationDto,
    );
  }

  async updateStock(id: string, inStock: boolean, quantity?: number): Promise<Product> {
    const product = await this.findOne(id);

    product.inStock = inStock;

    if (quantity !== undefined) {
      product.quantity = quantity;
    }

    const updatedProduct = await this.productsRepository.save(product);

    // Emit product updated event
    this.eventEmitter.emit('product.updated', updatedProduct);

    return updatedProduct;
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

    // Emit bulk products updated event
    this.eventEmitter.emit('products.bulk_updated', updatedProducts);

    return updatedProducts;
  }

  async getRecommendedProducts(userId: string, limit = 10): Promise<Product[]> {
    // Try to get from cache first
    const cachedProducts = await this.productCacheService.getCachedRecommendedProducts(
      userId,
      limit,
    );
    if (cachedProducts) {
      return cachedProducts;
    }

    // This is a placeholder for a recommendation engine
    // In a real implementation, this would use user behavior data and ML models

    // Use query optimizer for better performance
    const { items } = await this.queryOptimizerService.optimizedQuery(
      { isActive: true, inStock: true, featured: true },
      { limit },
    );

    // Cache the results
    await this.productCacheService.cacheRecommendedProducts(userId, items, limit);

    return items;
  }

  async getDiscoveryProducts(limit = 10): Promise<Product[]> {
    // Try to get from cache first
    const cachedProducts = await this.productCacheService.getCachedDiscoveryProducts(limit);
    if (cachedProducts) {
      return cachedProducts;
    }

    // This is a placeholder for the discovery algorithm
    // In a real implementation, this would use a mix of new, trending, and diverse products

    // Use query optimizer for better performance
    const { items } = await this.queryOptimizerService.optimizedQuery(
      { isActive: true, inStock: true },
      { limit },
    );

    // Cache the results
    await this.productCacheService.cacheDiscoveryProducts(items, limit);

    return items;
  }
}
