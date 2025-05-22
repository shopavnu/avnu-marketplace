'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var DataNormalizationService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.DataNormalizationService = exports.DataSource = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const image_processing_service_1 = require('./image-processing.service');
const image_validation_service_1 = require('./image-validation.service');
const sanitize_html_1 = __importDefault(require('sanitize-html'));
var DataSource;
(function (DataSource) {
  DataSource['SHOPIFY'] = 'shopify';
  DataSource['WOOCOMMERCE'] = 'woocommerce';
  DataSource['ETSY'] = 'etsy';
  DataSource['MANUAL'] = 'manual';
  DataSource['API'] = 'api';
})(DataSource || (exports.DataSource = DataSource = {}));
let DataNormalizationService = (DataNormalizationService_1 = class DataNormalizationService {
  constructor(imageValidationService, imageProcessingService, configService) {
    this.imageValidationService = imageValidationService;
    this.imageProcessingService = imageProcessingService;
    this.configService = configService;
    this.logger = new common_1.Logger(DataNormalizationService_1.name);
    this.requiredFields = [
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
    this.defaultImages = [
      'https://via.placeholder.com/800x800?text=Product+Image',
      'https://via.placeholder.com/800x800?text=No+Image+Available',
    ];
  }
  generateSlug(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }
  sanitizeText(text) {
    if (!text) return '';
    return text.trim();
  }
  sanitizeHtml(html) {
    if (!html) return '';
    return (0, sanitize_html_1.default)(html, {
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br'],
      allowedAttributes: {},
    });
  }
  getPlaceholderImages() {
    return [...this.defaultImages];
  }
  extractEtsyImages(etsyProduct) {
    if (!etsyProduct.images || !etsyProduct.images.length) {
      return this.getPlaceholderImages();
    }
    return etsyProduct.images.map(img => img.url_fullxfull || img.url_570xN).filter(Boolean);
  }
  extractEtsyCategories(etsyProduct) {
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
  async processProductImages(images) {
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
      const validationResults = await this.imageValidationService.validateImages(images);
      const validImages = images.filter((_, index) => validationResults[index].isValid);
      const invalidImages = images.filter((_, index) => !validationResults[index].isValid);
      let processedImageObjects = [];
      let imageMetadata = [];
      let mobileImages = [];
      let tabletImages = [];
      let responsiveImageData = {};
      if (validImages.length > 0) {
        processedImageObjects = await this.imageProcessingService.processImages(validImages, {
          generateResponsiveSizes: true,
        });
        const processedImages = processedImageObjects.map(img => img.processedUrl);
        mobileImages = processedImageObjects.map(img => img.mobileUrl || img.processedUrl);
        tabletImages = processedImageObjects.map(img => img.tabletUrl || img.processedUrl);
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
  async normalizeProductData(productData, source, options = {}) {
    const defaultOptions = {
      processImages: true,
      validateImages: true,
      sanitizeText: true,
      enforceRequiredFields: true,
    };
    const _normalizationOptions = { ...defaultOptions, ...options };
    let normalizedProduct;
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
        normalizedProduct = productData;
        break;
    }
    normalizedProduct.externalSource = source;
    normalizedProduct.title = this.sanitizeText(normalizedProduct.title);
    normalizedProduct.description = this.sanitizeHtml(normalizedProduct.description);
    if (!normalizedProduct.slug && normalizedProduct.title) {
      normalizedProduct.slug = this.generateSlug(normalizedProduct.title);
    }
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
      normalizedProduct.images = this.getPlaceholderImages();
    }
    if (_normalizationOptions.enforceRequiredFields) {
      this.enforceRequiredFields(normalizedProduct);
    }
    return normalizedProduct;
  }
  async normalizeShopifyProduct(shopifyProduct) {
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
  extractShopifyAttributes(shopifyProduct) {
    const attributes = {};
    if (shopifyProduct.options) {
      shopifyProduct.options.forEach(option => {
        const name = option.name.toLowerCase();
        if (['size', 'color', 'material', 'weight', 'dimensions'].includes(name)) {
          attributes[name] = option.values[0];
        }
      });
    }
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
  async normalizeWooCommerceProduct(wooProduct) {
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
  extractWooCommerceBrand(wooProduct) {
    if (wooProduct.attributes) {
      const brandAttr = wooProduct.attributes.find(attr => attr.name.toLowerCase() === 'brand');
      if (brandAttr && brandAttr.options && brandAttr.options.length) {
        return brandAttr.options[0];
      }
    }
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
  extractWooCommerceAttributes(wooProduct) {
    const attributes = {};
    if (wooProduct.attributes) {
      wooProduct.attributes.forEach(attr => {
        const name = attr.name.toLowerCase();
        if (['size', 'color', 'material', 'weight', 'dimensions'].includes(name)) {
          attributes[name] = Array.isArray(attr.options) ? attr.options[0] : attr.options;
        }
      });
    }
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
  async normalizeEtsyProduct(etsyProduct) {
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
  extractEtsyAttributes(etsyProduct) {
    const attributes = {};
    if (etsyProduct.item_dimensions) {
      attributes.dimensions = `${etsyProduct.item_dimensions.length}x${etsyProduct.item_dimensions.width}x${etsyProduct.item_dimensions.height} ${etsyProduct.item_dimensions.unit}`;
    }
    if (etsyProduct.item_weight) {
      attributes.weight = `${etsyProduct.item_weight.value} ${etsyProduct.item_weight.unit}`;
    }
    if (etsyProduct.materials && etsyProduct.materials.length > 0) {
      attributes.material = etsyProduct.materials.join(', ');
    }
    const customAttributes = [];
    if (etsyProduct.variations && etsyProduct.variations.length > 0) {
      etsyProduct.variations.forEach(variation => {
        if (variation.property_name && variation.value) {
          if (variation.property_name.toLowerCase() === 'size') {
            attributes.size = variation.value;
          } else if (variation.property_name.toLowerCase() === 'color') {
            attributes.color = variation.value;
          } else {
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
  enforceRequiredFields(product) {
    const missingFields = this.requiredFields.filter(field => !product[field]);
    if (missingFields.length > 0) {
      this.logger.warn(`Missing required fields for product: ${missingFields.join(', ')}`);
      missingFields.forEach(field => {
        switch (field) {
          case 'title':
            product.title = 'Untitled Product';
            break;
          case 'description':
            product.description = 'No description provided.';
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
  async updateProductWithDto(productId, updateDto) {
    if (updateDto.title && !updateDto.slug) {
      updateDto.slug = this.generateSlug(updateDto.title);
    }
    if (updateDto.title) {
      updateDto.title = this.sanitizeText(updateDto.title);
    }
    if (updateDto.description) {
      updateDto.description = this.sanitizeHtml(updateDto.description);
    }
    if (updateDto.images && updateDto.images.length > 0) {
      const processedImages = await this.processProductImages(updateDto.images);
      updateDto.images =
        processedImages.validImages.length > 0
          ? processedImages.validImages
          : this.getPlaceholderImages();
    }
    return updateDto;
  }
  async normalizeProduct(product) {
    try {
      if (product.images?.length) {
        const processedImages = await this.processProductImages(product.images);
        product.images = processedImages.validImages;
        product.imageMetadata = processedImages.metadata;
        product.mobileImages = processedImages.mobileImages;
        product.tabletImages = processedImages.tabletImages;
        product.responsiveImageData = processedImages.responsiveImageData;
      }
      if (!product.slug && product.title) {
        product.slug = this.generateSlug(product.title);
      }
      const isOnSale = !!(product.compareAtPrice && product.price < product.compareAtPrice);
      const discountPercentage = isOnSale
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;
      const completeProduct = {
        ...product,
        isOnSale,
        discountPercentage,
      };
      return completeProduct;
    } catch (error) {
      this.logger.error(`Error normalizing product: ${error.message}`, error.stack);
      return product;
    }
  }
});
exports.DataNormalizationService = DataNormalizationService;
exports.DataNormalizationService =
  DataNormalizationService =
  DataNormalizationService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          image_validation_service_1.ImageValidationService,
          image_processing_service_1.ImageProcessingService,
          config_1.ConfigService,
        ]),
      ],
      DataNormalizationService,
    );
//# sourceMappingURL=data-normalization.service.js.map
