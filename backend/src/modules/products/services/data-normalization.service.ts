import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageProcessingService } from './image-processing.service';
import { ImageValidationService } from './image-validation.service';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import sanitizeHtml from 'sanitize-html';

/**
 * Supported external data sources
 */
export enum DataSource {
  SHOPIFY = 'shopify',
  WOOCOMMERCE = 'woocommerce',
  ETSY = 'etsy',
  MANUAL = 'manual',
  API = 'api',
}

/**
 * Image metadata from validation
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  aspectRatio?: number;
  size?: number;
}

/**
 * Result of image processing
 */
export interface ProcessedImagesResult {
  validImages: string[];
  invalidImages: string[];
  metadata: ImageMetadata[];
  mobileImages?: string[]; // URLs for mobile-sized images (400x400)
  tabletImages?: string[]; // URLs for tablet-sized images (600x600)
  responsiveImageData?: {
    [key: string]: {
      desktop: string;
      tablet?: string;
      mobile?: string;
    };
  };
}

/**
 * Normalization options
 */
export interface NormalizationOptions {
  processImages: boolean;
  validateImages: boolean;
  sanitizeText: boolean;
  enforceRequiredFields: boolean;
}

/**
 * Normalized product attributes structure
 */
export interface NormalizedProductAttributes {
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  [key: string]: string | undefined;
}

/**
 * Service for normalizing product data from various sources
 */
@Injectable()
export class DataNormalizationService {
  private readonly logger = new Logger(DataNormalizationService.name);
  private readonly requiredFields: (keyof CreateProductDto)[] = [
    'title',
    'description',
    'price',
    'images',
    'categories',
    'merchantId',
    'brandName',
    'externalId',
    'externalSource',
  ];

  constructor(
    private readonly imageValidationService: ImageValidationService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly configService: ConfigService,
  ) {}

  // Default placeholder images if none provided
  private readonly defaultImages = [
    'https://via.placeholder.com/800x800?text=Product+Image',
    'https://via.placeholder.com/800x800?text=No+Image+Available',
  ];

