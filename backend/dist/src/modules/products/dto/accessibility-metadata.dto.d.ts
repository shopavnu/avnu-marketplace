export declare class StructuredDataDto {
    type: string;
    context: string;
    name?: string;
    description?: string;
    brand?: string;
    images?: string[];
    imageAlts?: string[];
}
export declare class AccessibilityMetadataDto {
    altText?: string;
    ariaLabel?: string;
    role?: string;
    longDescription?: string;
    structuredData?: StructuredDataDto;
}
export declare class ProductAccessibilityDto {
    productId: string;
    accessibilityMetadata: AccessibilityMetadataDto;
    imageAltTexts?: ImageAltTextDto[];
}
export declare class ImageAltTextDto {
    imageUrl: string;
    altText: string;
}
export declare class AriaAttributesDto {
    productId: string;
    attributes: AriaAttributeDto[];
}
export declare class AriaAttributeDto {
    name: string;
    value: string;
}
