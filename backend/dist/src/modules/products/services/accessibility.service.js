"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AccessibilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let AccessibilityService = AccessibilityService_1 = class AccessibilityService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AccessibilityService_1.name);
        this.aiVisionApiKey = this.configService.get('AI_VISION_API_KEY') || '';
        this.aiVisionEndpoint =
            this.configService.get('AI_VISION_ENDPOINT') || 'https://api.vision.ai/v1/analyze';
        this.enableAltTextGeneration = this.configService.get('ENABLE_ALT_TEXT_GENERATION') === 'true';
    }
    async generateAltText(imageUrl, productContext) {
        try {
            if (!this.enableAltTextGeneration || !this.aiVisionApiKey) {
                return this.generateFallbackAltText(productContext);
            }
            const response = await axios_1.default.post(this.aiVisionEndpoint, {
                image: { url: imageUrl },
                features: [{ type: 'IMAGE_DESCRIPTION', maxResults: 1 }],
                productContext: {
                    title: productContext?.title,
                    description: productContext?.description,
                    category: productContext?.categories?.[0],
                    brand: productContext?.brandName,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.aiVisionApiKey}`,
                },
            });
            const responseData = response.data;
            if (responseData?.descriptions?.[0]?.text) {
                return responseData.descriptions[0].text;
            }
            return this.generateFallbackAltText(productContext);
        }
        catch (error) {
            this.logger.warn(`Alt text generation failed: ${error.message}`);
            return this.generateFallbackAltText(productContext);
        }
    }
    generateFallbackAltText(productContext) {
        if (!productContext) {
            return 'Product image';
        }
        const { title, brandName, categories } = productContext;
        const category = categories?.[0] || '';
        if (title && brandName && category) {
            return `${brandName} ${title} - ${category} product image`;
        }
        else if (title && brandName) {
            return `${brandName} ${title} product image`;
        }
        else if (title) {
            return `${title} product image`;
        }
        return 'Product image';
    }
    generateAriaMetadata(product) {
        const ariaMetadata = {
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
    generateStructuredData(product, imageAltTexts) {
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
        if (product.images && product.images.length > 0) {
            structuredData['image'] = product.images.map(imageUrl => {
                const imageData = { '@type': 'ImageObject', url: imageUrl };
                if (imageAltTexts && imageAltTexts[imageUrl]) {
                    imageData.accessibilityHazard = 'none';
                    imageData.description = imageAltTexts[imageUrl];
                }
                return imageData;
            });
        }
        return structuredData;
    }
    async enhanceProductAccessibility(product) {
        const imageAltTexts = {};
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images[0];
            imageAltTexts[primaryImage] = await this.generateAltText(primaryImage, product);
            for (let i = 1; i < product.images.length; i++) {
                const imageUrl = product.images[i];
                imageAltTexts[imageUrl] = await this.generateAltText(imageUrl, {
                    title: `${product.title} - View ${i + 1}`,
                    brandName: product.brandName,
                });
            }
        }
        const ariaMetadata = this.generateAriaMetadata(product);
        const structuredData = this.generateStructuredData(product, imageAltTexts);
        const accessibilityMetadata = {
            altText: imageAltTexts[product.images?.[0] || ''],
            ariaLabel: ariaMetadata['aria-label'],
            role: ariaMetadata['role'],
            structuredData,
        };
        product.accessibilityMetadata = accessibilityMetadata;
        product.imageAltTexts = imageAltTexts;
        return product;
    }
};
exports.AccessibilityService = AccessibilityService;
exports.AccessibilityService = AccessibilityService = AccessibilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AccessibilityService);
//# sourceMappingURL=accessibility.service.js.map