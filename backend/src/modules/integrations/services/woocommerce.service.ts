import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import axios from 'axios';
import OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

@Injectable()
export class WooCommerceService {
  private readonly logger = new Logger(WooCommerceService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Create OAuth signature for WooCommerce API
   * @param storeUrl The WooCommerce store URL
   * @param consumerKey The consumer key
   * @param consumerSecret The consumer secret
   */
  private createOAuth(storeUrl: string, consumerKey: string, consumerSecret: string) {
    return new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA256',
      hash_function(base_string, key) {
        return crypto.createHmac('sha256', key).update(base_string).digest('base64');
      },
    });
  }

  /**
   * Authenticate with a WooCommerce store
   * @param storeUrl The WooCommerce store URL
   * @param consumerKey The consumer key
   * @param consumerSecret The consumer secret
   */
  async authenticate(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
  ): Promise<boolean> {
    try {
      const oauth = this.createOAuth(storeUrl, consumerKey, consumerSecret);

      const requestData = {
        url: `${storeUrl}/wp-json/wc/v3/products`,
        method: 'GET',
      };

      const headers = oauth.toHeader(oauth.authorize(requestData));

      const response = await axios({
        url: requestData.url,
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        params: {
          per_page: 1,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to authenticate with WooCommerce: ${error.message}`);
      return false;
    }
  }

  /**
   * Fetch products from a WooCommerce store
   * @param storeUrl The WooCommerce store URL
   * @param consumerKey The consumer key
   * @param consumerSecret The consumer secret
   * @param merchantId The merchant ID in our system
   * @param page The page number
   * @param perPage The number of products per page
   */
  async fetchProducts(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    merchantId: string,
    page = 1,
    perPage = 50,
  ): Promise<any[]> {
    try {
      const oauth = this.createOAuth(storeUrl, consumerKey, consumerSecret);

      const requestData = {
        url: `${storeUrl}/wp-json/wc/v3/products`,
        method: 'GET',
      };

      const headers = oauth.toHeader(oauth.authorize(requestData));

      const response = await axios({
        url: requestData.url,
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        params: {
          page,
          per_page: perPage,
        },
      });

      this.logger.debug(`WooCommerce fetchProducts response: ${response.status}`);
      return response.data as any[];
    } catch (error) {
      // Handle specific error cases if needed
      if (error.response && error.response.status === 400) {
        this.logger.warn(
          `Bad request fetching products page ${page} for merchant ${merchantId}: ${error.response.data?.message || error.message}`,
        );
        // Return empty array to signify no more products or invalid request
        return [];
      }

      this.logger.error(
        `Failed to fetch products page ${page} for merchant ${merchantId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Sync products from WooCommerce to our database
   * @param storeUrl The WooCommerce store URL
   * @param consumerKey The consumer key
   * @param consumerSecret The consumer secret
   * @param merchantId The merchant ID in our system
   */
  async syncProducts(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string,
    merchantId: string,
  ): Promise<{ created: number; updated: number; failed: number }> {
    let page = 1;
    let hasMore = true;
    let created = 0;
    let updated = 0;
    let failed = 0;

    try {
      while (hasMore) {
        const wooProducts = await this.fetchProducts(
          storeUrl,
          consumerKey,
          consumerSecret,
          merchantId,
          page,
          50,
        );

        if (wooProducts.length === 0) {
          hasMore = false;
          continue;
        }

        for (const wooProduct of wooProducts) {
          try {
            // Check if product already exists
            try {
              const existingProduct = await this.productsService.findByExternalId(
                wooProduct.id.toString(),
                'woocommerce',
              );

              // Update existing product
              const updateDto = this.mapWooProductToUpdateDto(wooProduct, merchantId);
              await this.productsService.update(existingProduct.id, updateDto);
              updated++;
            } catch (error) {
              // Product doesn't exist, create it
              const createDto = this.mapWooProductToCreateDto(wooProduct, merchantId);
              await this.productsService.create(createDto);
              created++;
            }
          } catch (error) {
            this.logger.error(
              `Failed to sync WooCommerce product ${wooProduct.id}: ${error.message}`,
            );
            failed++;
          }
        }

        // If we got less than the requested limit, there are no more products
        if (wooProducts.length < 50) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return { created, updated, failed };
    } catch (error) {
      this.logger.error(`Failed to sync WooCommerce products: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map a WooCommerce product to our CreateProductDto
   * @param wooProduct The WooCommerce product
   * @param merchantId The merchant ID in our system
   */
  private mapWooProductToCreateDto(wooProduct: any, merchantId: string): CreateProductDto {
    const images = wooProduct.images.map(img => img.src);

    return {
      title: wooProduct.name,
      description: wooProduct.description,
      price: parseFloat(wooProduct.price || '0'),
      compareAtPrice: parseFloat(wooProduct.regular_price || '0'),
      images,
      thumbnail: images[0] || '',
      categories: wooProduct.categories.map(cat => cat.name),
      tags: wooProduct.tags.map(tag => tag.name),
      merchantId,
      brandName: this.extractBrandFromAttributes(wooProduct.attributes) || 'Unknown',
      isActive: wooProduct.status === 'publish',
      inStock: wooProduct.stock_status === 'instock',
      quantity: wooProduct.stock_quantity || 0,
      values: this.extractValuesFromAttributes(wooProduct.attributes),
      externalId: wooProduct.id.toString(),
      externalSource: 'woocommerce',
    };
  }

  /**
   * Map a WooCommerce product to our UpdateProductDto
   * @param wooProduct The WooCommerce product
   * @param _merchantId The merchant ID in our system (unused in update)
   */
  private mapWooProductToUpdateDto(wooProduct: any, _merchantId: string): UpdateProductDto {
    const images = wooProduct.images.map(img => img.src);

    return {
      title: wooProduct.name,
      description: wooProduct.description,
      price: parseFloat(wooProduct.price || '0'),
      compareAtPrice: parseFloat(wooProduct.regular_price || '0'),
      images,
      thumbnail: images[0] || '',
      categories: wooProduct.categories.map(cat => cat.name),
      tags: wooProduct.tags.map(tag => tag.name),
      // merchantId is not typically updated, so it's omitted here
      brandName: this.extractBrandFromAttributes(wooProduct.attributes) || 'Unknown',
      isActive: wooProduct.status === 'publish',
      inStock: wooProduct.stock_status === 'instock',
      quantity: wooProduct.stock_quantity || 0,
      values: this.extractValuesFromAttributes(wooProduct.attributes),
    };
  }

  /**
   * Extract brand from WooCommerce product attributes
   * @param attributes The WooCommerce product attributes
   */
  private extractBrandFromAttributes(attributes: any[]): string | undefined {
    if (!attributes || !Array.isArray(attributes)) {
      return undefined;
    }

    const brandAttribute = attributes.find(
      attr => attr.name.toLowerCase() === 'brand' || attr.name.toLowerCase() === 'manufacturer',
    );

    return brandAttribute ? brandAttribute.options[0] : undefined;
  }

  /**
   * Extract values from WooCommerce product attributes
   * @param attributes The WooCommerce product attributes
   */
  private extractValuesFromAttributes(attributes: any[]): string[] {
    if (!attributes || !Array.isArray(attributes)) {
      return [];
    }

    const valueAttributes = attributes.filter(
      attr =>
        attr.name.toLowerCase() === 'values' ||
        attr.name.toLowerCase() === 'sustainability' ||
        attr.name.toLowerCase() === 'ethical',
    );

    if (valueAttributes.length === 0) {
      return [];
    }

    return valueAttributes.flatMap(attr => attr.options);
  }

  /**
   * Handle WooCommerce webhook
   * @param payload The webhook payload
   * @param topic The webhook topic
   * @param merchantId The merchant ID in our system
   */
  async handleWebhook(payload: any, topic: string, merchantId: string): Promise<void> {
    this.logger.log(`Received WooCommerce webhook: ${topic}`);

    try {
      switch (topic) {
        case 'product.created':
          await this.handleProductCreate(payload, merchantId);
          break;
        case 'product.updated':
          await this.handleProductUpdate(payload, merchantId);
          break;
        case 'product.deleted':
          await this.handleProductDelete(payload);
          break;
        default:
          this.logger.log(`Unhandled webhook topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle WooCommerce webhook: ${error.message}`);
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
      const createDto = this.mapWooProductToCreateDto(payload, merchantId);
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
        'woocommerce',
      );

      // Update the product
      const updateDto = this.mapWooProductToUpdateDto(payload, merchantId);
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
        'woocommerce',
      );

      // Delete the product
      await this.productsService.remove(existingProduct.id);
    } catch (error) {
      this.logger.error(`Failed to handle product delete webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync products for a specific merchant
   * @param _merchantId Merchant ID
   * @returns Sync status
   */
  async syncProductsPlaceholder(_merchantId: string): Promise<any> {
    // TODO: Implement product sync logic
    this.logger.warn(`Product sync not yet implemented for WooCommerce merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }

  /**
   * Sync orders for a specific merchant
   * @param _merchantId Merchant ID
   * @returns Sync status
   */
  async syncOrdersPlaceholder(_merchantId: string): Promise<any> {
    // TODO: Implement order sync logic
    this.logger.warn(`Order sync not yet implemented for WooCommerce merchant ${_merchantId}`);
    return { status: 'pending', message: 'Sync not implemented' };
  }
}
