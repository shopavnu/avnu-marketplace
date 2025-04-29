import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AccessibilityService } from '../services/accessibility.service';
import { ProductsService } from '../products.service';

@Controller('products/accessibility')
export class AccessibilityController {
  constructor(
    private readonly accessibilityService: AccessibilityService,
    private readonly productsService: ProductsService,
  ) {}

  @Get(':productId/metadata')
  async getProductAccessibilityMetadata(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);
    const enhancedProduct = await this.accessibilityService.enhanceProductAccessibility(product);

    return {
      productId: product.id,
      accessibilityMetadata: enhancedProduct.accessibilityMetadata,
    };
  }

  @Get(':productId/aria')
  async getProductAriaAttributes(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);
    const ariaMetadata = this.accessibilityService.generateAriaMetadata(product);

    return {
      productId: product.id,
      attributes: ariaMetadata,
    };
  }

  @Get(':productId/structured-data')
  async getProductStructuredData(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);
    const structuredData = this.accessibilityService.generateStructuredData(
      product,
      product.imageAltTexts,
    );

    return structuredData;
  }

  @Post(':productId/alt-text')
  async generateAltText(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);

    // Generate alt text for all images
    const imageAltTexts: Record<string, string> = {};

    if (product.images && product.images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        imageAltTexts[imageUrl] = await this.accessibilityService.generateAltText(imageUrl, {
          ...product,
          title: i === 0 ? product.title : `${product.title} - View ${i + 1}`,
        });
      }
    }

    // Update the product with the new alt texts
    const updatedProduct = await this.productsService.update(productId, {
      imageAltTexts,
      accessibilityMetadata: {
        altText: imageAltTexts[product.images?.[0] || ''],
        ariaLabel: `${product.brandName} ${product.title}`,
        role: 'article',
      },
    });

    return {
      productId: updatedProduct.id,
      imageAltTexts: Object.entries(imageAltTexts).map(([imageUrl, altText]) => ({
        imageUrl,
        altText,
      })),
    };
  }

  @Get('batch/alt-text')
  async batchGenerateAltText(@Query('limit') limit = 10) {
    // Get products without alt text, limited by the specified limit
    const products = await this.productsService.findProductsWithoutAltText(limit);
    const results = [];

    for (const product of products) {
      // Generate alt text for all images
      const imageAltTexts: Record<string, string> = {};

      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const imageUrl = product.images[i];
          imageAltTexts[imageUrl] = await this.accessibilityService.generateAltText(imageUrl, {
            ...product,
            title: i === 0 ? product.title : `${product.title} - View ${i + 1}`,
          });
        }
      }

      // Update the product with the new alt texts
      const updatedProduct = await this.productsService.update(product.id, {
        imageAltTexts,
        accessibilityMetadata: {
          altText: imageAltTexts[product.images?.[0] || ''],
          ariaLabel: `${product.brandName} ${product.title}`,
          role: 'article',
        },
      });

      results.push({
        productId: updatedProduct.id,
        title: updatedProduct.title,
        altTextGenerated: Object.keys(imageAltTexts).length,
      });
    }

    return {
      processedCount: results.length,
      results,
    };
  }
}
