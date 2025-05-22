import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { PlatformType } from '../../enums/platform-type.enum';
import { shopifyConfig } from '../../../common/config/shopify-config';
import {
  IShopifyProductService,
  IShopifyClientService,
  ShopifyUserError,
} from '../../../common/interfaces/shopify-services.interfaces';
import {
  ShopifyProduct,
  ShopifyLocalizedField,
  ShopifyProductVariant,
} from '../../../common/types/shopify-models.types';
import { SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';

// Define GraphQL response types for better type safety
interface ShopifyGraphQLProductResponse {
  product?: {
    id: string;
    title: string;
    description?: string;
    descriptionHtml?: string;
    handle: string;
    productType?: string;
    vendor?: string;
    status?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    options?: Array<{
      id: string;
      name: string;
      position: number;
      values: string[];
    }>;
    priceRangeV2?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
      maxVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images?: {
      edges: Array<{
        node: {
          id: string;
          src: string;
          altText?: string;
          width?: number;
          height?: number;
        };
      }>;
    };
    variants?: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: string;
          compareAtPrice?: string;
          sku?: string;
          position?: number;
          inventoryQuantity?: number;
          inventoryPolicy?: string;
          inventoryManagement?: string;
          requiresShipping?: boolean;
          taxable?: boolean;
          weight?: number;
          weightUnit?: string;
          availableForSale?: boolean;
          selectedOptions?: Array<{
            name: string;
            value: string;
          }>;
          image?: {
            id: string;
            src: string;
          };
        };
      }>;
    };
    metafields?: {
      edges: Array<{
        node: {
          namespace: string;
          key: string;
          value: string;
          type: string;
        };
      }>;
    };
    collections?: {
      edges: Array<{
        node: {
          id: string;
          title: string;
        };
      }>;
    };
    localizedFields?: {
      keys: string[];
      values: string[];
      locales: string[];
    };
  };
}

interface ShopifyGraphQLProductsResponse {
  products?: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: Array<{
      node: {
        id: string;
        title: string;
        description?: string;
        descriptionHtml?: string;
        handle: string;
        productType?: string;
        vendor?: string;
        status?: string;
        tags?: string[];
        createdAt?: string;
        updatedAt?: string;
        publishedAt?: string;
        priceRangeV2?: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
          maxVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
        images?: {
          edges: Array<{
            node: {
              id: string;
              src: string;
              altText?: string;
            };
          }>;
        };
        variants?: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              price: string;
              sku?: string;
              inventoryQuantity?: number;
              inventoryPolicy?: string;
            };
          }>;
        };
      };
    }>;
  };
}

interface ShopifyGraphQLProductCreateResponse {
  productCreate?: {
    product: {
      id: string;
      title: string;
      description?: string;
      descriptionHtml?: string;
      handle: string;
      productType?: string;
      vendor?: string;
      status?: string;
      tags?: string[];
      createdAt?: string;
      publishedAt?: string;
      options?: Array<{
        id: string;
        name: string;
        position: number;
        values: string[];
      }>;
      variants?: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            price: string;
            compareAtPrice?: string;
            sku?: string;
            position?: number;
            inventoryQuantity?: number;
            inventoryPolicy?: string;
            inventoryManagement?: string;
          };
        }>;
      };
      images?: {
        edges: Array<{
          node: {
            id: string;
            src: string;
            altText?: string;
          };
        }>;
      };
    };
    userErrors: ShopifyUserError[];
  };
}

interface ShopifyGraphQLProductUpdateResponse {
  productUpdate?: {
    product: {
      id: string;
      title: string;
      description?: string;
      descriptionHtml?: string;
      handle: string;
      productType?: string;
      vendor?: string;
      status?: string;
      tags?: string[];
      updatedAt?: string;
      options?: Array<{
        id: string;
        name: string;
        position: number;
        values: string[];
      }>;
      variants?: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            price: string;
            compareAtPrice?: string;
            sku?: string;
            position?: number;
            inventoryQuantity?: number;
            inventoryPolicy?: string;
            inventoryManagement?: string;
          };
        }>;
      };
      images?: {
        edges: Array<{
          node: {
            id: string;
            src: string;
            altText?: string;
          };
        }>;
      };
    };
    userErrors: ShopifyUserError[];
  };
}

