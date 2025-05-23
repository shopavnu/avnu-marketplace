import { ProductAttributesDto } from './product-attributes.dto';
export declare class CreateProductDto {
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    slug?: string;
    thumbnail?: string;
    categories: string[];
    tags?: string[];
    attributes?: ProductAttributesDto;
    merchantId: string;
    brandName: string;
    isActive?: boolean;
    inStock?: boolean;
    quantity?: number;
    values?: string[];
    externalId: string;
    externalSource: string;
}
