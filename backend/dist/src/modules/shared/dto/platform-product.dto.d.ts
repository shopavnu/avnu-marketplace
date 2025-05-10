import { PlatformType } from '../enums/platform-type.enum';
import { PlatformProductVariantDto } from '../interfaces/product-integration.interface';
export declare class PlatformProductDto {
    id?: string;
    name: string;
    description?: string;
    price: number;
    sku?: string;
    quantity?: number;
    images?: string[];
    platformType: PlatformType;
    categories?: string[];
    tags?: string[];
    variants?: PlatformProductVariantDto[];
    attributes?: Record<string, string>;
    metadata?: Record<string, unknown>;
}
