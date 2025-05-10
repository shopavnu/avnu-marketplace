import { Product } from '../entities/product.entity';
export declare class SchemaCompatibility {
    static getBrandName(product: Product | Partial<Product> | null | undefined): string;
    static getCategories(product: Product | Partial<Product> | null | undefined): string[];
    static getPrimaryImage(product: Product | Partial<Product> | null | undefined): string;
    static getPrice(product: Product | Partial<Product> | null | undefined): number;
}
