import { ConfigService } from '@nestjs/config';
import { Product } from '../entities/product.entity';
export interface AccessibilityMetadata {
  altText?: string;
  ariaLabel?: string;
  role?: string;
  longDescription?: string;
  structuredData?: Record<string, any>;
}
export declare class AccessibilityService {
  private readonly configService;
  private readonly logger;
  private readonly aiVisionApiKey;
  private readonly aiVisionEndpoint;
  private readonly enableAltTextGeneration;
  constructor(configService: ConfigService);
  generateAltText(imageUrl: string, productContext?: Partial<Product>): Promise<string>;
  private generateFallbackAltText;
  generateAriaMetadata(product: Product): Record<string, string>;
  generateStructuredData(
    product: Product,
    imageAltTexts?: Record<string, string>,
  ): Record<string, any>;
  enhanceProductAccessibility(product: Product): Promise<Product>;
}
