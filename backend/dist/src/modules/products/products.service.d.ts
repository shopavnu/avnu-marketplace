import { Repository, FindOptionsWhere } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CursorPaginationDto, PaginatedResponseDto } from '../../common/dto/cursor-pagination.dto';
export declare class ProductsService {
    private readonly productsRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(productsRepository: Repository<Product>, eventEmitter: EventEmitter2);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(paginationDto?: PaginationDto): Promise<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findWithCursor(paginationDto: CursorPaginationDto, filter?: FindOptionsWhere<Product>): Promise<PaginatedResponseDto<Product>>;
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
    }): Promise<{
        items: Product[];
        total: number;
    }>;
    findByMerchant(merchantId: string, paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
    }>;
    updateStock(id: string, inStock: boolean, quantity?: number): Promise<Product>;
    findProductsWithoutAltText(limit?: number): Promise<Product[]>;
    bulkCreate(products: CreateProductDto[]): Promise<Product[]>;
    bulkUpdate(products: {
        id: string;
        data: UpdateProductDto;
    }[]): Promise<Product[]>;
    getRecommendedProducts(userId: string, limit?: number): Promise<Product[]>;
    getDiscoveryProducts(limit?: number): Promise<Product[]>;
}
