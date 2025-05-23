import { ConfigService } from '@nestjs/config';
import { ImageProcessingService } from './image-processing.service';
import { ImageValidationService } from './image-validation.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
export declare enum DataSource {
    SHOPIFY = "shopify",
    WOOCOMMERCE = "woocommerce",
    ETSY = "etsy",
    MANUAL = "manual",
    API = "api"
}
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    aspectRatio?: number;
    size?: number;
}
export interface ProcessedImagesResult {
    validImages: string[];
    invalidImages: string[];
    metadata: ImageMetadata[];
    mobileImages?: string[];
    tabletImages?: string[];
    responsiveImageData?: {
        [key: string]: {
            desktop: string;
            tablet?: string;
            mobile?: string;
        };
    };
}
export interface NormalizationOptions {
    processImages: boolean;
    validateImages: boolean;
    sanitizeText: boolean;
    enforceRequiredFields: boolean;
}
export interface NormalizedProductAttributes {
    size?: string;
    color?: string;
    material?: string;
    weight?: string;
    dimensions?: string;
    [key: string]: string | undefined;
}
export declare class DataNormalizationService {
    private readonly imageValidationService;
    private readonly imageProcessingService;
    private readonly configService;
    private readonly logger;
    private readonly requiredFields;
    constructor(imageValidationService: ImageValidationService, imageProcessingService: ImageProcessingService, configService: ConfigService);
    private readonly defaultImages;
    private generateSlug;
    private sanitizeText;
    private sanitizeHtml;
    private getPlaceholderImages;
    private extractEtsyImages;
    private extractEtsyCategories;
    private processProductImages;
    normalizeProductData(productData: any, source: string, options?: Partial<NormalizationOptions>): Promise<CreateProductDto>;
    private normalizeShopifyProduct;
    private extractShopifyAttributes;
    private normalizeWooCommerceProduct;
    private extractWooCommerceBrand;
    private extractWooCommerceAttributes;
    private normalizeEtsyProduct;
    private extractEtsyAttributes;
    private enforceRequiredFields;
    updateProductWithDto(productId: string, updateDto: Partial<CreateProductDto>): Promise<Partial<UpdateProductDto>>;
    normalizeProduct(product: Product): Promise<Product>;
}