  /**
   * Generate a URL-friendly slug from a title
   */
  private generateSlug(title: string): string {
    if (!title) return '';

    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100); // Limit slug length
  }

  /**
   * Sanitize text fields to prevent XSS
   */
  private sanitizeText(text: string): string {
    if (!text) return '';
    return text.trim();
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  private sanitizeHtml(html: string): string {
    if (!html) return '';
    return sanitizeHtml(html, {
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br'],
      allowedAttributes: {},
    });
  }

  /**
   * Get placeholder images if none provided
   */
  private getPlaceholderImages(): string[] {
    return [...this.defaultImages];
  }

  /**
   * Extract images from Etsy product data
   */
  private extractEtsyImages(etsyProduct: any): string[] {
    if (!etsyProduct.images || !etsyProduct.images.length) {
      return this.getPlaceholderImages();
    }

    return etsyProduct.images.map(img => img.url_fullxfull || img.url_570xN).filter(Boolean);
  }

  /**
   * Extract categories from Etsy product data
   */
  private extractEtsyCategories(etsyProduct: any): string[] {
    const categories = [];

    if (etsyProduct.taxonomy_path) {
      const mainCategory = etsyProduct.taxonomy_path.split('>').pop().trim();
      if (mainCategory) {
        categories.push(mainCategory);
      }
    }

    if (etsyProduct.category_path) {
      const shopCategory = etsyProduct.category_path.split('>').pop().trim();
      if (shopCategory && !categories.includes(shopCategory)) {
        categories.push(shopCategory);
      }
    }

    return categories.length ? categories : ['Uncategorized'];
  }

  /**
   * Process and validate product images
   * @param images Array of image URLs
   * @returns Processed images result
   */
  private async processProductImages(images: string[]): Promise<ProcessedImagesResult> {
    if (!images || images.length === 0) {
      const placeholders = this.getPlaceholderImages();
      return {
        validImages: placeholders,
        invalidImages: [],
        metadata: [],
        mobileImages: placeholders,
        tabletImages: placeholders,
        responsiveImageData: placeholders.reduce((acc, p) => {
          acc[p] = { desktop: p, tablet: p, mobile: p };
          return acc;
        }, {}),
      };
    }

    try {
      // Validate images
      const validationResults = await this.imageValidationService.validateImages(images);
      const validImages = images.filter((_, index) => validationResults[index].isValid);
      const invalidImages = images.filter((_, index) => !validationResults[index].isValid);

      // Process valid images
      let processedImageObjects: any[] = [];
      let imageMetadata: ImageMetadata[] = [];
      let mobileImages: string[] = [];
      let tabletImages: string[] = [];
      let responsiveImageData = {};

      if (validImages.length > 0) {
        // Process images with responsive sizes
        processedImageObjects = await this.imageProcessingService.processImages(validImages, {
          generateResponsiveSizes: true,
        });

        // Extract processed URLs for each size
        const processedImages = processedImageObjects.map(img => img.processedUrl);
        mobileImages = processedImageObjects.map(img => img.mobileUrl || img.processedUrl);
        tabletImages = processedImageObjects.map(img => img.tabletUrl || img.processedUrl);

        // Create responsive image data for easy lookup
        responsiveImageData = {};
        validImages.forEach((originalUrl, index) => {
          const processed = processedImageObjects[index];
          responsiveImageData[processed.processedUrl] = {
            desktop: processed.processedUrl,
            tablet: processed.tabletUrl,
            mobile: processed.mobileUrl,
            original: originalUrl,
          };
        });

        // Extract metadata from processed images
        imageMetadata = processedImageObjects.map(img => ({
          width: img.width,
          height: img.height,
          format: img.format,
          aspectRatio: img.width / img.height,
          size: img.size,
        }));

        return {
          validImages: processedImages,
          invalidImages,
          metadata: imageMetadata,
          mobileImages,
          tabletImages,
          responsiveImageData,
        };
      }

      // If no valid images, use placeholders
      const placeholders = this.getPlaceholderImages();
      return {
        validImages: placeholders,
        invalidImages,
        metadata: [
          {
            width: 800,
            height: 800,
            format: 'webp',
            aspectRatio: 1,
          },
        ],
        mobileImages: placeholders,
        tabletImages: placeholders,
        responsiveImageData: placeholders.reduce((acc, p) => {
          acc[p] = { desktop: p, tablet: p, mobile: p };
          return acc;
        }, {}),
      };
    } catch (error) {
      this.logger.error(`Error processing product images: ${error.message}`);
      const placeholders = this.getPlaceholderImages();
      return {
        validImages: placeholders,
        invalidImages: images,
        metadata: [
          {
            width: 800,
            height: 800,
            format: 'webp',
            aspectRatio: 1,
          },
        ],
        mobileImages: placeholders,
        tabletImages: placeholders,
        responsiveImageData: placeholders.reduce((acc, p) => {
          acc[p] = { desktop: p, tablet: p, mobile: p };
          return acc;
        }, {}),
      };
    }
  }

  /**
   * Normalize product data from any source
   * @param productData Raw product data
   * @param source Data source (shopify, woocommerce, etc.)
   * @param options Normalization options
   * @returns Normalized product data
   */
  async normalizeProductData(
    productData: any,
    source: string,
    options: Partial<NormalizationOptions> = {},
  ): Promise<CreateProductDto> {
    // Default options for normalization
    const defaultOptions: NormalizationOptions = {
      processImages: true,
      validateImages: true,
      sanitizeText: true,
      enforceRequiredFields: true,
    };

    // Merge default options with provided options
    const _normalizationOptions: NormalizationOptions = { ...defaultOptions, ...options };

    // Initialize normalized product
    let normalizedProduct: Partial<CreateProductDto> & { slug?: string };

    // Apply source-specific normalization
    switch (source) {
      case DataSource.SHOPIFY:
        normalizedProduct = await this.normalizeShopifyProduct(productData);
        break;
      case DataSource.WOOCOMMERCE:
        normalizedProduct = await this.normalizeWooCommerceProduct(productData);
        break;
      case DataSource.ETSY:
        normalizedProduct = await this.normalizeEtsyProduct(productData);
        break;
      case DataSource.MANUAL:
      case DataSource.API:
      default:
        // For manual/API data, clone to avoid modifying original, then apply basic validation
        normalizedProduct = { ...productData };
        break;
    }

    // Ensure externalSource is set
    normalizedProduct.externalSource = source;

    // Sanitize text fields to prevent XSS
    normalizedProduct.title = this.sanitizeText(normalizedProduct.title);
    normalizedProduct.description = this.sanitizeHtml(normalizedProduct.description);

    // Generate slug if not provided
    if (!normalizedProduct.slug && normalizedProduct.title) {
      normalizedProduct.slug = this.generateSlug(normalizedProduct.title);
    }

    // Validate and process images
    if (
      normalizedProduct.images &&
      normalizedProduct.images.length > 0 &&
      _normalizationOptions.processImages
    ) {
      const processedImages = await this.processProductImages(normalizedProduct.images);
      normalizedProduct.images =
        processedImages.validImages.length > 0
          ? processedImages.validImages
          : this.getPlaceholderImages();
    } else {
      // No images provided, use placeholders
      normalizedProduct.images = this.getPlaceholderImages();
    }

    // Ensure all required fields are present
    if (_normalizationOptions.enforceRequiredFields) {
      this.enforceRequiredFields(normalizedProduct);
    }

    return normalizedProduct as CreateProductDto;
  }

  /**
   * Normalize a Shopify product
   * @param shopifyProduct Shopify product data
   * @returns Normalized product data
   */
  private async normalizeShopifyProduct(
    shopifyProduct: any,
  ): Promise<Partial<CreateProductDto> & { slug?: string }> {
    return {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || shopifyProduct.description,
      price: parseFloat(shopifyProduct.variants?.[0]?.price || '0'),
      compareAtPrice: shopifyProduct.variants?.[0]?.compare_at_price
        ? parseFloat(shopifyProduct.variants[0].compare_at_price)
        : undefined,
      images: shopifyProduct.images?.map(img => img.src) || [],
      thumbnail: shopifyProduct.image?.src,
      categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : [],
      tags: shopifyProduct.tags?.split(',').map(tag => tag.trim()) || [],
      merchantId: shopifyProduct.vendor_id || 'shopify',
      brandName: shopifyProduct.vendor || 'Unknown',
      isActive: shopifyProduct.status === 'active',
      inStock: shopifyProduct.variants?.some(v => v.inventory_quantity > 0) || false,
      quantity: shopifyProduct.variants?.[0]?.inventory_quantity || 0,
      externalId: shopifyProduct.id.toString(),
      slug: this.generateSlug(shopifyProduct.title),
      attributes: this.extractShopifyAttributes(shopifyProduct),
    };
  }

  /**
   * Extract attributes from Shopify product
   */
  private extractShopifyAttributes(shopifyProduct: any): NormalizedProductAttributes {
    const attributes: NormalizedProductAttributes = {};

    // Extract from options
    if (shopifyProduct.options) {
      shopifyProduct.options.forEach(option => {
        const name = option.name.toLowerCase();
        if (['size', 'color', 'material', 'weight', 'dimensions'].includes(name)) {
          attributes[name] = option.values;
        }
      });
    }

    // Extract from metafields if available
    if (shopifyProduct.metafields) {
      shopifyProduct.metafields.forEach(metafield => {
        const key = metafield.key.toLowerCase();
        if (['size', 'color', 'material', 'weight', 'dimensions'].includes(key)) {
          attributes[key] = metafield.value;
        }
      });
    }

    return attributes;
  }

  /**
   * Normalize a WooCommerce product
   * @param wooProduct WooCommerce product data
   * @returns Normalized product data
   */
  private async normalizeWooCommerceProduct(
    wooProduct: any,
  ): Promise<Partial<CreateProductDto> & { slug?: string }> {
    return {
      title: wooProduct.name,
      description: wooProduct.description || wooProduct.short_description,
      price: parseFloat(wooProduct.price || '0'),
      compareAtPrice: wooProduct.regular_price ? parseFloat(wooProduct.regular_price) : undefined,
      images: wooProduct.images?.map(img => img.src) || [],
      thumbnail: wooProduct.images?.[0]?.src,
      categories: wooProduct.categories?.map(cat => cat.name) || [],
      tags: wooProduct.tags?.map(tag => tag.name) || [],
      merchantId: wooProduct.store_id || 'woocommerce',
      brandName: this.extractWooCommerceBrand(wooProduct),
      isActive: wooProduct.status === 'publish',
      inStock: wooProduct.in_stock || false,
      quantity: wooProduct.stock_quantity || 0,
      externalId: wooProduct.id.toString(),
      slug: wooProduct.slug || this.generateSlug(wooProduct.name),
      attributes: this.extractWooCommerceAttributes(wooProduct),
    };
  }

  /**
   * Extract brand name from WooCommerce product
   */
  private extractWooCommerceBrand(wooProduct: any): string {
    // Try to find brand in attributes
    if (wooProduct.attributes) {
      const brandAttr = wooProduct.attributes.find(attr => attr.name.toLowerCase() === 'brand');
      if (brandAttr && brandAttr.options && brandAttr.options.length) {
        return brandAttr.options[0];
      }
    }

    // Try to find in product metadata
    if (wooProduct.meta_data) {
      const brandMeta = wooProduct.meta_data.find(
        meta => meta.key.toLowerCase() === 'brand' || meta.key.toLowerCase() === '_brand',
      );
      if (brandMeta) {
        return brandMeta.value;
      }
    }

    return 'Unknown';
  }

  /**
   * Extract attributes from WooCommerce product
   */
  private extractWooCommerceAttributes(wooProduct: any): NormalizedProductAttributes {
    const attributes: NormalizedProductAttributes = {};

    // Extract from attributes array
    if (wooProduct.attributes) {
      wooProduct.attributes.forEach(attr => {
        const name = attr.name.toLowerCase();
        if (['size', 'color', 'material', 'weight', 'dimensions'].includes(name)) {
          attributes[name] = Array.isArray(attr.options) ? attr.options[0] : attr.options;
        }
      });
    }

    // Extract from dimensions if available
    if (wooProduct.dimensions) {
      if (wooProduct.dimensions.length) {
        attributes.dimensions = `${wooProduct.dimensions.length}x${wooProduct.dimensions.width}x${wooProduct.dimensions.height}`;
      }

      if (wooProduct.weight) {
        attributes.weight = `${wooProduct.weight}`;
      }
    }

    return attributes;
  }

  /**
   * Normalize an Etsy product
   * @param etsyProduct Etsy product data
   * @returns Normalized product data
   */
  private async normalizeEtsyProduct(
    etsyProduct: any,
  ): Promise<Partial<CreateProductDto> & { slug?: string }> {
    // Handle price conversion safely
    let price = 0;
    let compareAtPrice = undefined;

    if (etsyProduct.price?.amount) {
      price = parseFloat(String(etsyProduct.price.amount / 100 || 0));
    }

    if (etsyProduct.original_price?.amount) {
      compareAtPrice = parseFloat(String(etsyProduct.original_price.amount / 100));
    }

    const item = {
      title: etsyProduct.title,
      description: etsyProduct.description,
      price: price,
      compareAtPrice: compareAtPrice,
      images: this.extractEtsyImages(etsyProduct),
      thumbnail: etsyProduct.images?.[0]?.url_570xN,
      categories: this.extractEtsyCategories(etsyProduct),
      tags: etsyProduct.tags || [],
      sku: etsyProduct.sku || etsyProduct.listing_id,
      inventory: etsyProduct.quantity,
      brand: {
        name: etsyProduct.shop?.shop_name || 'Etsy Seller',
        logo: etsyProduct.shop?.icon_url_fullxfull,
      },
      externalId: etsyProduct.listing_id,
      externalSource: DataSource.ETSY,
      slug: this.generateSlug(etsyProduct.title),
      attributes: this.extractEtsyAttributes(etsyProduct),
    };

    return item;
  }

  /**
   * Extract product attributes from Etsy product data
   * @param etsyProduct Etsy product data
   * @returns Structured product attributes
   */
  private extractEtsyAttributes(etsyProduct: any): any {
    const attributes: any = {};

    // Extract size if available
    if (etsyProduct.item_dimensions) {
      attributes.dimensions = `${etsyProduct.item_dimensions.length}x${etsyProduct.item_dimensions.width}x${etsyProduct.item_dimensions.height} ${etsyProduct.item_dimensions.unit}`;
    }

    // Extract weight if available
    if (etsyProduct.item_weight) {
      attributes.weight = `${etsyProduct.item_weight.value} ${etsyProduct.item_weight.unit}`;
    }

    // Extract materials if available
    if (etsyProduct.materials && etsyProduct.materials.length > 0) {
      attributes.material = etsyProduct.materials.join(', ');
    }

    // Extract custom attributes from variations
    const customAttributes = [];
    if (etsyProduct.variations && etsyProduct.variations.length > 0) {
      etsyProduct.variations.forEach(variation => {
        if (variation.property_name && variation.value) {
          // Handle common properties specially
          if (variation.property_name.toLowerCase() === 'size') {
            attributes.size = variation.value;
          } else if (variation.property_name.toLowerCase() === 'color') {
            attributes.color = variation.value;
          } else {
            // Add as custom attribute
            customAttributes.push(`${variation.property_name}:${variation.value}`);
          }
        }
      });
    }

    if (customAttributes.length > 0) {
      attributes.customAttributes = customAttributes;
    }

    return attributes;
  }

  /**
   * Enforce required fields on product data
   * @param product Product data to validate
   * @throws Error if required fields are missing
   */
  private enforceRequiredFields(product: Partial<CreateProductDto> & { slug?: string }): void {
    const missingFields = this.requiredFields.filter(field => !product[field]);

    if (missingFields.length > 0) {
      this.logger.warn(`Missing required fields for product: ${missingFields.join(', ')}`);

      // Set default values for missing fields
      missingFields.forEach(field => {
        switch (field) {
          case 'title':
            product.title = 'Untitled Product';
            break;
          case 'description':
            product.description = 'No description available';
            break;
          case 'price':
            product.price = 0;
            break;
          case 'images':
            product.images = this.getPlaceholderImages();
            break;
          case 'categories':
            product.categories = ['Uncategorized'];
            break;
        }
      });
    }
  }

  /**
   * Update a product with the CreateProductDto
   * @param productId Product ID to update
   * @param updateDto Update data
   * @returns Updated product data
   */
  async updateProductWithDto(
    productId: string,
    updateDto: Partial<CreateProductDto>,
  ): Promise<Partial<UpdateProductDto>> {
    // Generate slug if title is being updated but slug isn't provided
    if (updateDto.title && !updateDto.slug) {
      updateDto.slug = this.generateSlug(updateDto.title);
    }

    // Sanitize text fields
    if (updateDto.title) {
      updateDto.title = this.sanitizeText(updateDto.title);
    }

    if (updateDto.description) {
      updateDto.description = this.sanitizeHtml(updateDto.description);
    }

    // Process images if provided
    if (updateDto.images && updateDto.images.length > 0) {
      const processedImages = await this.processProductImages(updateDto.images);
      updateDto.images =
        processedImages.validImages.length > 0
          ? processedImages.validImages
          : this.getPlaceholderImages();
    }

    return updateDto as Partial<UpdateProductDto>;
  }

  /**
   * Normalize an existing product
   * @param product Product to normalize
   * @returns Normalized product with virtual properties
   */
  async normalizeProduct(product: Product): Promise<Product> {
    try {
      // Process and validate images
      if (product.images?.length) {
        const processedImages = await this.processProductImages(product.images);
        product.images = processedImages.validImages;

        // Add image metadata and responsive images
        product.imageMetadata = processedImages.metadata;
        product.mobileImages = processedImages.mobileImages;
        product.tabletImages = processedImages.tabletImages;
        product.responsiveImageData = processedImages.responsiveImageData;
      }

      // Generate slug if not present
      if (!product.slug && product.title) {
        product.slug = this.generateSlug(product.title);
      }

      // Calculate virtual properties
      const isOnSale = !!(product.compareAtPrice && product.price < product.compareAtPrice);
      const discountPercentage = isOnSale
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

      // Create a complete product with virtual properties
      const completeProduct = {
        ...product,
        isOnSale,
        discountPercentage,
      };

      return completeProduct as Product;
    } catch (error) {
      this.logger.error(`Error normalizing product: ${error.message}`, error.stack);
      return product; // Return original product if normalization fails
    }
  }
}
