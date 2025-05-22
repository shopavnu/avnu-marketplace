import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ShopifyClientService } from './shopify-client.service';

/**
 * Extensions to the ShopifyClientService
 *
 * This provides additional methods to the ShopifyClientService
 * that are useful for health checks and scalability monitoring.
 */
@Injectable()
export class ShopifyClientExtensions {
  constructor(private readonly shopifyClientService: ShopifyClientService) {}

  /**
   * Check if Shopify API is reachable
   *
   * This performs a lightweight API call to check connectivity
   * without requiring specific shop credentials
   */
  async isShopifyReachable(): Promise<boolean> {
    try {
      // Just try to access the Shopify status page or status API
      const response = await axios.get('https://status.shopify.com/api/v2/status.json', {
        timeout: 5000, // 5 second timeout for quick response
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
