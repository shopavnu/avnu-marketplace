import { Args, Query, Resolver, ResolveField, Parent, Mutation } from '@nestjs/graphql';
import { AccessibilityService } from '../services/accessibility.service';
import { ProductsService } from '../products.service';
import {
  ProductAccessibilityDto,
  AriaAttributesDto,
  ImageAltTextDto,
} from '../dto/accessibility-metadata.dto';
import { Product } from '../entities/product.entity';

@Resolver(() => ProductAccessibilityDto)
export class AccessibilityResolver {
  constructor(
    private readonly accessibilityService: AccessibilityService,
    private readonly productsService: ProductsService,
  ) {}

  @Query(() => ProductAccessibilityDto)
  async productAccessibility(
    @Args('productId') productId: string,
  ): Promise<ProductAccessibilityDto> {
    const product = await this.productsService.findOne(productId);
    const enhancedProduct = await this.accessibilityService.enhanceProductAccessibility(product);

    // Convert to DTO format
    return {
      productId: product.id,
      accessibilityMetadata: {
        altText: enhancedProduct.accessibilityMetadata?.altText,
        ariaLabel: enhancedProduct.accessibilityMetadata?.ariaLabel,
        role: enhancedProduct.accessibilityMetadata?.role,
        longDescription: enhancedProduct.accessibilityMetadata?.longDescription,
        structuredData: enhancedProduct.accessibilityMetadata?.structuredData
          ? {
              type: 'Product',
              context: 'https://schema.org',
              name: product.title,
              description: product.description,
              brand: product.brandName,
            }
          : undefined,
      },
      imageAltTexts: product.images?.map(imageUrl => ({
        imageUrl,
        altText: enhancedProduct.imageAltTexts?.[imageUrl] || 'Product image',
      })),
    };
  }

  @Query(() => AriaAttributesDto)
  async productAriaAttributes(@Args('productId') productId: string): Promise<AriaAttributesDto> {
    const product = await this.productsService.findOne(productId);
    const ariaMetadata = this.accessibilityService.generateAriaMetadata(product);

    // Convert to DTO format
    return {
      productId: product.id,
      attributes: Object.entries(ariaMetadata).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }

  @Mutation(() => ProductAccessibilityDto)
  async generateProductAltText(
    @Args('productId') productId: string,
  ): Promise<ProductAccessibilityDto> {
    // Get the product
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

    // Return the updated product accessibility data
    return {
      productId: updatedProduct.id,
      accessibilityMetadata: {
        altText: updatedProduct.accessibilityMetadata?.altText,
        ariaLabel: updatedProduct.accessibilityMetadata?.ariaLabel,
        role: updatedProduct.accessibilityMetadata?.role,
        longDescription: updatedProduct.accessibilityMetadata?.longDescription,
        structuredData: updatedProduct.accessibilityMetadata?.structuredData
          ? {
              type: 'Product',
              context: 'https://schema.org',
              name: updatedProduct.title,
              description: updatedProduct.description,
              brand: updatedProduct.brandName,
            }
          : undefined,
      },
      imageAltTexts: Object.entries(imageAltTexts).map(([imageUrl, altText]) => ({
        imageUrl,
        altText,
      })),
    };
  }

  @ResolveField()
  async imageAltTexts(@Parent() product: Product): Promise<ImageAltTextDto[]> {
    if (!product.imageAltTexts && !product.images) {
      return [];
    }

    return product.images.map(imageUrl => ({
      imageUrl,
      altText: product.imageAltTexts?.[imageUrl] || 'Product image',
    }));
  }
}
