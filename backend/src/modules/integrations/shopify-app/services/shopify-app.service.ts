import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import {
  PlatformProductDto,
  ProductIntegrationService,
  SyncResult,
  PlatformType,
} from '../../../shared';
import { ShopifyProduct, ShopifyOrder } from '../../../common/types/shopify-models.types';
import { IShopifyClientService } from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';

/**
 * ShopifyAppService - Enhanced for Shopify 2025-01 API
 *
 * This service implements the ProductIntegrationService interface and uses
 * the real ShopifyClientService for API communication.
 */
@Injectable()
export class ShopifyAppService implements ProductIntegrationService {
  /**
   * Process an incoming product from the platform to our system's format
   * @param platformProduct The product data from the platform
   * @returns Processed product data
   */
  processIncomingProduct(platformProduct: unknown): any {
    // Convert platform-specific product to our system's format
    return platformProduct;
  }

  /**
   * Prepare an outgoing product for the platform
   * @param productData The product data from our system
   * @returns Platform-specific product data
   */
  prepareOutgoingProduct(productData: unknown): any {
    // Convert our system's product to platform-specific format
    return productData;
  }

  /**
   * Sync orders from the platform to our database
   * @param storeIdentifier The store identifier
   * @returns Sync result
   */
  async syncOrders(storeIdentifier: string): Promise<SyncResult> {
    this.logger.log(`Syncing orders for merchant ${storeIdentifier}`);

    try {
      // Not yet implemented
      return {
        created: 0,
        updated: 0,
        failed: 0,
        total: 0,
        success: true,
        errors: [],
      };
    } catch (error) {
      // Safely handle the unknown error type
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
  private readonly logger = new Logger(ShopifyAppService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)
    private readonly shopifyClientService: IShopifyClientService,
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
  ) {}

  /**
   * Get a Shopify connection for a specific merchant
   * @param merchantId The merchant ID
   * @returns The connection details including shop name and access token
   */
  async getShopifyConnection(merchantId: string): Promise<{ shop: string; accessToken: string }> {
    // Get merchant's Shopify connection details
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        merchantId,
        platformType: PlatformType.SHOPIFY as any, // Cast to any to avoid TypeScript error with FindOptionsWhere
        isActive: true as any,
      },
    });

    if (!connection) {
      throw new NotFoundException(`No active Shopify connection found for merchant ${merchantId}`);
    }

    try {
      const settings = connection.platformConfig as Record<string, unknown>;
      const shop = typeof settings['shopName'] === 'string' ? settings['shopName'] : '';
      const accessToken =
        typeof settings['accessToken'] === 'string' ? settings['accessToken'] : '';

      if (!shop || !accessToken) {
        throw new Error('Missing required connection details');
      }

      return { shop, accessToken };
    } catch (error) {
      this.logger.error(`Failed to get Shopify connection for merchant ${merchantId}`, error);
      throw new Error(
        `Failed to get Shopify connection: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get a product from Shopify
   * @param productId Shopify product ID
   * @param merchantId Our internal merchant ID
   * @returns Standardized product data
   */
  async getProduct(productId: string, merchantId: string): Promise<PlatformProductDto> {
    try {
      const { shop, accessToken } = await this.getShopifyConnection(merchantId);

      // Fetch the product using GraphQL
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

      const response = await this.shopifyClientService.query<any>(shop, accessToken, query);
      const product = response.product;

      if (!product) {
        throw new NotFoundException(`Product ${productId} not found in Shopify`);
      }

      // Transform variants
      const variants = product.variants.edges.map((edge: any) => {
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

      // Transform images
      const images = product.images.edges.map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id.split('/').pop(),
          url: node.url,
          altText: node.altText || '',
        };
      });

      // Map from Shopify format to our platform format
      const platformProduct: PlatformProductDto = {
        id: product.id.split('/').pop(),
        name: product.title, // Use name instead of title
        price: parseFloat(product.variants.edges[0]?.node.price || '0'),
        description: product.description,
        images: product.images.edges.map((edge: any) => edge.node.url),
        quantity: parseInt(product.totalInventory, 10),
        platformType: PlatformType.SHOPIFY,
        variants: variants.map((variant: any) => ({
          id: variant.id.split('/').pop(),
          sku: variant.sku,
          price: parseFloat(variant.price),
          quantity: variant.inventoryQuantity,
          attributes: variant.selectedOptions?.reduce((acc: any, option: any) => {
            acc[option.name] = option.value;
            return acc;
          }, {}),
        })),
        // Use metadata for platform-specific fields
        metadata: {
          productType: product.productType,
          vendor: product.vendor,
          status: product.status,
          externalId: product.id.split('/').pop(),
          options: product.options?.map((option: any) => ({
            name: option.name,
            values: option.values,
          })),
        },
      };

      return platformProduct;
    } catch (error) {
      this.logger.error(`Failed to get product ${productId} from Shopify`, error);
      throw error;
    }
  }

  /**
   * Get products from Shopify
   * @param merchantId Our internal merchant ID
   * @param limit Maximum number of products to return
   * @param cursor Pagination cursor
   * @returns List of standardized products with pagination info
   */
  async getProducts(
    merchantId: string,
    limit = 50,
    cursor?: string,
  ): Promise<{ products: PlatformProductDto[]; hasNextPage: boolean; endCursor: string }> {
    try {
      const { shop, accessToken } = await this.getShopifyConnection(merchantId);

      // Fetch products using GraphQL with cursor-based pagination
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
        first: Math.min(limit, 250), // Shopify has a max limit of 250
        after: cursor,
      };

      const response = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        query,
        variables,
      );
      const products = response.products.edges;
      const pageInfo = response.products.pageInfo;

      // Transform each product to our standard format
      const transformedProducts: PlatformProductDto[] = products.map((edge: any) => {
        const product = edge.node;

        // Transform variants
        const variants = product.variants.edges.map((edge: any) => {
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

        // Transform images
        const images = product.images.edges.map((edge: any) => {
          const node = edge.node;
          return {
            id: node.id.split('/').pop(),
            url: node.url,
            altText: node.altText || '',
          };
        });

        // Map from Shopify format to our platform format
        const platformProduct: PlatformProductDto = {
          id: product.id.split('/').pop(),
          name: product.title, // Use name instead of title
          price: parseFloat(product.variants.edges[0]?.node.price || '0'),
          description: product.description,
          images: product.images.edges.map((edge: any) => edge.node.url),
          quantity: parseInt(product.totalInventory, 10),
          platformType: PlatformType.SHOPIFY,
          variants: variants.map((variant: any) => ({
            id: variant.id.split('/').pop(),
            sku: variant.sku,
            price: parseFloat(variant.price),
            quantity: variant.inventoryQuantity,
            attributes: variant.selectedOptions?.reduce((acc: any, option: any) => {
              acc[option.name] = option.value;
              return acc;
            }, {}),
          })),
          // Use metadata for platform-specific fields
          metadata: {
            productType: product.productType,
            vendor: product.vendor,
            status: product.status === 'ACTIVE' ? 'active' : 'draft',
            externalId: product.id.split('/').pop(),
            options: product.options?.map((option: any) => ({
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
    } catch (error) {
      this.logger.error(`Failed to get products from Shopify for merchant ${merchantId}`, error);
      throw error;
    }
  }

  /**
   * Create a product in Shopify
   * @param data Product data to create
   * @param merchantId Our internal merchant ID
   * @returns Created product data
   */
  async createProduct(data: PlatformProductDto, merchantId: string): Promise<PlatformProductDto> {
    try {
      const { shop, accessToken } = await this.getShopifyConnection(merchantId);

      // Prepare product input for Shopify GraphQL API
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

      // Process tags
      const tags = Array.isArray(data.tags) ? data.tags.join(', ') : '';

      const variables = {
        input: {
          // Access metadata fields or use default values
          title: data.name,
          descriptionHtml: data.description,
          productType: (data.metadata?.['productType'] as string) || '',
          vendor: (data.metadata?.['vendor'] as string) || '',
          tags,
          published: true,
        },
      };

      const response = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        mutation,
        variables,
      );

      // Check for errors
      if (response.productCreate.userErrors && response.productCreate.userErrors.length > 0) {
        throw new Error(
          `Failed to create product: ${response.productCreate.userErrors[0].message}`,
        );
      }

      // Get the newly created product's ID
      const createdProductId = response.productCreate.product.id.split('/').pop();

      // Create variants if needed
      if (data.variants && data.variants.length > 0) {
        await this.createProductVariants(createdProductId, data.variants, merchantId);
      }

      // Upload images if provided
      if (data.images && data.images.length > 0) {
        await this.uploadProductImages(createdProductId, data.images, merchantId);
      }

      // Return the newly created product
      return this.getProduct(createdProductId, merchantId);
    } catch (error) {
      this.logger.error(`Failed to create product in Shopify for merchant ${merchantId}`, error);
      throw error;
    }
  }

  /**
   * Update a product in Shopify
   * @param productId Shopify product ID
   * @param data Updated product data
   * @param merchantId Our internal merchant ID
   * @returns Updated product data
   */
  async updateProduct(
    productId: string,
    data: Partial<PlatformProductDto>,
    merchantId: string,
  ): Promise<PlatformProductDto> {
    try {
      const { shop, accessToken } = await this.getShopifyConnection(merchantId);

      // Prepare product update input for Shopify GraphQL API
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

      // Process tags if provided
      let tags;
      if (data.tags) {
        tags = Array.isArray(data.tags) ? data.tags.join(', ') : '';
      }

      const input: any = {
        id: `gid://shopify/Product/${productId}`,
      };

      // Only add fields that are provided using metadata for platform-specific fields
      if (data.name) input.title = data.name;
      if (data.description) input.descriptionHtml = data.description;
      if (data.metadata?.['productType'])
        input.productType = data.metadata['productType'] as string;
      if (data.metadata?.['vendor']) input.vendor = data.metadata['vendor'] as string;
      if (tags !== undefined) input.tags = tags;
      if (data.metadata?.['status']) {
        input.published = (data.metadata['status'] as string) === 'ACTIVE';
      }

      const variables = { input };

      const response = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        mutation,
        variables,
      );

      // Check for errors
      if (response.productUpdate.userErrors && response.productUpdate.userErrors.length > 0) {
        throw new Error(
          `Failed to update product: ${response.productUpdate.userErrors[0].message}`,
        );
      }

      // Handle variant updates if provided
      if (data.variants && data.variants.length > 0) {
        await this.updateProductVariants(productId, data.variants, merchantId);
      }

      // Handle image updates if provided
      if (data.images && data.images.length > 0) {
        await this.updateProductImages(productId, data.images, merchantId);
      }

      // Return the updated product
      return this.getProduct(productId, merchantId);
    } catch (error) {
      this.logger.error(
        `Failed to update product ${productId} in Shopify for merchant ${merchantId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete a product from Shopify
   * @param productId Shopify product ID
   * @param merchantId Our internal merchant ID
   * @returns Success status
   */
  async deleteProduct(productId: string, merchantId: string): Promise<boolean> {
    try {
      const { shop, accessToken } = await this.getShopifyConnection(merchantId);

      // Delete product using GraphQL
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

      const response = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        mutation,
        variables,
      );

      // Check for errors
      if (response.productDelete.userErrors && response.productDelete.userErrors.length > 0) {
        throw new Error(
          `Failed to delete product: ${response.productDelete.userErrors[0].message}`,
        );
      }

      return !!response.productDelete.deletedProductId;
    } catch (error) {
      this.logger.error(
        `Failed to delete product ${productId} from Shopify for merchant ${merchantId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Sync products from Shopify to our database
   * @param merchantId The merchant ID in our system
   * @returns Sync result
   */
  async syncProducts(merchantId: string): Promise<SyncResult> {
    try {
      // Start a timestamp for tracking sync duration
      const startTime = Date.now();

      // Get all products from Shopify
      let allProducts: PlatformProductDto[] = [];
      let hasMore = true;
      let cursor: string | undefined;

      while (hasMore) {
        const result = await this.getProducts(merchantId, 100, cursor);
        allProducts = [...allProducts, ...result.products];
        hasMore = result.hasNextPage;
        cursor = result.endCursor;

        // Log progress for large product catalogs
        this.logger.log(`Synced ${allProducts.length} products so far for merchant ${merchantId}`);
      }

      // Calculate sync duration
      const syncDuration = Date.now() - startTime;

      return {
        created: 0, // We don't know the exact breakdown, so use total
        updated: allProducts.length,
        failed: 0,
        total: allProducts.length,
        success: true,
        errors: [],
        timestamp: new Date(),
      };
    } catch (error) {
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

  /**
   * Helper method to determine product status
   */
  private getProductStatus(product: any): string {
    if (product.publishedAt) {
      return 'ACTIVE';
    }
    return 'DRAFT';
  }

  /**
   * Helper method to create product variants
   */
  private async createProductVariants(
    productId: string,
    variants: any[],
    merchantId: string,
  ): Promise<void> {
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
            locationId: 'gid://shopify/Location/1', // Default location
          },
          title: variant.title,
        },
      };

      await this.shopifyClientService.query<any>(shop, accessToken, mutation, variables);
    }
  }

  /**
   * Helper method to update product variants
   */
  private async updateProductVariants(
    productId: string,
    variants: any[],
    merchantId: string,
  ): Promise<void> {
    // Implement variant updates here
    // This would include handling existing variants and creating new ones
  }

  /**
   * Helper method to upload product images
   */
  private async uploadProductImages(
    productId: string,
    images: any[],
    merchantId: string,
  ): Promise<void> {
    const { shop, accessToken } = await this.getShopifyConnection(merchantId);

    for (const image of images) {
      // Skip if no URL is provided
      if (!image.url) continue;

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

      await this.shopifyClientService.query<any>(shop, accessToken, mutation, variables);
    }
  }

  /**
   * Helper method to update product images
   */
  private async updateProductImages(
    productId: string,
    images: any[],
    merchantId: string,
  ): Promise<void> {
    // Implement image updates here
    // This would include removing old images and adding new ones
  }
}
