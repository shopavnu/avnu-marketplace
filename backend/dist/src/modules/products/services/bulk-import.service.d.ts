import { ConfigService } from '@nestjs/config';
import { DataNormalizationService, DataSource } from './data-normalization.service';
import { ProductsService } from '../products.service';
import { CreateProductDto } from '../dto/create-product.dto';
export interface ImportResult {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{
        index: number;
        externalId?: string;
        error: string;
    }>;
    products: string[];
}
export interface BulkImportOptions {
    source: DataSource;
    merchantId: string;
    skipExisting: boolean;
    batchSize: number;
    validateOnly: boolean;
    processImages: boolean;
}
export declare class BulkImportService {
    private readonly dataNormalizationService;
    private readonly productsService;
    private readonly configService;
    private readonly logger;
    constructor(dataNormalizationService: DataNormalizationService, productsService: ProductsService, configService: ConfigService);
    importProducts(products: any[], options?: Partial<BulkImportOptions>): Promise<ImportResult>;
    importFromShopify(shopifyData: any, options?: Partial<BulkImportOptions>): Promise<ImportResult>;
    importFromWooCommerce(wooCommerceData: any, options?: Partial<BulkImportOptions>): Promise<ImportResult>;
    importFromEtsy(etsyData: any, options?: Partial<BulkImportOptions>): Promise<ImportResult>;
    validateProducts(products: any[], source?: DataSource): Promise<{
        valid: CreateProductDto[];
        invalid: Array<{
            index: number;
            errors: string[];
        }>;
    }>;
    processExistingProducts(productIds?: string[], options?: {
        processImages?: boolean;
        updateSlug?: boolean;
        batchSize?: number;
    }): Promise<{
        total: number;
        processed: number;
        failed: number;
        errors: Array<{
            id: string;
            error: string;
        }>;
    }>;
    private chunkArray;
}
