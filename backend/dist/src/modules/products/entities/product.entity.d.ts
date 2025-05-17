declare class AccessibilityMetadata {
    altText?: string;
    ariaLabel?: string;
    role?: string;
    longDescription?: string;
    structuredData?: Record<string, any>;
}
declare class ImageMetadata {
    width: number;
    height: number;
    format: string;
    aspectRatio?: number;
    size?: number;
}
declare class ProductAttributes {
    size?: string;
    color?: string;
    material?: string;
    weight?: string;
    dimensions?: string;
    customAttributes?: string[];
}
export declare class Product {
    id: string;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    imageMetadata?: ImageMetadata[];
    mobileImages?: string[];
    tabletImages?: string[];
    responsiveImageData?: Record<string, {
        desktop: string;
        tablet?: string;
        mobile?: string;
    }>;
    thumbnail?: string;
    categories: string[];
    tags?: string[];
    merchantId: string;
    brandName: string;
    brandInfo?: {
        name: string;
        id: string;
    } | string;
    isActive: boolean;
    inStock: boolean;
    featured: boolean;
    quantity?: number;
    values?: string[];
    attributes?: ProductAttributes;
    externalId: string;
    externalSource: string;
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
    isSuppressed: boolean;
    suppressedFrom?: string[];
    lastValidationDate?: Date;
    accessibilityMetadata?: AccessibilityMetadata;
    imageAltTexts?: Record<string, string>;
    get isOnSale(): boolean;
    get discountPercentage(): number | null;
}
export {};
