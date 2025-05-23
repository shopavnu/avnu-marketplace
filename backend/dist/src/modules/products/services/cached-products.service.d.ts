import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CursorPaginationDto, PaginatedResponseDto } from '../../../common/dto/cursor-pagination.dto';
import { ProductCacheService } from './product-cache.service';
import { ProductQueryOptimizerService } from './product-query-optimizer.service';
export declare class CachedProductsService {
    private readonly productsRepository;
    private readonly eventEmitter;
    private readonly productCacheService;
    private readonly queryOptimizerService;
    private readonly logger;
    constructor(productsRepository: Repository<Product>, eventEmitter: EventEmitter2, productCacheService: ProductCacheService, queryOptimizerService: ProductQueryOptimizerService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(paginationDto?: PaginationDto): Promise<{
        page: number;
        limit: number;
        totalPages: number;
        items: Product[];
        total: number;
    }>;
    findWithCursor(paginationDto: CursorPaginationDto, filter?: any): Promise<PaginatedResponseDto<Product>>;
    findOne(id: string): Promise<Product>;
    findByExternalId(externalId: string, externalSource: string): Promise<Product>;
    findByIds(ids: string[]): Promise<Product[]>;
    findAllForIndexing(): Promise<Product[]>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    search(query: string, paginationDto: PaginationDto, filters?: {
        categories?: string[];
        priceMin?: number;
        priceMax?: number;
        merchantId?: string;
        inStock?: boolean;
        values?: string[];
        featured?: boolean;
        isActive?: boolean;
    }): Promise<{
        items: Product[];
        total: number;
    }>;
    findByMerchant(merchantId: string, paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
    }>;
    updateStock(id: string, inStock: boolean, quantity?: number): Promise<Product>;
    bulkCreate(products: CreateProductDto[]): Promise<Product[]>;
    bulkUpdate(products: {
        id: string;
        data: UpdateProductDto;
    }[]): Promise<Product[]>;
    getRecommendedProducts(userId: string, limit?: number): Promise<Product[]>;
    getDiscoveryProducts(limit?: number): Promise<Product[]>;
}
