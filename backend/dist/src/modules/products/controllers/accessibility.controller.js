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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityController = void 0;
const common_1 = require("@nestjs/common");
const accessibility_service_1 = require("../services/accessibility.service");
const products_service_1 = require("../products.service");
let AccessibilityController = class AccessibilityController {
    constructor(accessibilityService, productsService) {
        this.accessibilityService = accessibilityService;
        this.productsService = productsService;
    }
    async getProductAccessibilityMetadata(productId) {
        const product = await this.productsService.findOne(productId);
        const enhancedProduct = await this.accessibilityService.enhanceProductAccessibility(product);
        return {
            productId: product.id,
            accessibilityMetadata: enhancedProduct.accessibilityMetadata,
        };
    }
    async getProductAriaAttributes(productId) {
        const product = await this.productsService.findOne(productId);
        const ariaMetadata = this.accessibilityService.generateAriaMetadata(product);
        return {
            productId: product.id,
            attributes: ariaMetadata,
        };
    }
    async getProductStructuredData(productId) {
        const product = await this.productsService.findOne(productId);
        const structuredData = this.accessibilityService.generateStructuredData(product, product.imageAltTexts);
        return structuredData;
    }
    async generateAltText(productId) {
        const product = await this.productsService.findOne(productId);
        const imageAltTexts = {};
        if (product.images && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
                const imageUrl = product.images[i];
                imageAltTexts[imageUrl] = await this.accessibilityService.generateAltText(imageUrl, {
                    ...product,
                    title: i === 0 ? product.title : `${product.title} - View ${i + 1}`,
                });
            }
        }
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
    async batchGenerateAltText(limit = 10) {
        const products = await this.productsService.findProductsWithoutAltText(limit);
        const results = [];
        for (const product of products) {
            const imageAltTexts = {};
            if (product.images && product.images.length > 0) {
                for (let i = 0; i < product.images.length; i++) {
                    const imageUrl = product.images[i];
                    imageAltTexts[imageUrl] = await this.accessibilityService.generateAltText(imageUrl, {
                        ...product,
                        title: i === 0 ? product.title : `${product.title} - View ${i + 1}`,
                    });
                }
            }
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
};
exports.AccessibilityController = AccessibilityController;
__decorate([
    (0, common_1.Get)(':productId/metadata'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessibilityController.prototype, "getProductAccessibilityMetadata", null);
__decorate([
    (0, common_1.Get)(':productId/aria'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessibilityController.prototype, "getProductAriaAttributes", null);
__decorate([
    (0, common_1.Get)(':productId/structured-data'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessibilityController.prototype, "getProductStructuredData", null);
__decorate([
    (0, common_1.Post)(':productId/alt-text'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessibilityController.prototype, "generateAltText", null);
__decorate([
    (0, common_1.Get)('batch/alt-text'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccessibilityController.prototype, "batchGenerateAltText", null);
exports.AccessibilityController = AccessibilityController = __decorate([
    (0, common_1.Controller)('products/accessibility'),
    __metadata("design:paramtypes", [accessibility_service_1.AccessibilityService,
        products_service_1.ProductsService])
], AccessibilityController);
//# sourceMappingURL=accessibility.controller.js.map