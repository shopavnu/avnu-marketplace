import { ResilientCacheService } from '../../../common/services/resilient-cache.service';
import { Product } from '../entities/product.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
interface PaginationCacheOptions {
    keyPrefix: string;
    filters: Record<string, any>;
    totalItems: number;
    pageSize: number;
    ttl?: number;
}
interface PaginationCacheMetadata {
    totalItems: number;
    pageSize: number;
    totalPages: number;
    lastUpdated: number;
    keyPrefix: string;
    filters: Record<string, any>;
}
export declare class PaginationCacheService {
    private readonly cacheService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly DEFAULT_TTL;
    private readonly METADATA_TTL;
    constructor(cacheService: ResilientCacheService, eventEmitter: EventEmitter2);
    cachePage(page: number, items: Product[], options: PaginationCacheOptions): Promise<void>;
    getPage(keyPrefix: string, filters: Record<string, any>, page: number): Promise<{
        items: Product[];
        metadata: PaginationCacheMetadata;
    } | null>;
    invalidatePages(keyPrefix: string, filters: Record<string, any>): Promise<void>;
    invalidateAllPages(): Promise<void>;
    invalidateRelatedPages(product: Product): Promise<void>;
    private generatePageKey;
    determineOptimalTtl(keyPrefix: string, filters: Record<string, any>, page: number): Promise<number>;
}
export {};
