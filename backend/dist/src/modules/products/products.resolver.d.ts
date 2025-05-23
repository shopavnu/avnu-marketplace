import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
declare class UpdateProductInput {
    id: string;
    data: UpdateProductDto;
}
export declare class ProductsResolver {
    private readonly productsService;
    constructor(productsService: ProductsService);
    createProduct(createProductDto: CreateProductDto): Promise<Product>;
    findAll(paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Product>;
    search(query: string, paginationDto: PaginationDto, categories?: string[], priceMin?: number, priceMax?: number, merchantId?: string, inStock?: boolean, values?: string[]): Promise<{
        items: Product[];
        total: number;
    }>;
    getRecommendedProducts(userId: string, limit?: number): Promise<Product[]>;
    getDiscoveryProducts(limit?: number): Promise<Product[]>;
    findByMerchant(merchantId: string, paginationDto: PaginationDto): Promise<{
        items: Product[];
        total: number;
    }>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    removeProduct(id: string): boolean;
    updateProductStock(id: string, inStock: boolean, quantity?: number): Promise<Product>;
    bulkCreateProducts(products: CreateProductDto[]): Promise<Product[]>;
    bulkUpdateProducts(products: UpdateProductInput[]): Promise<Product[]>;
}
export {};
