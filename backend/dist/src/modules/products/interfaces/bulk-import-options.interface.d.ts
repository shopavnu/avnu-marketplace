import { DataSource } from '../enums/data-source.enum';
export interface BulkImportOptions {
    source: DataSource;
    skipValidation?: boolean;
    updateExisting?: boolean;
    processImages?: boolean;
    generateSlugs?: boolean;
    batchSize?: number;
    merchantId?: string;
    normalize?: boolean;
    fieldMapping?: Record<string, string>;
}