interface ShopifyGraphQLProductDeleteResponse {
  productDelete?: {
    deletedProductId: string;
    shop: {
      id: string;
    };
    userErrors: ShopifyUserError[];
  };
}

/**
 * Implementation of the Shopify Product Service
 *
 * This service handles all product-related operations with the Shopify API.
 * It follows the IShopifyProductService interface to maintain a clean architecture
 * and prevent circular dependencies.
 */
@Injectable()
export class ShopifyProductService implements IShopifyProductService {
  private readonly logger = new Logger(ShopifyProductService.name);

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)
    private readonly shopifyClientService: IShopifyClientService,
  ) {}

  /**
   * Get a product by ID
   */
  async getProduct(merchantId: string, productId: string): Promise<ShopifyProduct> {
    try {
      // First, retrieve the merchant's connection to get shop and access token
      const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);

      // Construct GraphQL query
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

      // Format the ID to ensure it's a proper Shopify Global ID
      const formattedId = this.ensureGlobalId(productId, 'Product');

      // Execute the query with type assertion
      const result = await this.shopifyClientService.query<ShopifyGraphQLProductResponse>(
        shop,
        accessToken,
        query,
        { id: formattedId },
      );

      if (!result || !result['product']) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      // Transform the GraphQL response to our ShopifyProduct model
      return this.transformShopifyGraphQLProduct(result['product']);
    } catch (error) {
      this.logger.error(`Failed to get product ${productId} for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Get products with pagination
   */
  async getProducts(
    merchantId: string,
    limit = 50,
    cursor?: string,
  ): Promise<{ products: ShopifyProduct[]; hasNextPage: boolean; endCursor: string }> {
    try {
      // First, retrieve the merchant's connection to get shop and access token
      const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);

      // Construct GraphQL query with pagination
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

      // Execute the query with pagination parameters and type assertion
      const result = await this.shopifyClientService.query<ShopifyGraphQLProductsResponse>(
        shop,
        accessToken,
        query,
        {
          first: limit,
          after: cursor || null,
        },
      );

      if (!result || !result['products']) {
        return { products: [], hasNextPage: false, endCursor: '' };
      }

      // Transform the products from the GraphQL response
      const transformedProducts = result['products']['edges'].map((edge: { node: any }) =>
        this.transformShopifyGraphQLProduct(edge.node),
      );

      return {
        products: transformedProducts,
        hasNextPage: result['products']['pageInfo']['hasNextPage'],
        endCursor: result['products']['pageInfo']['endCursor'],
      };
    } catch (error) {
      this.logger.error(`Failed to get products for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Create a product
   */
  async createProduct(
    merchantId: string,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct> {
    try {
      // First, retrieve the merchant's connection to get shop and access token
      const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);

      // Prepare the input for the GraphQL mutation
      const input = this.prepareProductInput(productData);

      // Construct GraphQL mutation
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

      // Execute the mutation with type assertion
      const result = await this.shopifyClientService.query<ShopifyGraphQLProductCreateResponse>(
        shop,
        accessToken,
        mutation,
        { input },
      );

      // Check for user errors
      if (
        result &&
        result['productCreate'] &&
        result['productCreate']['userErrors'] &&
        result['productCreate']['userErrors'].length > 0
      ) {
        const errors = result['productCreate']['userErrors'];
        throw new Error(
          `Failed to create product: ${errors.map((e: ShopifyUserError) => e.message).join(', ')}`,
        );
      }

      if (!result || !result['productCreate'] || !result['productCreate']['product']) {
        throw new Error('Failed to create product: No product returned from Shopify');
      }

      // Transform and return the created product
      return this.transformShopifyGraphQLProduct(result['productCreate']['product']);
    } catch (error) {
      this.logger.error(`Failed to create product for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(
    merchantId: string,
    productId: string,
    productData: Partial<ShopifyProduct>,
  ): Promise<ShopifyProduct> {
    try {
      // First, retrieve the merchant's connection to get shop and access token
      const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);

      // Format the ID to ensure it's a proper Shopify Global ID
      const formattedId = this.ensureGlobalId(productId, 'Product');

      // Prepare the input for the GraphQL mutation
      const input = {
        id: formattedId,
        ...this.prepareProductInput(productData),
      };

      // Construct GraphQL mutation
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

      // Execute the mutation with type assertion
      const result = await this.shopifyClientService.query<ShopifyGraphQLProductUpdateResponse>(
        shop,
        accessToken,
        mutation,
        { input },
      );

      // Check for user errors
      if (
        result &&
        result['productUpdate'] &&
        result['productUpdate']['userErrors'] &&
        result['productUpdate']['userErrors'].length > 0
      ) {
        const errors = result['productUpdate']['userErrors'];
        throw new Error(
          `Failed to update product: ${errors.map((e: ShopifyUserError) => e.message).join(', ')}`,
        );
      }

      if (!result || !result['productUpdate'] || !result['productUpdate']['product']) {
        throw new Error('Failed to update product: No product returned from Shopify');
      }

      // Transform and return the updated product
      return this.transformShopifyGraphQLProduct(result['productUpdate']['product']);
    } catch (error) {
      this.logger.error(`Failed to update product ${productId} for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(merchantId: string, productId: string): Promise<void> {
    try {
      // First, retrieve the merchant's connection to get shop and access token
      const { shop, accessToken } = await this.getMerchantShopifyConnection(merchantId);

      // Format the ID to ensure it's a proper Shopify Global ID
      const formattedId = this.ensureGlobalId(productId, 'Product');

      // Construct GraphQL mutation
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

      // Execute the mutation with type assertion
      const result = await this.shopifyClientService.query<ShopifyGraphQLProductDeleteResponse>(
        shop,
        accessToken,
        mutation,
        { input: { id: formattedId } },
      );

      // Check for user errors
      if (
        result &&
        result['productDelete'] &&
        result['productDelete']['userErrors'] &&
        result['productDelete']['userErrors'].length > 0
      ) {
        const errors = result['productDelete']['userErrors'];
        throw new Error(
          `Failed to delete product: ${errors.map((e: ShopifyUserError) => e.message).join(', ')}`,
        );
      }

      if (!result || !result['productDelete'] || !result['productDelete']['deletedProductId']) {
        throw new Error('Failed to delete product: No confirmation from Shopify');
      }

      this.logger.log(`Successfully deleted product ${productId} for merchant ${merchantId}`);
    } catch (error) {
      this.logger.error(`Failed to delete product ${productId} for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  /**
   * Sync a product from Shopify to the local database
   */
  async syncProductFromShopify(merchantId: string, shopifyProductId: string): Promise<any> {
    // TODO: Implement syncing from Shopify to local database
    // This is a placeholder for now
    try {
      const product = await this.getProduct(merchantId, shopifyProductId);
      this.logger.log(`Retrieved product for sync: ${product['title']}`);

      // Here you would save the product to your local database
      // Example:
      // await this.productRepository.save({
      //   merchantId,
      //   externalId: product['id'],
      //   title: product['title'],
      //   ...other fields
      // });

      return { success: true, message: 'Product synchronized from Shopify' };
    } catch (error) {
      this.logger.error(`Failed to sync product from Shopify:`, error);
      throw error;
    }
  }

  /**
   * Sync a product from the local database to Shopify
   */
  async syncProductToShopify(_merchantId: string, _localProductId: string): Promise<any> {
    // TODO: Implement syncing from local database to Shopify
    // This is a placeholder for now
    try {
      // Here you would retrieve the product from your local database
      // Example:
      // const localProduct = await this.productRepository.findOne({
      //   where: { merchantId, id: localProductId }
      // });

      // Then create or update in Shopify
      // if (localProduct.externalId) {
      //   // Update
      //   await this.updateProduct(merchantId, localProduct.externalId, localProduct);
      // } else {
      //   // Create
      //   const result = await this.createProduct(merchantId, localProduct);
      //   // Save the external ID back to your database
      //   await this.productRepository.update(
      //     { id: localProductId },
      //     { externalId: result.id }
      //   );
      // }

      return { success: true, message: 'Product synchronized to Shopify' };
    } catch (error) {
      this.logger.error(`Failed to sync product to Shopify:`, error);
      throw error;
    }
  }

  /**
   * Transform a Shopify GraphQL product into our standardized ShopifyProduct model
   */
  private transformShopifyGraphQLProduct(graphqlProduct: any): ShopifyProduct {
    // Extract variants
    const variants: ShopifyProductVariant[] =
      graphqlProduct['variants']?.['edges']?.map((edge: any) => ({
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

    // Extract images
    const images =
      graphqlProduct['images']?.['edges']?.map((edge: any) => ({
        id: this.extractIdFromGid(edge['node']['id']),
        productId: this.extractIdFromGid(graphqlProduct['id']),
        src: edge['node']['src'],
        altText: edge['node']['altText'],
        width: edge['node']['width'],
        height: edge['node']['height'],
        position: 1, // Default position
      })) || [];

    // Extract collections
    const _collectionsData =
      graphqlProduct['collections']?.['edges']?.map((edge: any) => ({
        id: this.extractIdFromGid(edge['node']['id']),
        title: edge['node']['title'],
      })) || [];

    // Extract metafields
    const metafields =
      graphqlProduct['metafields']?.['edges']?.map((edge: any) => ({
        namespace: edge['node']['namespace'],
        key: edge['node']['key'],
        value: edge['node']['value'],
        type: edge['node']['type'],
      })) || [];

    // Extract options
    const options =
      graphqlProduct['options']?.map((option: any) => ({
        id: this.extractIdFromGid(option['id']),
        productId: this.extractIdFromGid(graphqlProduct['id']),
        name: option['name'],
        position: option['position'],
        values: option['values'],
      })) || [];

    // Build the standardized product object
    // Store collections and other extended data in private variables
    const _localizedFieldsData = this.extractAllLocalizedFields(graphqlProduct);

    // Create a product according to the ShopifyProduct interface
    const product: ShopifyProduct = {
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
      // No localizedFields in ShopifyProduct type
      metafields: metafields,
    };

    return product;
  }

  /**
   * Extract localized fields from a GraphQL product
   */
  private extractLocalizedFields(graphqlProduct: any, fieldName: string): ShopifyLocalizedField[] {
    const localizedFields: ShopifyLocalizedField[] = [];

    // Try to extract from the localizedTitle or similar field if available
    if (graphqlProduct[`localized${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]) {
      const field =
        graphqlProduct[`localized${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];
      Object.keys(field).forEach(locale => {
        localizedFields.push({
          keys: [fieldName], // Use keys array as per ShopifyLocalizedField type
          values: [field[locale]], // Use values array as per ShopifyLocalizedField type
          locale,
        });
      });
    }

    return localizedFields;
  }

  /**
   * Extract all localized fields from a GraphQL product
   */
  private extractAllLocalizedFields(graphqlProduct: any): ShopifyLocalizedField[] {
    const localizedFields: ShopifyLocalizedField[] = [];

    // Try to extract from the localizedFields field if available
    if (graphqlProduct.localizedFields) {
      const { keys, values, locales } = graphqlProduct.localizedFields;
      for (let i = 0; i < keys.length; i++) {
        localizedFields.push({
          keys: [keys[i]], // Wrap in array to match ShopifyLocalizedField type
          values: [values[i]], // Wrap in array to match ShopifyLocalizedField type
          locale: locales[i],
        });
      }
    }

    // Also add specific localized fields if available
    return [
      ...localizedFields,
      ...this.extractLocalizedFields(graphqlProduct, 'title'),
      ...this.extractLocalizedFields(graphqlProduct, 'description'),
    ];
  }

  /**
   * Prepare a product input object for GraphQL mutations
   */
  private prepareProductInput(productData: Partial<ShopifyProduct>): Record<string, any> {
    const input: Record<string, any> = {};

    // Map basic fields
    if (productData['title'] !== undefined) input['title'] = productData['title'];
    if (productData['description'] !== undefined)
      input['descriptionHtml'] = productData['descriptionHtml'] || productData['description'];
    if (productData['handle'] !== undefined) input['handle'] = productData['handle'];
    if (productData['productType'] !== undefined) input['productType'] = productData['productType'];
    if (productData['vendor'] !== undefined) input['vendor'] = productData['vendor'];
    if (productData['tags'] !== undefined) input['tags'] = productData['tags'];
    if (productData['status'] !== undefined) input['status'] = productData['status'];

    // Handle publishedScope which is not in ShopifyProduct type but is used by Shopify API
    if ((productData as any)['publishedScope'] !== undefined)
      input['publishedScope'] = (productData as any)['publishedScope'];

    // Map variants
    if (productData['variants'] && productData['variants'].length > 0) {
      input['variants'] = productData['variants'].map(variant => {
        const variantInput: Record<string, any> = {};

        // For existing variants, include the ID
        if (variant['id']) {
          variantInput['id'] = this.ensureGlobalId(variant['id'], 'ProductVariant');
        }

        // Map basic variant fields
        if (variant['title'] !== undefined) variantInput['title'] = variant['title'];
        if (variant['price'] !== undefined) variantInput['price'] = variant['price'];
        if (variant['compareAtPrice'] !== undefined)
          variantInput['compareAtPrice'] = variant['compareAtPrice'];
        if (variant['sku'] !== undefined) variantInput['sku'] = variant['sku'];
        if (variant['position'] !== undefined) variantInput['position'] = variant['position'];
        if (variant['inventoryQuantity'] !== undefined)
          variantInput['inventoryQuantity'] = variant['inventoryQuantity'];
        if (variant['inventoryPolicy'] !== undefined)
          variantInput['inventoryPolicy'] = variant['inventoryPolicy'];
        if (variant['inventoryManagement'] !== undefined)
          variantInput['inventoryManagement'] = variant['inventoryManagement'];
        if (variant['requiresShipping'] !== undefined)
          variantInput['requiresShipping'] = variant['requiresShipping'];
        if (variant['taxable'] !== undefined) variantInput['taxable'] = variant['taxable'];
        if (variant['weight'] !== undefined) variantInput['weight'] = variant['weight'];
        if (variant['weightUnit'] !== undefined) variantInput['weightUnit'] = variant['weightUnit'];

        // Map variant selectedOptions - we handle it as options for the API
        if (variant['selectedOptions'] && variant['selectedOptions'].length > 0) {
          variantInput['options'] = variant['selectedOptions'].map(
            (option: { name: string; value: string }) => ({
              name: option['name'],
              value: option['value'],
            }),
          );
        }

        return variantInput;
      });
    }

    // Map product options
    if (productData['options'] && productData['options'].length > 0) {
      input['options'] = productData['options'].map(option => ({
        name: option['name'],
        values: option['values'],
        position: option['position'],
      }));
    }

    // Map images
    if (productData['images'] && productData['images'].length > 0) {
      input['images'] = productData['images'].map(image => ({
        src: image['src'],
        altText: image['altText'],
        position: image['position'],
      }));
    }

    // Handle collections which is not in ShopifyProduct type but is used by Shopify API
    const productDataWithExtensions = productData as any;
    if (
      productDataWithExtensions['collections'] &&
      productDataWithExtensions['collections'].length > 0
    ) {
      input['collectionsToJoin'] = productDataWithExtensions['collections'].map(
        (collection: { id: string }) => this.ensureGlobalId(collection['id'], 'Collection'),
      );
    }

    // Map SEO metadata if available from extended properties
    const productDataWithSeo = productData as any;
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

  /**
   * Ensure a Shopify ID is in the proper Global ID format
   */
  private ensureGlobalId(id: string, type: string): string {
    // Check if ID is already a Global ID (gid://shopify/Type/id)
    if (id.startsWith('gid://')) {
      return id;
    }

    // Remove the 'gid://' prefix if it exists
    const cleanId = id.replace('gid://', '');

    // Check if the ID contains the type already (shopify/Type/id)
    if (cleanId.includes(`shopify/${type}/`)) {
      return `gid://${cleanId}`;
    }

    // Otherwise, construct the full Global ID
    return `gid://shopify/${type}/${cleanId}`;
  }

  /**
   * Extract the numeric ID from a Shopify Global ID
   */
  private extractIdFromGid(gid: string): string {
    // Return empty string if gid is undefined or null
    if (!gid) {
      return '';
    }

    // Check if ID is already a numeric ID
    if (!gid.startsWith('gid://')) {
      return gid;
    }

    // Extract the last part of the GID
    const parts = gid.split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Get a merchant's Shopify connection
   */
  private async getMerchantShopifyConnection(
    merchantId: string,
  ): Promise<{ shop: string; accessToken: string }> {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        merchantId,
        platformType: PlatformType.SHOPIFY,
        isActive: true,
      },
    });

    if (!connection) {
      throw new Error(`No active Shopify connection found for merchant ${merchantId}`);
    }

    // The token is stored encrypted, we would decrypt it here
    // For now, this is a placeholder - in a real implementation, you'd decrypt the token
    const shop = connection.platformIdentifier;
    // In a real implementation, you'd use a secure method to decrypt this
    const accessToken = connection.accessToken;

    return { shop, accessToken };
  }
}
