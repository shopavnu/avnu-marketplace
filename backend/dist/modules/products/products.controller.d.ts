import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import(".").Product>;
    findAll(paginationDto: PaginationDto): Promise<{
        items: import(".").Product[];
        total: number;
    }>;
    search(query: string, paginationDto: PaginationDto, categories?: string[], priceMin?: number, priceMax?: number, merchantId?: string, inStock?: boolean, values?: string[]): Promise<{
        items: import(".").Product[];
        total: number;
    }>;
    getRecommendedProducts(userId: string, limit?: number): Promise<import(".").Product[]>;
    getDiscoveryProducts(limit?: number): Promise<import(".").Product[]>;
    findByMerchant(merchantId: string, paginationDto: PaginationDto): Promise<{
        items: import(".").Product[];
        total: number;
    }>;
    findOne(id: string): Promise<import(".").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import(".").Product>;
    remove(id: string): Promise<void>;
    updateStock(id: string, body: {
        inStock: boolean;
        quantity?: number;
    }): Promise<import(".").Product>;
    bulkCreate(products: CreateProductDto[]): Promise<import(".").Product[]>;
    bulkUpdate(products: {
        id: string;
        data: UpdateProductDto;
    }[]): Promise<import(".").Product[]>;
}
