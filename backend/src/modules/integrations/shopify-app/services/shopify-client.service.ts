import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import _axios from 'axios';
import {
  IShopifyClientService,
  ShopifyGraphQLError,
  ShopifyUserError,
} from '../../../common/interfaces/shopify-services.interfaces';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { ShopifyVersionManagerService } from './shopify-version-manager.service';
import { ShopifyConnectionPoolManager } from '../utils/connection-pool-manager';
import { ShopifyCircuitBreaker } from '../utils/circuit-breaker';
import { ShopifyStructuredLogger } from '../utils/structured-logger';
import { ShopifyCacheManager } from '../utils/cache-manager';

// Define type alias for axios config to avoid direct import
type AxiosRequestConfig = any;

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
  private readonly logger: ShopifyStructuredLogger;

  constructor(
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    private readonly versionManager: ShopifyVersionManagerService,
    private readonly connectionPool: ShopifyConnectionPoolManager,
    private readonly circuitBreaker: ShopifyCircuitBreaker,
    private readonly cacheManager: ShopifyCacheManager,
    logger: ShopifyStructuredLogger,
  ) {
    // Use the structured logger for better error tracking
    this.logger = logger;

    // The connection pool manager now handles all API requests
    // with built-in rate limiting, retries, and prioritization
    this.logger.log('ShopifyClientService initialized with scalability enhancements');
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
    // Extract query name for circuit breaker and logging
    const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery';
    const circuitKey = `shop:${shop}:graphql:${queryName}`;

    // Log the query
    this.logger.logApiRequest('graphql', shop, {
      queryName,
      operationType: query.includes('mutation') ? 'mutation' : 'query',
    });

    // Determine priority based on operation type
    // Mutations are generally more important than queries
    const priorities = this.connectionPool.getPriorities();
    const priority = query.includes('mutation') ? priorities.HIGH : priorities.MEDIUM;

    try {
      // First try to get from cache for queries (not mutations)
      if (!query.includes('mutation')) {
        // Generate a cache key based on the query and variables
        const cacheResult = await this.cacheManager.getOrFetch<T>(
          {
            namespace: 'graphql',
            merchantId: shop,
            resource: queryName,
            id: JSON.stringify(variables || {}),
          },
          async () => {
            // This function is called on cache miss
            return this.executeGraphQLQuery(
              shop,
              accessToken,
              query,
              variables,
              circuitKey,
              priority,
            );
          },
          { ttl: 300 }, // 5 minute cache for most queries
        );

        return cacheResult;
      }

      // For mutations or non-cacheable queries, execute directly
      return await this.executeGraphQLQuery(
        shop,
        accessToken,
        query,
        variables,
        circuitKey,
        priority,
      );
    } catch (error) {
      // Enhanced error logging with the structured logger
      this.logger.error(`GraphQL query failed: ${queryName}`, {
        shopDomain: shop,
        errorMessage: error.message,
        errorCode: error.code,
        queryName,
      });
      throw error;
    }
  }

  /**
   * Execute a GraphQL query with circuit breaker protection
   * (Internal method used by query)
   */
  private async executeGraphQLQuery<T>(
    shop: string,
    accessToken: string,
    query: string,
    variables: Record<string, any> | undefined,
    circuitKey: string,
    priority: number,
  ): Promise<T> {
    // Use circuit breaker to protect against cascading failures
    return this.circuitBreaker.executeWithCircuitBreaker(circuitKey, async () => {
      // Prepare request configuration
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: this.versionManager.getVersionedEndpoint(shop, '/graphql.json'),
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        data: {
          query,
          variables,
        },
      };

      // Execute request through connection pool with proper rate limiting
      const startTime = Date.now();
      const response = await this.connectionPool.executeRequest(shop, config, priority);
      const duration = Date.now() - startTime;

      // Log the response timing
      this.logger.logApiResponse('graphql', shop, response.status, duration, {
        queryName: query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery',
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

      return response.data;
    });
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
    // Create a circuit breaker key based on endpoint and method
    const normalizedEndpoint = endpoint.split('?')[0].replace(/\d+/g, ':id'); // Normalize IDs in URL
    const circuitKey = `shop:${shop}:rest:${method}:${normalizedEndpoint}`;

    // Log the request
    this.logger.logApiRequest(`rest:${method}`, shop, { endpoint });

    // Determine priority based on method and endpoint
    const priorities = this.connectionPool.getPriorities();
    let priority = priorities.MEDIUM;

    // Orders and inventory endpoints get higher priority
    if (endpoint.includes('/orders') || endpoint.includes('/inventory')) {
      priority = priorities.HIGH;
    }
    // Checkout endpoints get highest priority
    else if (endpoint.includes('/checkouts')) {
      priority = priorities.CRITICAL;
    }
    // Analytics and reporting get lower priority
    else if (endpoint.includes('/reports') || endpoint.includes('/analytics')) {
      priority = priorities.LOW;
    }

    try {
      // For GET requests, we can use caching
      if (method === 'GET') {
        // Generate cache key parts
        const cacheResult = await this.cacheManager.getOrFetch<T>(
          {
            namespace: 'rest',
            merchantId: shop,
            resource: normalizedEndpoint,
            id: JSON.stringify(data || {}),
          },
          async () => {
            // This function is called on cache miss
            return this.executeRestRequest(
              shop,
              accessToken,
              endpoint,
              method,
              data,
              circuitKey,
              priority,
            );
          },
          {
            ttl: 300, // 5 minute cache for most GET requests
            // Don't cache certain frequently changing resources as long
            ...(endpoint.includes('/inventory') ? { ttl: 60 } : {}),
            ...(endpoint.includes('/orders/') ? { ttl: 30 } : {}),
          },
        );

        return cacheResult;
      }

      // For non-GET requests, execute directly
      return await this.executeRestRequest(
        shop,
        accessToken,
        endpoint,
        method,
        data,
        circuitKey,
        priority,
      );
    } catch (error) {
      // Enhanced error logging with structured logger
      this.logger.error(`REST request failed: ${method} ${endpoint}`, {
        shopDomain: shop,
        endpoint,
        method,
        errorMessage: error.message,
        errorCode: error.response?.status || error.code,
      });
      throw error;
    }
  }

  /**
   * Execute a REST API request with circuit breaker protection
   * (Internal method used by request)
   */
  private async executeRestRequest<T>(
    shop: string,
    accessToken: string,
    endpoint: string,
    method: string,
    data: any,
    circuitKey: string,
    priority: number,
  ): Promise<T> {
    // Use circuit breaker to protect against cascading failures
    return this.circuitBreaker.executeWithCircuitBreaker(circuitKey, async () => {
      // Prepare request configuration
      const config: AxiosRequestConfig = {
        method,
        url: this.versionManager.getVersionedEndpoint(shop, endpoint),
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      };

      // Execute request through connection pool with proper rate limiting
      const startTime = Date.now();
      const response = await this.connectionPool.executeRequest(shop, config, priority);
      const duration = Date.now() - startTime;

      // Log the response timing
      this.logger.logApiResponse(`rest:${method}`, shop, response.status, duration, {
        endpoint,
      });

      // For non-GET methods that modify data, invalidate related caches
      if (method !== 'GET') {
        // Extract the resource type from the endpoint
        const resourceType = endpoint.split('/')[1]; // e.g., "products" from "/products/123"
        if (resourceType) {
          this.cacheManager.invalidateResource(shop, resourceType);
        }
      }

      return response.data;
    });
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
    const apiVersion = this.versionManager.getApiVersion();

    if (error.response && typeof error.response === 'object') {
      // The request was made and the server responded with an error status
      const status = error.response.status || 'unknown';
      this.logger.error(`[Shopify API] Error ${status} for ${maskedShop}:`, {
        status: status,
        statusText: error.response.statusText || 'Unknown Error',
        endpoint: endpoint || 'unknown-endpoint',
        apiVersion: apiVersion,
        data: error.response.data || {},
      });

      // Check if error is related to API version and log appropriate message
      if (status === 400 && error.response.data?.errors?.includes('version')) {
        this.logger.error(
          `API version ${apiVersion} might be causing compatibility issues. Consider updating version.`,
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error(`[Shopify API] No response from ${maskedShop}:`, {
        endpoint: endpoint || 'unknown-endpoint',
        apiVersion: apiVersion,
        message: error.message,
      });
    } else {
      // Something happened in setting up the request
      this.logger.error(`[Shopify API] Request setup error for ${maskedShop}:`, {
        endpoint: endpoint || 'unknown-endpoint',
        apiVersion: apiVersion,
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
