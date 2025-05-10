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
var ShopifyProductService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../enums/platform-type.enum");
const shopify_config_1 = require("../../../common/config/shopify-config");
const shopify_config_2 = require("../../../common/config/shopify-config");
let ShopifyProductService = ShopifyProductService_1 = class ShopifyProductService {
    constructor(config, merchantPlatformConnectionRepository, shopifyClientService) {
        this.config = config;
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.shopifyClientService = shopifyClientService;
        this.logger = new common_1.Logger(ShopifyProductService_1.name);
    }
    async getProduct(merchantId, productId) {
        try {
            const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);
            const query = `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            descriptionHtml
            handle
            productType
            vendor
            status
            tags
            createdAt
            updatedAt
            publishedAt
            options {
              id
              name
              position
              values
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 20) {
              edges {
                node {
                  id
                  src
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                  position
                  inventoryQuantity
                  inventoryPolicy
                  inventoryManagement
                  requiresShipping
                  taxable
                  weight
                  weightUnit
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    id
                    src
                  }
                }
              }
            }
            metafields(first: 20) {
              edges {
                node {
                  namespace
                  key
                  value
                  type
                }
              }
            }
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      `;
            const formattedId = this.ensureGlobalId(productId, 'Product');
            const result = await this.shopifyClientService.query(shop, accessToken, query, { id: formattedId });
            if (!result || !result['product']) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            return this.transformShopifyGraphQLProduct(result['product']);
        }
        catch (error) {
            this.logger.error(`Failed to get product ${productId} for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async getProducts(merchantId, limit = 50, cursor) {
        try {
            const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);
            const query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                description
                descriptionHtml
                handle
                productType
                vendor
                status
                tags
                createdAt
                updatedAt
                publishedAt
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 10) {
                  edges {
                    node {
                      id
                      src
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
                      inventoryPolicy
                    }
                  }
                }
              }
            }
          }
        }
      `;
            const result = await this.shopifyClientService.query(shop, accessToken, query, {
                first: limit,
                after: cursor || null,
            });
            if (!result || !result['products']) {
                return { products: [], hasNextPage: false, endCursor: '' };
            }
            const transformedProducts = result['products']['edges'].map((edge) => this.transformShopifyGraphQLProduct(edge.node));
            return {
                products: transformedProducts,
                hasNextPage: result['products']['pageInfo']['hasNextPage'],
                endCursor: result['products']['pageInfo']['endCursor'],
            };
        }
        catch (error) {
            this.logger.error(`Failed to get products for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async createProduct(merchantId, productData) {
        try {
            const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);
            const input = this.prepareProductInput(productData);
            const mutation = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              description
              descriptionHtml
              handle
              productType
              vendor
              status
              tags
              createdAt
              publishedAt
              options {
                id
                name
                position
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
                    position
                    inventoryQuantity
                    inventoryPolicy
                    inventoryManagement
                  }
                }
              }
              images(first: 20) {
                edges {
                  node {
                    id
                    src
                    altText
                  }
                }
              }
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      `;
            const result = await this.shopifyClientService.query(shop, accessToken, mutation, { input });
            if (result &&
                result['productCreate'] &&
                result['productCreate']['userErrors'] &&
                result['productCreate']['userErrors'].length > 0) {
                const errors = result['productCreate']['userErrors'];
                throw new Error(`Failed to create product: ${errors.map((e) => e.message).join(', ')}`);
            }
            if (!result || !result['productCreate'] || !result['productCreate']['product']) {
                throw new Error('Failed to create product: No product returned from Shopify');
            }
            return this.transformShopifyGraphQLProduct(result['productCreate']['product']);
        }
        catch (error) {
            this.logger.error(`Failed to create product for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async updateProduct(merchantId, productId, productData) {
        try {
            const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);
            const formattedId = this.ensureGlobalId(productId, 'Product');
            const input = {
                id: formattedId,
                ...this.prepareProductInput(productData),
            };
            const mutation = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              title
              description
              descriptionHtml
              handle
              productType
              vendor
              status
              tags
              updatedAt
              options {
                id
                name
                position
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
                    position
                    inventoryQuantity
                    inventoryPolicy
                    inventoryManagement
                  }
                }
              }
              images(first: 20) {
                edges {
                  node {
                    id
                    src
                    altText
                  }
                }
              }
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      `;
            const result = await this.shopifyClientService.query(shop, accessToken, mutation, { input });
            if (result &&
                result['productUpdate'] &&
                result['productUpdate']['userErrors'] &&
                result['productUpdate']['userErrors'].length > 0) {
                const errors = result['productUpdate']['userErrors'];
                throw new Error(`Failed to update product: ${errors.map((e) => e.message).join(', ')}`);
            }
            if (!result || !result['productUpdate'] || !result['productUpdate']['product']) {
                throw new Error('Failed to update product: No product returned from Shopify');
            }
            return this.transformShopifyGraphQLProduct(result['productUpdate']['product']);
        }
        catch (error) {
            this.logger.error(`Failed to update product ${productId} for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async deleteProduct(merchantId, productId) {
        try {
            const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);
            const formattedId = this.ensureGlobalId(productId, 'Product');
            const mutation = `
        mutation productDelete($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            shop {
              id
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      `;
            const result = await this.shopifyClientService.query(shop, accessToken, mutation, { input: { id: formattedId } });
            if (result &&
                result['productDelete'] &&
                result['productDelete']['userErrors'] &&
                result['productDelete']['userErrors'].length > 0) {
                const errors = result['productDelete']['userErrors'];
                throw new Error(`Failed to delete product: ${errors.map((e) => e.message).join(', ')}`);
            }
            if (!result || !result['productDelete'] || !result['productDelete']['deletedProductId']) {
                throw new Error('Failed to delete product: No confirmation from Shopify');
            }
            this.logger.log(`Successfully deleted product ${productId} for merchant ${merchantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete product ${productId} for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async syncProductFromShopify(merchantId, shopifyProductId) {
        try {
            const product = await this.getProduct(merchantId, shopifyProductId);
            this.logger.log(`Retrieved product for sync: ${product['title']}`);
            return { success: true, message: 'Product synchronized from Shopify' };
        }
        catch (error) {
            this.logger.error(`Failed to sync product from Shopify:`, error);
            throw error;
        }
    }
    async syncProductToShopify(merchantId, localProductId) {
        try {
            return { success: true, message: 'Product synchronized to Shopify' };
        }
        catch (error) {
            this.logger.error(`Failed to sync product to Shopify:`, error);
            throw error;
        }
    }
    transformShopifyGraphQLProduct(graphqlProduct) {
        const variants = graphqlProduct['variants']?.['edges']?.map((edge) => ({
            id: this.extractIdFromGid(edge['node']['id']),
            productId: this.extractIdFromGid(graphqlProduct['id']),
            title: edge['node']['title'],
            price: edge['node']['price'],
            compareAtPrice: edge['node']['compareAtPrice'],
            sku: edge['node']['sku'],
            position: edge['node']['position'],
            inventoryQuantity: edge['node']['inventoryQuantity'],
            inventoryPolicy: edge['node']['inventoryPolicy'],
            inventoryManagement: edge['node']['inventoryManagement'],
            requiresShipping: edge['node']['requiresShipping'],
            taxable: edge['node']['taxable'],
            weight: edge['node']['weight'],
            weightUnit: edge['node']['weightUnit'],
            availableForSale: edge['node']['availableForSale'],
            selectedOptions: edge['node']['selectedOptions'],
            imageId: edge['node']['image']?.['id']
                ? this.extractIdFromGid(edge['node']['image']['id'])
                : undefined,
            imageSrc: edge['node']['image']?.['src'],
        })) || [];
        const images = graphqlProduct['images']?.['edges']?.map((edge) => ({
            id: this.extractIdFromGid(edge['node']['id']),
            productId: this.extractIdFromGid(graphqlProduct['id']),
            src: edge['node']['src'],
            altText: edge['node']['altText'],
            width: edge['node']['width'],
            height: edge['node']['height'],
            position: 1,
        })) || [];
        const collections = graphqlProduct['collections']?.['edges']?.map((edge) => ({
            id: this.extractIdFromGid(edge['node']['id']),
            title: edge['node']['title'],
        })) || [];
        const metafields = graphqlProduct['metafields']?.['edges']?.map((edge) => ({
            namespace: edge['node']['namespace'],
            key: edge['node']['key'],
            value: edge['node']['value'],
            type: edge['node']['type'],
        })) || [];
        const options = graphqlProduct['options']?.map((option) => ({
            id: this.extractIdFromGid(option['id']),
            productId: this.extractIdFromGid(graphqlProduct['id']),
            name: option['name'],
            position: option['position'],
            values: option['values'],
        })) || [];
        const collectionsData = collections;
        const metafieldsData = metafields;
        const localizedFieldsData = this.extractAllLocalizedFields(graphqlProduct);
        const product = {
            id: this.extractIdFromGid(graphqlProduct['id']),
            title: graphqlProduct['title'],
            description: graphqlProduct['description'] || '',
            descriptionHtml: graphqlProduct['descriptionHtml'] || '',
            handle: graphqlProduct['handle'],
            productType: graphqlProduct['productType'] || '',
            vendor: graphqlProduct['vendor'] || '',
            status: graphqlProduct['status'] || 'ACTIVE',
            tags: graphqlProduct['tags'] || [],
            createdAt: graphqlProduct['createdAt'],
            updatedAt: graphqlProduct['updatedAt'],
            publishedAt: graphqlProduct['publishedAt'],
            variants,
            images,
            options,
            metafields: metafieldsData,
        };
        return product;
    }
    extractLocalizedFields(graphqlProduct, fieldName) {
        const localizedFields = [];
        if (graphqlProduct[`localized${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]) {
            const field = graphqlProduct[`localized${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];
            Object.keys(field).forEach(locale => {
                localizedFields.push({
                    keys: [fieldName],
                    values: [field[locale]],
                    locale,
                });
            });
        }
        return localizedFields;
    }
    extractAllLocalizedFields(graphqlProduct) {
        const localizedFields = [];
        if (graphqlProduct.localizedFields) {
            const { keys, values, locales } = graphqlProduct.localizedFields;
            for (let i = 0; i < keys.length; i++) {
                localizedFields.push({
                    keys: [keys[i]],
                    values: [values[i]],
                    locale: locales[i],
                });
            }
        }
        return [
            ...localizedFields,
            ...this.extractLocalizedFields(graphqlProduct, 'title'),
            ...this.extractLocalizedFields(graphqlProduct, 'description'),
        ];
    }
    prepareProductInput(productData) {
        const input = {};
        if (productData['title'] !== undefined)
            input['title'] = productData['title'];
        if (productData['description'] !== undefined)
            input['descriptionHtml'] = productData['descriptionHtml'] || productData['description'];
        if (productData['handle'] !== undefined)
            input['handle'] = productData['handle'];
        if (productData['productType'] !== undefined)
            input['productType'] = productData['productType'];
        if (productData['vendor'] !== undefined)
            input['vendor'] = productData['vendor'];
        if (productData['tags'] !== undefined)
            input['tags'] = productData['tags'];
        if (productData['status'] !== undefined)
            input['status'] = productData['status'];
        if (productData['publishedScope'] !== undefined)
            input['publishedScope'] = productData['publishedScope'];
        if (productData['variants'] && productData['variants'].length > 0) {
            input['variants'] = productData['variants'].map(variant => {
                const variantInput = {};
                if (variant['id']) {
                    variantInput['id'] = this.ensureGlobalId(variant['id'], 'ProductVariant');
                }
                if (variant['title'] !== undefined)
                    variantInput['title'] = variant['title'];
                if (variant['price'] !== undefined)
                    variantInput['price'] = variant['price'];
                if (variant['compareAtPrice'] !== undefined)
                    variantInput['compareAtPrice'] = variant['compareAtPrice'];
                if (variant['sku'] !== undefined)
                    variantInput['sku'] = variant['sku'];
                if (variant['position'] !== undefined)
                    variantInput['position'] = variant['position'];
                if (variant['inventoryQuantity'] !== undefined)
                    variantInput['inventoryQuantity'] = variant['inventoryQuantity'];
                if (variant['inventoryPolicy'] !== undefined)
                    variantInput['inventoryPolicy'] = variant['inventoryPolicy'];
                if (variant['inventoryManagement'] !== undefined)
                    variantInput['inventoryManagement'] = variant['inventoryManagement'];
                if (variant['requiresShipping'] !== undefined)
                    variantInput['requiresShipping'] = variant['requiresShipping'];
                if (variant['taxable'] !== undefined)
                    variantInput['taxable'] = variant['taxable'];
                if (variant['weight'] !== undefined)
                    variantInput['weight'] = variant['weight'];
                if (variant['weightUnit'] !== undefined)
                    variantInput['weightUnit'] = variant['weightUnit'];
                if (variant['selectedOptions'] && variant['selectedOptions'].length > 0) {
                    variantInput['options'] = variant['selectedOptions'].map((option) => ({
                        name: option['name'],
                        value: option['value'],
                    }));
                }
                return variantInput;
            });
        }
        if (productData['options'] && productData['options'].length > 0) {
            input['options'] = productData['options'].map(option => ({
                name: option['name'],
                values: option['values'],
                position: option['position'],
            }));
        }
        if (productData['images'] && productData['images'].length > 0) {
            input['images'] = productData['images'].map(image => ({
                src: image['src'],
                altText: image['altText'],
                position: image['position'],
            }));
        }
        const productDataWithExtensions = productData;
        if (productDataWithExtensions['collections'] &&
            productDataWithExtensions['collections'].length > 0) {
            input['collectionsToJoin'] = productDataWithExtensions['collections'].map((collection) => this.ensureGlobalId(collection['id'], 'Collection'));
        }
        const productDataWithSeo = productData;
        if (productDataWithSeo['seo']) {
            if (productDataWithSeo['seo']['title']) {
                input['seo'] = { title: productDataWithSeo['seo']['title'] };
            }
            if (productDataWithSeo['seo']['description']) {
                input['seo'] = { ...input['seo'], description: productDataWithSeo['seo']['description'] };
            }
        }
        return input;
    }
    ensureGlobalId(id, type) {
        if (id.startsWith('gid://')) {
            return id;
        }
        const cleanId = id.replace('gid://', '');
        if (cleanId.includes(`shopify/${type}/`)) {
            return `gid://${cleanId}`;
        }
        return `gid://shopify/${type}/${cleanId}`;
    }
    extractIdFromGid(gid) {
        if (!gid) {
            return '';
        }
        if (!gid.startsWith('gid://')) {
            return gid;
        }
        const parts = gid.split('/');
        return parts[parts.length - 1] || '';
    }
    async getMerchantShopifyConnection(merchantId) {
        const connection = await this.merchantPlatformConnectionRepository.findOne({
            where: {
                merchantId,
                platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                isActive: true,
            },
        });
        if (!connection) {
            throw new Error(`No active Shopify connection found for merchant ${merchantId}`);
        }
        const shop = connection.platformIdentifier;
        const accessToken = connection.accessToken;
        return { shop, accessToken };
    }
};
exports.ShopifyProductService = ShopifyProductService;
exports.ShopifyProductService = ShopifyProductService = ShopifyProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __param(2, (0, common_1.Inject)(shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)),
    __metadata("design:paramtypes", [void 0, typeorm_2.Repository, Object])
], ShopifyProductService);
//# sourceMappingURL=shopify-product.service.js.map