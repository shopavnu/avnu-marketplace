import { DeepPartial } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
interface BrandInfo {
    id: string;
    name: string;
    description: string;
    logo: string;
    website: string;
}
interface ExtendedCreateProductDto extends CreateProductDto {
    brandName?: string;
    [key: string]: unknown;
}
interface ExtendedUpdateProductDto extends UpdateProductDto {
    brandName?: string;
    [key: string]: unknown;
}
interface ImageMetadata {
    url: string;
    width?: number;
    height?: number;
    altText?: string;
    position?: number;
    format: string;
}
export declare function transformProductImages(images?: ProductImageDto[]): {
    images?: string[];
    imageMetadata?: ImageMetadata[];
};
export declare function transformBrandInfo(brandName?: string): BrandInfo | undefined;
export declare function transformCreateProductDto(dto: ExtendedCreateProductDto): DeepPartial<Product>;
export declare function transformUpdateProductDto(dto: ExtendedUpdateProductDto): DeepPartial<Product>;
export declare function transformProductToDto(product: Product): Record<string, unknown>;
export declare const productDtoConfig: {
    jsonFields: {
        merchantId: string;
    };
    transform: {
        images: {
            targetPath: string[];
            transformer: (images: ProductImageDto[]) => any[];
        };
        brandName: {
            targetPath: string[];
            transformer: typeof transformBrandInfo;
        };
    };
    customTransformers: {
        images: (images: ProductImageDto[], obj: unknown) => string[];
    };
};
export {};
