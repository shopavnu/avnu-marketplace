import { CreateProductDto } from './create-product.dto';
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    title?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    images?: string[];
    thumbnail?: string;
    categories?: string[];
    tags?: string[];
    brandName?: string;
    isActive?: boolean;
    inStock?: boolean;
    quantity?: number;
    values?: string[];
}
export {};
