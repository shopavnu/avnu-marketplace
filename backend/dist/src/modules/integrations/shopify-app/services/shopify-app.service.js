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
var ShopifyAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAppService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const shared_1 = require("../../../shared");
const shopify_config_1 = require("../../../common/config/shopify-config");
const shopify_config_2 = require("../../../common/config/shopify-config");
let ShopifyAppService = ShopifyAppService_1 = class ShopifyAppService {
    processIncomingProduct(platformProduct) {
        return platformProduct;
    }
    prepareOutgoingProduct(productData) {
        return productData;
    }
    async syncOrders(storeIdentifier) {
        this.logger.log(`Syncing orders for merchant ${storeIdentifier}`);
        try {
            return {
                created: 0,
                updated: 0,
                failed: 0,
                total: 0,
                success: true,
                errors: [],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
            this.logger.error(`Failed to sync orders: ${errorMessage}`, errorStack);
            return {
                created: 0,
                updated: 0,
                failed: 1,
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
    constructor(merchantPlatformConnectionRepository, shopifyClientService, config) {
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.shopifyClientService = shopifyClientService;
        this.config = config;
        this.logger = new common_1.Logger(ShopifyAppService_1.name);
    }
    async getShopifyConnection(merchantId) {
        const connection = await this.merchantPlatformConnectionRepository.findOne({
            where: {
                merchantId,
                platformType: shared_1.PlatformType.SHOPIFY,
                isActive: true,
            },
        });
        if (!connection) {
            throw new common_1.NotFoundException(`No active Shopify connection found for merchant ${merchantId}`);
        }
        try {
            const settings = connection.platformConfig;
            const shop = typeof settings['shopName'] === 'string' ? settings['shopName'] : '';
            const accessToken = typeof settings['accessToken'] === 'string' ? settings['accessToken'] : '';
            if (!shop || !accessToken) {
                throw new Error('Missing required connection details');
            }
            return { shop, accessToken };
        }
        catch (error) {
            this.logger.error(`Failed to get Shopify connection for merchant ${merchantId}`, error);
            throw new Error(`Failed to get Shopify connection: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getProduct(productId, merchantId) {
        try {
            const { shop, accessToken } = await this.getShopifyConnection(merchantId);
            const query = `
        query {
          product(id: "gid://shopify/Product/${productId}") {
            id
            title
            description
            descriptionHtml
            handle
            productType
            vendor
            publishedAt
            tags
            options {
              id
              name
              values
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                  inventoryQuantity
                  inventoryManagement
                  inventoryPolicy
                }
              }
            }
            images(first: 100) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      `;
            const response = await this.shopifyClientService.query(shop, accessToken, query);
            const product = response.product;
            if (!product) {
                throw new common_1.NotFoundException(`Product ${productId} not found in Shopify`);
            }
            const variants = product.variants.edges.map((edge) => {
                const node = edge.node;
                return {
                    id: node.id.split('/').pop(),
                    title: node.title,
                    price: parseFloat(node.price),
                    compareAtPrice: node.compareAtPrice ? parseFloat(node.compareAtPrice) : null,
                    sku: node.sku,
                    inventoryQuantity: node.inventoryQuantity,
                };
            });
            const _images = product.images.edges.map((edge) => {
                const node = edge.node;
                return {
                    id: node.id.split('/').pop(),
                    url: node.url,
                    altText: node.altText || '',
                };
            });
            const platformProduct = {
                id: product.id.split('/').pop(),
                name: product.title,
                price: parseFloat(product.variants.edges[0]?.node.price || '0'),
                description: product.description,
                images: product.images.edges.map((edge) => edge.node.url),
                quantity: parseInt(product.totalInventory, 10),
                platformType: shared_1.PlatformType.SHOPIFY,
                variants: variants.map((variant) => ({
                    id: variant.id.split('/').pop(),
                    sku: variant.sku,
                    price: parseFloat(variant.price),
                    quantity: variant.inventoryQuantity,
                    attributes: variant.selectedOptions?.reduce((acc, option) => {
                        acc[option.name] = option.value;
                        return acc;
                    }, {}),
                })),
                metadata: {
                    productType: product.productType,
                    vendor: product.vendor,
                    status: product.status,
                    externalId: product.id.split('/').pop(),
                    options: product.options?.map((option) => ({
                        name: option.name,
                        values: option.values,
                    })),
                },
            };
            return platformProduct;
        }
        catch (error) {
            this.logger.error(`Failed to get product ${productId} from Shopify`, error);
            throw error;
        }
    }
    async getProducts(merchantId, limit = 50, cursor) {
        try {
            const { shop, accessToken } = await this.getShopifyConnection(merchantId);
            const query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                description
                descriptionHtml
                handle
                productType
                vendor
                publishedAt
                tags
                options {
                  id
                  name
                  values
                }
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      price
                      compareAtPrice
                      sku
                      inventoryQuantity
                      inventoryManagement
                      inventoryPolicy
                    }
                  }
                }
                images(first: 100) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;
            const variables = {
                first: Math.min(limit, 250),
                after: cursor,
            };
            const response = await this.shopifyClientService.query(shop, accessToken, query, variables);
            const products = response.products.edges;
            const pageInfo = response.products.pageInfo;
            const transformedProducts = products.map((edge) => {
                const product = edge.node;
                const variants = product.variants.edges.map((edge) => {
                    const node = edge.node;
                    return {
                        id: node.id.split('/').pop(),
                        title: node.title,
                        price: parseFloat(node.price),
                        compareAtPrice: node.compareAtPrice ? parseFloat(node.compareAtPrice) : null,
                        sku: node.sku,
                        inventoryQuantity: node.inventoryQuantity,
                    };
                });
                const _images = product.images.edges.map((edge) => {
                    const node = edge.node;
                    return {
                        id: node.id.split('/').pop(),
                        url: node.url,
                        altText: node.altText || '',
                    };
                });
                const platformProduct = {
                    id: product.id.split('/').pop(),
                    name: product.title,
                    price: parseFloat(product.variants.edges[0]?.node.price || '0'),
                    description: product.description,
                    images: product.images.edges.map((edge) => edge.node.url),
                    quantity: parseInt(product.totalInventory, 10),
                    platformType: shared_1.PlatformType.SHOPIFY,
                    variants: variants.map((variant) => ({
                        id: variant.id.split('/').pop(),
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        quantity: variant.inventoryQuantity,
                        attributes: variant.selectedOptions?.reduce((acc, option) => {
                            acc[option.name] = option.value;
                            return acc;
                        }, {}),
                    })),
                    metadata: {
                        productType: product.productType,
                        vendor: product.vendor,
                        status: product.status === 'ACTIVE' ? 'active' : 'draft',
                        externalId: product.id.split('/').pop(),
                        options: product.options?.map((option) => ({
                            name: option.name,
                            values: option.values,
                        })),
                    },
                };
                return platformProduct;
            });
            return {
                products: transformedProducts,
                hasNextPage: pageInfo.hasNextPage,
                endCursor: pageInfo.endCursor,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get products from Shopify for merchant ${merchantId}`, error);
            throw error;
        }
    }
    async createProduct(data, merchantId) {
        try {
            const { shop, accessToken } = await this.getShopifyConnection(merchantId);
            const mutation = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              descriptionHtml
              handle
              productType
              vendor
              publishedAt
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
            const tags = Array.isArray(data.tags) ? data.tags.join(', ') : '';
            const variables = {
                input: {
                    title: data.name,
                    descriptionHtml: data.description,
                    productType: data.metadata?.['productType'] || '',
                    vendor: data.metadata?.['vendor'] || '',
                    tags,
                    published: true,
                },
            };
            const response = await this.shopifyClientService.query(shop, accessToken, mutation, variables);
            if (response.productCreate.userErrors && response.productCreate.userErrors.length > 0) {
                throw new Error(`Failed to create product: ${response.productCreate.userErrors[0].message}`);
            }
            const createdProductId = response.productCreate.product.id.split('/').pop();
            if (data.variants && data.variants.length > 0) {
                await this.createProductVariants(createdProductId, data.variants, merchantId);
            }
            if (data.images && data.images.length > 0) {
                await this.uploadProductImages(createdProductId, data.images, merchantId);
            }
            return this.getProduct(createdProductId, merchantId);
        }
        catch (error) {
            this.logger.error(`Failed to create product in Shopify for merchant ${merchantId}`, error);
            throw error;
        }
    }
    async updateProduct(productId, data, merchantId) {
        try {
            const { shop, accessToken } = await this.getShopifyConnection(merchantId);
            const mutation = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              title
              descriptionHtml
              handle
              productType
              vendor
              publishedAt
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
            let tags;
            if (data.tags) {
                tags = Array.isArray(data.tags) ? data.tags.join(', ') : '';
            }
            const input = {
                id: `gid://shopify/Product/${productId}`,
            };
            if (data.name)
                input.title = data.name;
            if (data.description)
                input.descriptionHtml = data.description;
            if (data.metadata?.['productType'])
                input.productType = data.metadata['productType'];
            if (data.metadata?.['vendor'])
                input.vendor = data.metadata['vendor'];
            if (tags !== undefined)
                input.tags = tags;
            if (data.metadata?.['status']) {
                input.published = data.metadata['status'] === 'ACTIVE';
            }
            const variables = { input };
            const response = await this.shopifyClientService.query(shop, accessToken, mutation, variables);
            if (response.productUpdate.userErrors && response.productUpdate.userErrors.length > 0) {
                throw new Error(`Failed to update product: ${response.productUpdate.userErrors[0].message}`);
            }
            if (data.variants && data.variants.length > 0) {
                await this.updateProductInventory(productId, data.variants, merchantId);
            }
            if (data.images && data.images.length > 0) {
                await this.updateProductImages(productId, data.images, merchantId);
            }
            return this.getProduct(productId, merchantId);
        }
        catch (error) {
            this.logger.error(`Failed to update product ${productId} in Shopify for merchant ${merchantId}`, error);
            throw error;
        }
    }
    async deleteProduct(productId, merchantId) {
        try {
            const { shop, accessToken } = await this.getShopifyConnection(merchantId);
            const mutation = `
        mutation productDelete($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }
      `;
            const variables = {
                input: {
                    id: `gid://shopify/Product/${productId}`,
                },
            };
            const response = await this.shopifyClientService.query(shop, accessToken, mutation, variables);
            if (response.productDelete.userErrors && response.productDelete.userErrors.length > 0) {
                throw new Error(`Failed to delete product: ${response.productDelete.userErrors[0].message}`);
            }
            return !!response.productDelete.deletedProductId;
        }
        catch (error) {
            this.logger.error(`Failed to delete product ${productId} from Shopify for merchant ${merchantId}`, error);
            throw error;
        }
    }
    async syncProducts(merchantId) {
        try {
            const startTime = Date.now();
            let allProducts = [];
            let hasMore = true;
            let cursor;
            while (hasMore) {
                const result = await this.getProducts(merchantId, 100, cursor);
                allProducts = [...allProducts, ...result.products];
                hasMore = result.hasNextPage;
                cursor = result.endCursor;
                this.logger.log(`Synced ${allProducts.length} products so far for merchant ${merchantId}`);
            }
            const _syncDuration = Date.now() - startTime;
            return {
                created: 0,
                updated: allProducts.length,
                failed: 0,
                total: allProducts.length,
                success: true,
                errors: [],
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to sync products from Shopify for merchant ${merchantId}`, error);
            return {
                created: 0,
                updated: 0,
                failed: 1,
                success: false,
                errors: [error instanceof Error ? error.message : String(error)],
            };
        }
    }
    getProductStatus(product) {
        if (product.publishedAt) {
            return 'ACTIVE';
        }
        return 'DRAFT';
    }
    async createProductVariants(productId, variants, merchantId) {
        const { shop, accessToken } = await this.getShopifyConnection(merchantId);
        for (const variant of variants) {
            const mutation = `
        mutation productVariantCreate($input: ProductVariantInput!) {
          productVariantCreate(input: $input) {
            productVariant {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
            const variables = {
                input: {
                    productId: `gid://shopify/Product/${productId}`,
                    price: variant.price.toString(),
                    compareAtPrice: variant.compareAtPrice ? variant.compareAtPrice.toString() : null,
                    sku: variant.sku,
                    inventoryQuantities: {
                        availableQuantity: variant.inventoryQuantity || 0,
                        locationId: 'gid://shopify/Location/1',
                    },
                    title: variant.title,
                },
            };
            await this.shopifyClientService.query(shop, accessToken, mutation, variables);
        }
    }
    async updateProductInventory(productId, variants, merchantId) {
        const { shop, accessToken } = await this.getShopifyConnection(merchantId);
        for (const variant of variants) {
            if (!variant.id)
                continue;
            const mutation = `
        mutation productVariantUpdate($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            productVariant {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
            const variables = {
                input: {
                    id: variant.id,
                    price: variant.price?.toString() || '0',
                    compareAtPrice: variant.compareAtPrice ? variant.compareAtPrice.toString() : null,
                    sku: variant.sku || '',
                    inventoryQuantities: {
                        availableQuantity: variant.inventoryQuantity || 0,
                        locationId: 'gid://shopify/Location/1',
                    },
                },
            };
            await this.shopifyClientService.query(shop, accessToken, mutation, variables);
        }
    }
    async uploadProductImages(productId, images, merchantId) {
        const { shop, accessToken } = await this.getShopifyConnection(merchantId);
        for (const image of images) {
            if (!image.url)
                continue;
            const mutation = `
        mutation productImageCreate($input: ProductImageInput!) {
          productImageCreate(input: $input) {
            image {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
            const variables = {
                input: {
                    productId: `gid://shopify/Product/${productId}`,
                    src: image.url,
                    altText: image.altText || '',
                },
            };
            await this.shopifyClientService.query(shop, accessToken, mutation, variables);
        }
    }
    async getProductImages(productId, merchantId) {
        const { shop, accessToken } = await this.getShopifyConnection(merchantId);
        const query = `
      query getProductImages($id: ID!) {
        product(id: $id) {
          images(first: 20) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
        }
      }
    `;
        const variables = {
            id: `gid://shopify/Product/${productId}`,
        };
        const response = await this.shopifyClientService.query(shop, accessToken, query, variables);
        return response.product?.images?.edges?.map(edge => edge.node) || [];
    }
    async updateProductImages(productId, images, merchantId) {
        const { shop, accessToken } = await this.getShopifyConnection(merchantId);
        const _existingImages = await this.getProductImages(productId, merchantId);
        for (const image of _existingImages) {
            const shouldKeep = images.some(img => img.id === image.id || img.url === image.url);
            if (!shouldKeep) {
                const deleteMutation = `
          mutation productImageDelete($id: ID!) {
            productImageDelete(id: $id) {
              deletedImageId
              userErrors {
                field
                message
              }
            }
          }
        `;
                await this.shopifyClientService.query(shop, accessToken, deleteMutation, {
                    id: image.id,
                });
            }
        }
        for (const image of images) {
            if (!image.url || _existingImages.some(existingImg => existingImg.url === image.url))
                continue;
            await this.uploadProductImages(productId, [image], merchantId);
        }
    }
};
exports.ShopifyAppService = ShopifyAppService;
exports.ShopifyAppService = ShopifyAppService = ShopifyAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __param(1, (0, common_1.Inject)(shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)),
    __param(2, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object, void 0])
], ShopifyAppService);
//# sourceMappingURL=shopify-app.service.js.map