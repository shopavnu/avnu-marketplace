import { ConfigService } from '@nestjs/config';
export interface ImageValidationOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedFormats?: string[];
    maxFileSize?: number;
    requiredAspectRatio?: number;
    aspectRatioTolerance?: number;
}
export interface ImageMetadata {
    width: number;
    height: number;
    type: string;
    size?: number;
    aspectRatio: number;
}
export interface ImageValidationResult {
    isValid: boolean;
    width?: number;
    height?: number;
    format?: string;
    aspectRatio?: number;
    size?: number;
    error?: string;
}
export declare class ImageValidationService {
    private readonly configService;
    private readonly defaultOptions;
    private readonly logger;
    constructor(configService: ConfigService);
    validateImage(imageUrl: string, options?: ImageValidationOptions): Promise<ImageValidationResult>;
    validateImages(imageUrls: string[], options?: ImageValidationOptions): Promise<ImageValidationResult[]>;
    areAllImagesValid(imageUrls: string[]): Promise<boolean>;
    getValidImages(imageUrls: string[]): Promise<string[]>;
    private isValidUrl;
}
