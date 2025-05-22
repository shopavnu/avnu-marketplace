import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Product } from '../entities/product.entity';

export interface AccessibilityMetadata {
  altText?: string;
  ariaLabel?: string;
  role?: string;
  longDescription?: string;
  structuredData?: Record<string, any>;
}

@Injectable()
export class AccessibilityService {
  private readonly logger = new Logger(AccessibilityService.name);
  private readonly aiVisionApiKey: string;
  private readonly aiVisionEndpoint: string;
  private readonly enableAltTextGeneration: boolean;

  constructor(private readonly configService: ConfigService) {
    this.aiVisionApiKey = this.configService.get('AI_VISION_API_KEY') || '';
    this.aiVisionEndpoint =
      this.configService.get('AI_VISION_ENDPOINT') || 'https://api.vision.ai/v1/analyze';
    this.enableAltTextGeneration = this.configService.get('ENABLE_ALT_TEXT_GENERATION') === 'true';
  }

  /**
   * Generate alt text for an image using AI vision services
   * @param imageUrl URL of the image to analyze
   * @param productContext Optional product context to improve alt text generation
   * @returns Generated alt text
   */
  async generateAltText(imageUrl: string, productContext?: Partial<Product>): Promise<string> {
    try {
      if (!this.enableAltTextGeneration || !this.aiVisionApiKey) {
        return this.generateFallbackAltText(productContext);
      }

      const response = await axios.post(
        this.aiVisionEndpoint,
        {
          image: { url: imageUrl },
          features: [{ type: 'IMAGE_DESCRIPTION', maxResults: 1 }],
          productContext: {
            title: productContext?.title,
            description: productContext?.description,
            category: productContext?.categories?.[0],
            brand: productContext?.brandName,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.aiVisionApiKey}`,
          },
        },
      );

      const responseData = response.data as any;
      if (responseData?.descriptions?.[0]?.text) {
        return responseData.descriptions[0].text;
      }

      return this.generateFallbackAltText(productContext);
    } catch (error) {
      this.logger.warn(`Alt text generation failed: ${error.message}`);
      return this.generateFallbackAltText(productContext);
    }
  }

  /**
   * Generate fallback alt text based on product information
   * @param productContext Product context information
   * @returns Fallback alt text
   */
  private generateFallbackAltText(productContext?: Partial<Product>): string {
    if (!productContext) {
      return 'Product image';
    }

    const { title, brandName, categories } = productContext;
    const category = categories?.[0] || '';

    if (title && brandName && category) {
      return `${brandName} ${title} - ${category} product image`;
    } else if (title && brandName) {
      return `${brandName} ${title} product image`;
    } else if (title) {
      return `${title} product image`;
    }

    return 'Product image';
  }

  /**
   * Generate ARIA metadata for a product
   * @param product Product entity
   * @returns ARIA metadata
   */
  generateAriaMetadata(product: Product): Record<string, string> {
    const ariaMetadata: Record<string, string> = {
      'aria-label': `${product.brandName} ${product.title}`,
      role: 'article',
    };

    if (product.inStock === false) {
      ariaMetadata['aria-disabled'] = 'true';
    }

    if (product.isOnSale) {
      ariaMetadata['aria-description'] =
        `On sale: ${product.discountPercentage}% off. Original price: ${product.compareAtPrice}, current price: ${product.price}`;
    }

    return ariaMetadata;
  }

  /**
   * Generate structured data for a product (Schema.org Product)
   * @param product Product entity
   * @param imageAltTexts Optional map of image URLs to alt texts
   * @returns Structured data object
   */
  generateStructuredData(
    product: Product,
    imageAltTexts?: Record<string, string>,
  ): Record<string, any> {
    const baseUrl = this.configService.get('PUBLIC_BASE_URL') || 'http://localhost:3000';
    const productUrl = `${baseUrl}/products/${product.slug || product.id}`;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brandName,
      },
      sku: product.externalId,
      mpn: product.id,
      offers: {
        '@type': 'Offer',
        url: productUrl,
        price: product.price,
        priceCurrency: 'USD',
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Avnu Marketplace',
        },
      },
    };

    // Add images with alt text if available
    if (product.images && product.images.length > 0) {
      structuredData['image'] = product.images.map(imageUrl => {
        const imageData: Record<string, any> = { '@type': 'ImageObject', url: imageUrl };

        // Add alt text if available
        if (imageAltTexts && imageAltTexts[imageUrl]) {
          imageData.accessibilityHazard = 'none';
          imageData.description = imageAltTexts[imageUrl];
        }

        return imageData;
      });
    }

    return structuredData;
  }

  /**
   * Process a product to enhance it with accessibility metadata
   * @param product Product to enhance
   * @returns Enhanced product with accessibility metadata
   */
  async enhanceProductAccessibility(product: Product): Promise<Product> {
    // Generate alt texts for all images
    const imageAltTexts: Record<string, string> = {};

    if (product.images && product.images.length > 0) {
      // Process primary image with more detailed alt text
      const primaryImage = product.images[0];
      imageAltTexts[primaryImage] = await this.generateAltText(primaryImage, product);

      // Process remaining images with simpler alt text
      for (let i = 1; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        imageAltTexts[imageUrl] = await this.generateAltText(imageUrl, {
          title: `${product.title} - View ${i + 1}`,
          brandName: product.brandName,
        });
      }
    }

    // Generate ARIA metadata
    const ariaMetadata = this.generateAriaMetadata(product);

    // Generate structured data
    const structuredData = this.generateStructuredData(product, imageAltTexts);

    // Combine all accessibility metadata
    const accessibilityMetadata: AccessibilityMetadata = {
      altText: imageAltTexts[product.images?.[0] || ''],
      ariaLabel: ariaMetadata['aria-label'],
      role: ariaMetadata['role'],
      structuredData,
    };

    // Update the product with the accessibility metadata
    product.accessibilityMetadata = accessibilityMetadata;
    product.imageAltTexts = imageAltTexts;

    return product;
  }
}
