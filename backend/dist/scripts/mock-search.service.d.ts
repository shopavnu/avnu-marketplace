import { Product } from '../src/modules/products/entities/product.entity';
import { PaginationDto } from '../src/common/dto/pagination.dto';
export declare class MockSearchService {
    private readonly logger;
    searchProducts(query: string, paginationDto: PaginationDto, filters?: Record<string, any>): Promise<{
        items: Product[];
        total: number;
    }>;
    getProductSuggestions(partialQuery: string, limit?: number): Promise<string[]>;
}
