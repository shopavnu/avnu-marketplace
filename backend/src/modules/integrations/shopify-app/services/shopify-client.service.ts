import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
import {
  IShopifyClientService,
  ShopifyGraphQLError,
  ShopifyUserError,
} from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';

/**
 * ShopifyClientService - Real implementation of IShopifyClientService interface
 *
 * This service handles all direct API communication with Shopify, including:
 * - GraphQL queries and mutations
 * - REST API requests
 * - Rate limiting and error handling
 */
@Injectable()
export class ShopifyClientService implements IShopifyClientService {
  private readonly logger = new Logger(ShopifyClientService.name);
  private restClient: any; // Using any type to bypass TypeScript errors with axios

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
  ) {
    // Initialize REST API client with base configuration
    this.restClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor for logging
    if (this.config.monitoring.logApiCalls) {
      this.restClient.interceptors.request.use((request: any) => {
        this.logger.debug(`[Shopify API Request] ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      });
    }

    // Add response interceptor for error handling and rate limiting
    this.restClient.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        // Handle rate limiting
        if (error.response && error.response.status === 429) {
          const retryAfter =
            error.response.headers && error.response.headers['retry-after']
              ? parseInt(error.response.headers['retry-after'] as string, 10) * 1000
              : 1000; // Default to 1 second if not in headers

          this.logger.warn(`[Shopify API] Rate limited, retrying after ${retryAfter}ms`);

          // Wait for the retry-after period
          await new Promise(resolve => setTimeout(resolve, retryAfter));

          // Retry the request
          if (error.config) {
            return this.restClient(error.config as any);
          }
        }

        this.handleApiError(error);
        throw error;
      },
    );
  }

  /**
   * Execute a GraphQL query against the Shopify Admin API
   */
  async query<T>(
    shop: string,
    accessToken: string,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T> {
    try {
      // Log the query if monitoring is enabled
      if (this.config.monitoring.logApiCalls) {
        const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery';
        this.logger.debug(`[Shopify GraphQL] ${queryName} for shop ${shop}`);
      }

      // Make the GraphQL request
      const response = await this.restClient({
        method: 'POST',
        url: `https://${shop}/admin/api/${this.config.api.version}/graphql.json`,
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
        data: {
          query,
          variables,
        },
      });

      // Check for GraphQL errors
      if (response.data && response.data.errors) {
        const errors = response.data.errors as ShopifyGraphQLError[];
        this.handleGraphQLErrors(errors, shop, query);
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`);
      }

      // Check for user errors in common mutation response patterns
      if (response.data) {
        const userErrors = this.extractUserErrors(response.data);
        if (userErrors && userErrors.length > 0) {
          this.handleUserErrors(userErrors, shop, query);
          throw new Error(`User errors: ${userErrors.map(e => e.message).join(', ')}`);
        }
      }

      return response.data && response.data.data ? (response.data.data as T) : ({} as T);
    } catch (error) {
      this.handleApiError(error, shop, query);
      throw error;
    }
  }

  /**
   * Make a REST API request to the Shopify Admin API
   */
  async request<T>(
    shop: string,
    accessToken: string,
    endpoint: string,
    method: string = 'GET',
    data?: any,
  ): Promise<T> {
    try {
      // Ensure endpoint starts with a slash
      if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
      }

      // Build request config
      const config: any = {
        method: method,
        url: `https://${shop}/admin/api/${this.config.api.version}${endpoint}`,
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      };

      // Add data for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
        config.data = data;
      }

      // Add query parameters for GET requests
      if (method.toUpperCase() === 'GET' && data) {
        config.params = data;
      }

      // Execute request
      const response = await this.restClient(config);
      return response.data as T;
    } catch (error) {
      this.handleApiError(error, shop, endpoint);
      throw error;
    }
  }

  /**
   * Get the shop information
   */
  async getShopInfo(shop: string, accessToken: string): Promise<any> {
    interface ShopInfoResponse {
      shop: {
        id: string;
        name: string;
        email: string;
        primaryDomain: {
          url: string;
          host: string;
        };
        myshopifyDomain: string;
        primaryLocale: string;
        address: {
          address1: string;
          address2?: string;
          city: string;
          province?: string;
          provinceCode?: string;
          country: string;
          countryCode: string;
          zip: string;
          phone?: string;
        };
        currencyCode: string;
        ianaTimezone: string;
        plan: {
          displayName: string;
          partnerDevelopment: boolean;
          shopifyPlus: boolean;
        };
        weightUnit: string;
      };
    }

    // Use the GraphQL shop query to get shop information
    const shopInfo = await this.query<ShopInfoResponse>(
      shop,
      accessToken,
      `
      query {
        shop {
          id
          name
          email
          primaryDomain {
            url
            host
          }
          myshopifyDomain
          primaryLocale
          address {
            address1
            address2
            city
            province
            provinceCode
            country
            countryCode
            zip
            phone
          }
          currencyCode
          ianaTimezone
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          weightUnit
        }
      }
      `,
    );

    return shopInfo && shopInfo['shop'] ? shopInfo['shop'] : null;
  }

  /**
   * Extract user errors from common Shopify GraphQL response patterns
   */
  private extractUserErrors(responseData: any): ShopifyUserError[] | null {
    // Look for common patterns of user errors in GraphQL responses
    if (!responseData || !responseData.data) {
      return null;
    }

    // Check the first mutation response for userErrors field
    const mutationName = Object.keys(responseData.data)[0];
    if (!mutationName) {
      return null;
    }

    const mutationResponse = responseData.data[mutationName];
    if (!mutationResponse) {
      return null;
    }

    // Return user errors if present
    return mutationResponse.userErrors || null;
  }

  /**
   * Handle GraphQL errors
   */
  private handleGraphQLErrors(errors: ShopifyGraphQLError[], shop: string, query: string): void {
    this.logger.error(`[Shopify GraphQL] Errors for shop ${shop}:`, {
      errors: errors.map(e => ({
        message: e.message,
        path: e.path,
        extensions: e.extensions,
      })),
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    });
  }

  /**
   * Handle user errors
   */
  private handleUserErrors(errors: ShopifyUserError[], shop: string, query: string): void {
    this.logger.warn(`[Shopify GraphQL] User errors for shop ${shop}:`, {
      errors: errors.map(e => ({
        message: e.message,
        field: e.field,
        code: e.code,
      })),
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    });
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: any, shop?: string, endpoint?: string): void {
    // Safe shop masking for logging
    const maskedShop = shop ? this.maskShopDomain(shop) : 'unknown-shop';

    if (error.response && typeof error.response === 'object') {
      // The request was made and the server responded with an error status
      const status = error.response.status || 'unknown';
      this.logger.error(`[Shopify API] Error ${status} for ${maskedShop}:`, {
        status: status,
        statusText: error.response.statusText || 'Unknown Error',
        endpoint: endpoint || 'unknown-endpoint',
        data: error.response.data || {},
      });
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error(`[Shopify API] No response from ${maskedShop}:`, {
        endpoint: endpoint || 'unknown-endpoint',
        message: error.message,
      });
    } else {
      // Something happened in setting up the request
      this.logger.error(`[Shopify API] Request setup error for ${maskedShop}:`, {
        endpoint: endpoint || 'unknown-endpoint',
        message: error.message,
      });
    }
  }

  /**
   * Mask shop domain for secure logging
   */
  private maskShopDomain(shop: string): string {
    // Mask middle part of shop domain for logging
    if (!shop) {
      return 'unknown-shop';
    }

    const parts = shop.split('.');
    if (parts.length > 0 && parts[0] && parts[0].length > 3) {
      const firstPart = parts[0];
      const restParts = parts.slice(1);
      return `${firstPart.substring(0, 3)}***${firstPart.slice(-2)}.${restParts.join('.')}`;
    }
    return shop;
  }
}
