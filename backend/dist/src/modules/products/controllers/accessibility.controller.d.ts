import { AccessibilityService } from '../services/accessibility.service';
import { ProductsService } from '../products.service';
export declare class AccessibilityController {
  private readonly accessibilityService;
  private readonly productsService;
  constructor(accessibilityService: AccessibilityService, productsService: ProductsService);
  getProductAccessibilityMetadata(productId: string): Promise<{
    productId: string;
    accessibilityMetadata: {
      altText?: string;
      ariaLabel?: string;
      role?: string;
      longDescription?: string;
      structuredData?: Record<string, any>;
    };
  }>;
  getProductAriaAttributes(productId: string): Promise<{
    productId: string;
    attributes: Record<string, string>;
  }>;
  getProductStructuredData(productId: string): Promise<Record<string, any>>;
  generateAltText(productId: string): Promise<{
    productId: string;
    imageAltTexts: {
      imageUrl: string;
      altText: string;
    }[];
  }>;
  batchGenerateAltText(limit?: number): Promise<{
    processedCount: number;
    results: any[];
  }>;
}
