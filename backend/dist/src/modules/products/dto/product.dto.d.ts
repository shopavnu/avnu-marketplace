export declare class VariantDto {
    optionName: string;
    optionValue: string;
    stock: number;
}
export declare class CreateProductDto {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    brandId: string;
    variants?: VariantDto[];
}
export declare class UpdateProductDto {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    brandId?: string;
}
export declare class ProductResponseDto {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
    brandId: string;
    brand?: any;
    variants?: any[];
}
