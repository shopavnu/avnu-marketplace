import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import axios from 'axios';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Authenticate with a Shopify store
   * @param shopDomain The Shopify shop domain
   * @param apiKey The API key
   * @param apiSecret The API secret
   * @param accessToken The access token
   */
  async authenticate(
    shopDomain: string,
    apiKey: string,
    apiSecret: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      // Validate credentials by making a simple API call
      const response = await axios.get(`https://${shopDomain}/admin/api/2023-07/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to authenticate with Shopify: ${error.message}`);
      return false;
    }
  }

  /**
   * Fetch products from a Shopify store
   * @param shopDomain The Shopify shop domain
   * @param accessToken The access token
   * @param _merchantId The merchant ID in our system
   * @param limit The number of products to fetch
   * @param sinceId Only fetch products after this ID
   */
  async fetchProducts(
    shopDomain: string,
    accessToken: string,
    _merchantId: string,
    limit = 50,
    sinceId?: string,
  ): Promise<any[]> {
    try {
      let url = `https://${shopDomain}/admin/api/2023-07/products.json?limit=${limit}`;

      if (sinceId) {
        url += `&since_id=${sinceId}`;
      }

      const response = await axios.get(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });

      return (response.data as { products: any[] }).products;
    } catch (error) {
      this.logger.error(`Failed to fetch Shopify products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync products from Shopify to our database
   * @param shopDomain The Shopify shop domain
   * @param accessToken The access token
   * @param _merchantId The merchant ID in our system
   */
  async syncProducts(
    shopDomain: string,
    accessToken: string,
    _merchantId: string,
  ): Promise<{ created: number; updated: number; failed: number }> {
    let sinceId: string | undefined;
    let hasMore = true;
    let created = 0;
    let updated = 0;
    let failed = 0;

    try {
      while (hasMore) {
        const shopifyProducts = await this.fetchProducts(
          shopDomain,
          accessToken,
          _merchantId,
          50,
          sinceId,
        );

        if (shopifyProducts.length === 0) {
          hasMore = false;
          continue;
        }

        // Update the sinceId for pagination
        sinceId = shopifyProducts[shopifyProducts.length - 1].id.toString();

        for (const shopifyProduct of shopifyProducts) {
          try {
            // Check if product already exists
            try {
              const existingProduct = await this.productsService.findByExternalId(
                shopifyProduct.id.toString(),
                'shopify',
              );

              // Update existing product
              const updateDto = this.mapShopifyProductToUpdateDto(shopifyProduct, _merchantId);
              await this.productsService.update(existingProduct.id, updateDto);
              updated++;
            } catch (error) {
              // Product doesn't exist, create it
              const createDto = this.mapShopifyProductToCreateDto(shopifyProduct, _merchantId);
              await this.productsService.create(createDto);
              created++;
            }
          } catch (error) {
            this.logger.error(
              `Failed to sync Shopify product ${shopifyProduct.id}: ${error.message}`,
            );
            failed++;
          }
        }

        // If we got less than the requested limit, there are no more products
        if (shopifyProducts.length < 50) {
          hasMore = false;
        }
      }

      return { created, updated, failed };
    } catch (error) {
      this.logger.error(`Failed to sync Shopify products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map a Shopify product to our CreateProductDto
   * @param shopifyProduct The Shopify product
   * @param merchantId The merchant ID in our system
   */
  private mapShopifyProductToCreateDto(shopifyProduct: any, merchantId: string): CreateProductDto {
    const images = shopifyProduct.images.map(img => img.src);

    return {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      compareAtPrice: shopifyProduct.variants[0]?.compare_at_price
        ? parseFloat(shopifyProduct.variants[0].compare_at_price)
        : undefined,
      images: images,
      thumbnail: images[0] || '',
      categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : ['Uncategorized'],
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [],
      brandName: shopifyProduct.vendor || 'Unknown',
      isActive: shopifyProduct.status === 'active',
      inStock: shopifyProduct.variants[0]?.inventory_quantity > 0,
      quantity: shopifyProduct.variants[0]?.inventory_quantity || 0,
      values: [], // Values would need to be mapped from metafields or tags
      externalId: shopifyProduct.id.toString(),
      externalSource: 'shopify',
      merchantId,
    };
  }

  /**
   * Map a Shopify product to our UpdateProductDto
   * @param shopifyProduct The Shopify product
   * @param _merchantId The merchant ID in our system
   */
  private mapShopifyProductToUpdateDto(shopifyProduct: any, _merchantId: string): UpdateProductDto {
    const images = shopifyProduct.images.map(img => img.src);

    return {
      title: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      compareAtPrice: shopifyProduct.variants[0]?.compare_at_price
        ? parseFloat(shopifyProduct.variants[0].compare_at_price)
        : undefined,
      images: images,
      thumbnail: images[0] || '',
      categories: shopifyProduct.product_type ? [shopifyProduct.product_type] : ['Uncategorized'],
      tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(tag => tag.trim()) : [],
      brandName: shopifyProduct.vendor || 'Unknown',
      isActive: shopifyProduct.status === 'active',
      inStock: shopifyProduct.variants[0]?.inventory_quantity > 0,
      quantity: shopifyProduct.variants[0]?.inventory_quantity || 0,
    };
  }

  /**
   * Listen for Shopify webhooks
   * @param payload The webhook payload
   * @param topic The webhook topic
   * @param merchantId The merchant ID in our system
   */
  async handleWebhook(payload: any, topic: string, merchantId: string): Promise<void> {
    this.logger.log(`Received Shopify webhook: ${topic}`);

    try {
      switch (topic) {
        case 'products/create':
          await this.handleProductCreate(payload, merchantId);
          break;
        case 'products/update':
          await this.handleProductUpdate(payload, merchantId);
          break;
        case 'products/delete':
          await this.handleProductDelete(payload);
          break;
        default:
          this.logger.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle Shopify webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle product create webhook
   * @param payload The webhook payload
   * @param merchantId The merchant ID in our system
   */
  private async handleProductCreate(payload: any, merchantId: string): Promise<void> {
    try {
      const createDto = this.mapShopifyProductToCreateDto(payload, merchantId);
      await this.productsService.create(createDto);
    } catch (error) {
      this.logger.error(`Failed to handle product create webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle product update webhook
   * @param payload The webhook payload
   * @param merchantId The merchant ID in our system
   */
  private async handleProductUpdate(payload: any, merchantId: string): Promise<void> {
    try {
      // Find the product by external ID
      const existingProduct = await this.productsService.findByExternalId(
        payload.id.toString(),
        'shopify',
      );

      // Update the product
      const updateDto = this.mapShopifyProductToUpdateDto(payload, merchantId);
      await this.productsService.update(existingProduct.id, updateDto);
    } catch (error) {
      this.logger.error(`Failed to handle product update webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle product delete webhook
   * @param payload The webhook payload
   */
  private async handleProductDelete(payload: any): Promise<void> {
    try {
      // Find the product by external ID
      const existingProduct = await this.productsService.findByExternalId(
        payload.id.toString(),
        'shopify',
      );

      // Delete the product
      await this.productsService.remove(existingProduct.id);
    } catch (error) {
      this.logger.error(`Failed to handle product delete webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * @param _merchantId Merchant ID
   * @returns Sync status
   */
  async syncProductsPlaceholder(_merchantId: string): Promise<any> {
    // TODO: Implement product sync logic
    this.logger.warn(`Product sync not yet implemented for Shopify merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }

  /**
   * Sync orders for a specific merchant
   * @param _merchantId Merchant ID
   * @returns Sync status
   */
  async syncOrdersPlaceholder(_merchantId: string): Promise<any> {
    // TODO: Implement order sync logic
    this.logger.warn(`Order sync not yet implemented for Shopify merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }

  /**
   * Fetch orders for a specific merchant
   * @param _merchantId Merchant ID (unused)
   * @param options Fetch options
   * @returns List of orders
   */
  async fetchOrders(_merchantId: string, options?: any): Promise<any[]> {
    // TODO: Implement fetching orders for a specific merchant if needed
    this.logger.log(`Fetching orders with options: ${JSON.stringify(options)}`);
    // Placeholder implementation
    return [];
  }
}
