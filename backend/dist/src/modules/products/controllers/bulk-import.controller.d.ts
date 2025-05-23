import { BulkImportService, ImportResult, BulkImportOptions } from '../services/bulk-import.service';
import { DataSource } from '../services/data-normalization.service';
declare class BulkImportDto {
    products: any[];
    options?: Partial<BulkImportOptions>;
}
declare class SourceImportDto {
    data: any;
    options?: Partial<BulkImportOptions>;
}
declare class ProcessExistingDto {
    productIds?: string[];
    options?: {
        processImages?: boolean;
        updateSlug?: boolean;
        batchSize?: number;
    };
}
export declare class BulkImportController {
    private readonly bulkImportService;
    private readonly logger;
    constructor(bulkImportService: BulkImportService);
    importProducts(importDto: BulkImportDto): Promise<ImportResult>;
    importFromShopify(importDto: SourceImportDto): Promise<ImportResult>;
    importFromWooCommerce(importDto: SourceImportDto): Promise<ImportResult>;
    importFromEtsy(importDto: SourceImportDto): Promise<ImportResult>;
    validateProducts(importDto: BulkImportDto, source?: DataSource): Promise<{
        valid: import("../dto/create-product.dto").CreateProductDto[];
        invalid: Array<{
            index: number;
            errors: string[];
        }>;
    }>;
    processExistingProducts(processDto: ProcessExistingDto): Promise<{
        total: number;
        processed: number;
        failed: number;
        errors: Array<{
            id: string;
            error: string;
        }>;
    }>;
}
export {};
