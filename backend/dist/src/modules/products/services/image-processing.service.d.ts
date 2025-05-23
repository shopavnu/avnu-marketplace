import { ConfigService } from '@nestjs/config';
export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    background?: string;
    withoutEnlargement?: boolean;
    generateThumbnail?: boolean;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    generateResponsiveSizes?: boolean;
}
export interface ProcessedImage {
    originalUrl: string;
    processedUrl: string;
    thumbnailUrl?: string;
    mobileUrl?: string;
    tabletUrl?: string;
    width: number;
    height: number;
    format: string;
    size: number;
}
export declare class ImageProcessingService {
    private readonly configService;
    private readonly logger;
    private readonly uploadDir;
    private readonly publicBaseUrl;
    private readonly defaultOptions;
    constructor(configService: ConfigService);
    private ensureUploadDirExists;
    processImage(imageUrl: string, options?: Partial<ImageProcessingOptions>): Promise<ProcessedImage>;
    private handleProcessingError;
    processImages(imageUrls: string[], options?: Partial<ImageProcessingOptions>): Promise<ProcessedImage[]>;
}
