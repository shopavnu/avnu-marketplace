import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { shopifyConfig } from '../../../common/config/shopify-config';
import { PlatformType } from '../../enums/platform-type.enum';
import {
  IShopifyClientService,
  IShopifyFulfillmentService,
} from '../../../common/interfaces/shopify-services.interfaces';
import {
  ShopifyFulfillment,
  ShopifyFulfillmentHold,
  ShopifyUserError,
} from '../../../common/types/shopify-models.types';
import { SHOPIFY_CONSTANTS } from '../../../common/config/shopify-config';

/**
 * Service for handling Shopify Fulfillment operations
 *
 * Enhanced implementation of the Fulfillment API from Shopify's 2025-01 API
 * with support for multiple concurrent fulfillment holds, bulk operations,
 * and improved error handling with localized fields support.
 */
@Injectable()
export class ShopifyFulfillmentService implements IShopifyFulfillmentService {
  /**
   * Hold reasons supported by Shopify 2025-01 API
   */
  public static readonly HOLD_REASONS = {
    AWAITING_INVENTORY: 'INVENTORY',
    AWAITING_PAYMENT: 'PAYMENT',
    AWAITING_RISK_ASSESSMENT: 'RISK_ASSESSMENT',
    AWAITING_THIRD_PARTY_FULFILLER: 'THIRD_PARTY_FULFILLER',
    AWAITING_PROCESSING: 'PROCESSING',
    AWAITING_PICKUP: 'PICKUP',
    OTHER: 'OTHER',
  };

  private readonly logger = new Logger(ShopifyFulfillmentService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
    @Inject(shopifyConfig.KEY)
    private readonly config: ConfigType<typeof shopifyConfig>,
    @Inject(SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)
    private readonly shopifyClientService: IShopifyClientService,
  ) {}

  /**
   * Get a Shopify connection for a merchant
   */
  private async getShopifyConnection(merchantId: string): Promise<MerchantPlatformConnection> {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: {
        merchantId,
        platformType: PlatformType.SHOPIFY as any,
        isActive: true as any,
      },
    });

    if (!connection) {
      throw new Error(`No active Shopify connection found for merchant ${merchantId}`);
    }

    return connection;
  }

  /**
   * Create a fulfillment for an order
   * @param merchantId The merchant ID
   * @param orderId The Shopify order ID
   * @param lineItems The line items to fulfill
   * @param trackingInfo Optional tracking information
   * @returns The created fulfillment
   */
  async createFulfillment(
    merchantId: string,
    orderId: string,
    lineItems: { id: string; quantity: number }[],
    trackingInfo?: { number: string; company?: string; url?: string },
  ): Promise<ShopifyFulfillment> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to create a fulfillment
      const createFulfillmentMutation = `
        mutation fulfillmentCreate(
          $fulfillment: FulfillmentInput!
        ) {
          fulfillmentCreate(
            fulfillment: $fulfillment
          ) {
            fulfillment {
              id
              status
              createdAt
              trackingInfo {
                number
                company
                url
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    name
                    quantity
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        fulfillment: {
          orderId,
          lineItems: lineItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
          })),
          notifyCustomer: false,
          ...(trackingInfo && {
            trackingInfo: {
              number: trackingInfo.number,
              company: trackingInfo.company || '',
              url: trackingInfo.url || '',
            },
          }),
        },
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        createFulfillmentMutation,
        variables,
      );

      // Check for user errors
      if (
        result &&
        result.fulfillmentCreate &&
        result.fulfillmentCreate.userErrors &&
        result.fulfillmentCreate.userErrors.length > 0
      ) {
        const errors: ShopifyUserError[] = result.fulfillmentCreate.userErrors;
        const errorMessage = errors[0]?.message || 'Unknown error';
        this.logger.error(`Failed to create fulfillment: ${errorMessage}`);
        throw new Error(`Failed to create fulfillment: ${errorMessage}`);
      }

      // Get the created fulfillment data
      const fulfillment = result.fulfillmentCreate.fulfillment;

      if (!fulfillment) {
        throw new Error('Failed to create fulfillment: No fulfillment data returned');
      }

      // Format line items from the GraphQL response
      const formattedLineItems =
        fulfillment.lineItems?.edges?.map((edge: any) => ({
          id: edge.node.id,
          name: edge.node.name,
          quantity: edge.node.quantity,
          sku: edge.node.sku || '',
          title: edge.node.title || '',
          variant_id: edge.node.variant_id || '',
          variant_title: edge.node.variant_title || '',
          vendor: edge.node.vendor || '',
          price: edge.node.price || 0,
          grams: edge.node.grams || 0,
        })) || [];

      this.logger.log(`Created fulfillment for order ${orderId}`);

      // Extract tracking info
      const trackingNumbers: string[] = [];
      const trackingUrls: string[] = [];
      let trackingCompany = '';

      if (fulfillment['trackingInfo']) {
        if (fulfillment['trackingInfo']['number']) {
          trackingNumbers.push(fulfillment['trackingInfo']['number']);
        }
        if (fulfillment['trackingInfo']['url']) {
          trackingUrls.push(fulfillment['trackingInfo']['url']);
        }
        if (fulfillment['trackingInfo']['company']) {
          trackingCompany = fulfillment['trackingInfo']['company'];
        }
      }

      return {
        id: fulfillment.id,
        orderId,
        status: fulfillment.status,
        createdAt: fulfillment.createdAt,
        updatedAt: fulfillment.updatedAt || fulfillment.createdAt,
        trackingCompany,
        trackingNumbers,
        trackingUrls,
        lineItems: formattedLineItems,
      };
    } catch (error) {
      this.logger.error(`Failed to create fulfillment for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update a fulfillment
   * @param merchantId The merchant ID
   * @param fulfillmentId The fulfillment ID
   * @param data Partial data to update
   * @returns The updated fulfillment
   */
  async updateFulfillment(
    merchantId: string,
    fulfillmentId: string,
    data: Partial<ShopifyFulfillment>,
  ): Promise<ShopifyFulfillment> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to update a fulfillment
      const updateFulfillmentMutation = `
        mutation fulfillmentUpdate(
          $fulfillmentId: ID!
          $fulfillment: FulfillmentInput!
        ) {
          fulfillmentUpdate(
            fulfillmentId: $fulfillmentId
            fulfillment: $fulfillment
          ) {
            fulfillment {
              id
              status
              createdAt
              trackingInfo {
                number
                company
                url
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      // Prepare the fulfillment input from the data
      const fulfillmentInput: Record<string, any> = {};

      // Check and convert tracking information
      if (data.trackingNumbers && data.trackingNumbers.length > 0) {
        fulfillmentInput['trackingInfo'] = {
          number: data.trackingNumbers[0],
          company: data.trackingCompany || '',
          url: data.trackingUrls && data.trackingUrls.length > 0 ? data.trackingUrls[0] : '',
        };
      }

      // Handle optional notify customer flag using Record type to bypass TypeScript restrictions
      const dataAsRecord = data as Record<string, any>;
      if (dataAsRecord['notifyCustomer'] !== undefined) {
        fulfillmentInput['notifyCustomer'] = dataAsRecord['notifyCustomer'];
      }

      const variables = {
        fulfillmentId,
        fulfillment: fulfillmentInput,
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        updateFulfillmentMutation,
        variables,
      );

      // Check for user errors
      if (
        result &&
        result.fulfillmentUpdate &&
        result.fulfillmentUpdate.userErrors &&
        result.fulfillmentUpdate.userErrors.length > 0
      ) {
        const errors: ShopifyUserError[] = result.fulfillmentUpdate.userErrors;
        const errorMessage = errors[0]?.message || 'Unknown error';
        this.logger.error(`Failed to update fulfillment: ${errorMessage}`);
        throw new Error(`Failed to update fulfillment: ${errorMessage}`);
      }

      // Get the updated fulfillment data
      const fulfillment = result.fulfillmentUpdate.fulfillment;

      if (!fulfillment) {
        throw new Error('Failed to update fulfillment: No fulfillment data returned');
      }

      this.logger.log(`Updated fulfillment ${fulfillmentId}`);

      // Extract tracking info
      const trackingNumbers: string[] = [];
      const trackingUrls: string[] = [];
      let trackingCompany = '';

      if (fulfillment['trackingInfo']) {
        if (fulfillment['trackingInfo']['number']) {
          trackingNumbers.push(fulfillment['trackingInfo']['number']);
        }
        if (fulfillment['trackingInfo']['url']) {
          trackingUrls.push(fulfillment['trackingInfo']['url']);
        }
        if (fulfillment['trackingInfo']['company']) {
          trackingCompany = fulfillment['trackingInfo']['company'];
        }
      }

      // Return the updated fulfillment
      return {
        id: fulfillment.id,
        status: fulfillment.status,
        createdAt: fulfillment.createdAt,
        updatedAt: fulfillment.updatedAt || fulfillment.createdAt,
        trackingCompany,
        trackingNumbers,
        trackingUrls,
        orderId: data.orderId || '',
        lineItems: data.lineItems || [],
      };
    } catch (error) {
      this.logger.error(`Failed to update fulfillment ${fulfillmentId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a fulfillment
   * @param merchantId The merchant ID
   * @param fulfillmentId The fulfillment ID to cancel
   */
  async cancelFulfillment(merchantId: string, fulfillmentId: string): Promise<void> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to cancel a fulfillment
      const cancelFulfillmentMutation = `
        mutation fulfillmentCancel(
          $id: ID!
        ) {
          fulfillmentCancel(
            id: $id
          ) {
            fulfillment {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        id: fulfillmentId,
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        cancelFulfillmentMutation,
        variables,
      );

      // Check for user errors
      if (
        result &&
        result.fulfillmentCancel &&
        result.fulfillmentCancel.userErrors &&
        result.fulfillmentCancel.userErrors.length > 0
      ) {
        const errors: ShopifyUserError[] = result.fulfillmentCancel.userErrors;
        const errorMessage = errors[0]?.message || 'Unknown error';
        this.logger.error(`Failed to cancel fulfillment: ${errorMessage}`);
        throw new Error(`Failed to cancel fulfillment: ${errorMessage}`);
      }

      this.logger.log(`Cancelled fulfillment ${fulfillmentId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel fulfillment ${fulfillmentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a fulfillment hold
   * Enhanced for 2025-01 API to support multiple concurrent holds
   * @param merchantId The merchant ID
   * @param fulfillmentOrderId The fulfillment order ID
   * @param reason The reason for the hold (use HOLD_REASONS constants)
   * @param reasonNotes Optional additional notes
   * @param releaseDate Optional date when hold should be released
   * @param notifyCustomer Whether to notify the customer about the hold
   * @param metadata Optional metadata for the hold
   * @returns The created fulfillment hold
   */
  async createFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    reason: string,
    reasonNotes?: string,
    releaseDate?: string,
    notifyCustomer: boolean = false,
    metadata?: Record<string, any>,
  ): Promise<ShopifyFulfillmentHold> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // GraphQL mutation to create a fulfillment hold
      const createFulfillmentHoldMutation = `
        mutation fulfillmentOrderHold(
          $fulfillmentOrderId: ID!
          $reason: String!
          $reasonNotes: String
          $releaseDate: DateTime
          $notifyCustomer: Boolean
          $metadata: JSON
        ) {
          fulfillmentOrderHold(
            fulfillmentOrderId: $fulfillmentOrderId
            reason: $reason
            reasonNotes: $reasonNotes
            releaseDate: $releaseDate
            notifyCustomer: $notifyCustomer
            metadata: $metadata
          ) {
            fulfillmentHold {
              id
              reason
              reasonNotes
              heldByApp {
                id
                title
              }
              createdAt
              updatedAt
              releaseDate
              releaseStatus
              notifyCustomer
              metadata
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        fulfillmentOrderId,
        reason,
        reasonNotes,
        releaseDate,
        notifyCustomer,
        metadata: metadata || null,
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        createFulfillmentHoldMutation,
        variables,
      );

      // Check for user errors
      if (
        result &&
        result.fulfillmentOrderHold &&
        result.fulfillmentOrderHold.userErrors &&
        result.fulfillmentOrderHold.userErrors.length > 0
      ) {
        const errors: ShopifyUserError[] = result.fulfillmentOrderHold.userErrors;
        const errorMessage = errors[0]?.message || 'Unknown error';
        this.logger.error(`Failed to create fulfillment hold: ${errorMessage}`);
        throw new Error(`Failed to create fulfillment hold: ${errorMessage}`);
      }

      // Get the created hold data
      const hold = result.fulfillmentOrderHold.fulfillmentHold;

      if (!hold) {
        throw new Error('Failed to create fulfillment hold: No hold data returned');
      }

      this.logger.log(`Created fulfillment hold for fulfillment order ${fulfillmentOrderId}`);

      return {
        id: hold.id,
        reason: hold.reason,
        reasonNotes: hold.reasonNotes,
        heldByApp: hold.heldByApp
          ? {
              id: hold.heldByApp.id,
              title: hold.heldByApp.title,
            }
          : { id: '', title: '' },
        createdAt: hold.createdAt,
        updatedAt: hold.updatedAt,
        releaseDate: hold.releaseDate,
        releaseStatus: hold.releaseStatus,
        fulfillmentOrderId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create fulfillment hold for fulfillment order ${fulfillmentOrderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Release a fulfillment hold
   * Enhanced for 2025-01 API to support multiple concurrent holds
   * @param merchantId The merchant ID
   * @param fulfillmentOrderId The fulfillment order ID
   * @param holdId The ID of the fulfillment hold to release
   * @param notes Optional notes about the release
   * @param metadata Optional metadata for the release
   * @returns void
   */
  async releaseFulfillmentHold(
    merchantId: string,
    fulfillmentOrderId: string,
    holdId: string,
    notes?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Enhanced GraphQL mutation to release a fulfillment hold (2025-01 API)
      const releaseFulfillmentHoldMutation = `
        mutation fulfillmentOrderHoldRelease(
          $fulfillmentOrderId: ID!
          $fulfillmentHoldId: ID!
          $notes: String
          $notifyCustomer: Boolean
          $metadata: JSON
        ) {
          fulfillmentOrderHoldRelease(
            fulfillmentOrderId: $fulfillmentOrderId
            fulfillmentHoldId: $fulfillmentHoldId
            notes: $notes
            notifyCustomer: $notifyCustomer
            metadata: $metadata
          ) {
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        fulfillmentOrderId,
        fulfillmentHoldId: holdId,
        notes,
        notifyCustomer: Boolean(notes),
        metadata: metadata || null,
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        releaseFulfillmentHoldMutation,
        variables,
      );

      // Check for user errors
      if (
        result &&
        result.fulfillmentOrderHoldRelease &&
        result.fulfillmentOrderHoldRelease.userErrors &&
        result.fulfillmentOrderHoldRelease.userErrors.length > 0
      ) {
        const errors: ShopifyUserError[] = result.fulfillmentOrderHoldRelease.userErrors;
        const errorMessage = errors[0]?.message || 'Unknown error';
        this.logger.error(`Failed to release fulfillment hold: ${errorMessage}`);
        throw new Error(`Failed to release fulfillment hold: ${errorMessage}`);
      }

      this.logger.log(
        `Released fulfillment hold ${holdId} for fulfillment order ${fulfillmentOrderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to release fulfillment hold ${holdId} for fulfillment order ${fulfillmentOrderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get fulfillment holds for a fulfillment order
   * Enhanced for 2025-01 API to support multiple concurrent holds
   * @param merchantId The merchant ID
   * @param fulfillmentOrderId The fulfillment order ID
   * @param includeReleased Whether to include released holds
   * @returns Array of fulfillment holds
   */
  async getFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
    includeReleased: boolean = false,
  ): Promise<ShopifyFulfillmentHold[]> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Enhanced GraphQL query to get fulfillment holds (2025-01 API)
      const getFulfillmentHoldsQuery = `
        query getFulfillmentHolds(
          $fulfillmentOrderId: ID!
          $includeReleased: Boolean
        ) {
          node(id: $fulfillmentOrderId) {
            ... on FulfillmentOrder {
              id
              fulfillmentHolds(includeReleased: $includeReleased) {
                id
                reason
                reasonNotes
                heldByApp {
                  id
                  title
                }
                createdAt
                updatedAt
                releaseDate
                releaseStatus
                notifyCustomer
                metadata
              }
            }
          }
        }
      `;

      const variables = {
        fulfillmentOrderId,
        includeReleased,
      };

      const result = await this.shopifyClientService.query<any>(
        shop,
        accessToken,
        getFulfillmentHoldsQuery,
        variables,
      );

      // Check if the response structure is valid
      if (!result || !result.node || !result.node.fulfillmentHolds) {
        throw new Error('Failed to get fulfillment holds: Invalid response structure');
      }

      // Map the holds to ShopifyFulfillmentHold objects
      const holds: ShopifyFulfillmentHold[] = result.node.fulfillmentHolds
        .map((hold: any) => {
          if (!hold) return null;

          return {
            id: hold.id,
            reason: hold.reason,
            reasonNotes: hold.reasonNotes,
            heldByApp: hold.heldByApp
              ? {
                  id: hold.heldByApp.id,
                  title: hold.heldByApp.title,
                }
              : { id: '', title: '' },
            createdAt: hold.createdAt,
            updatedAt: hold.updatedAt,
            releaseDate: hold.releaseDate,
            releaseStatus: hold.releaseStatus,
            fulfillmentOrderId,
          };
        })
        .filter(Boolean);

      this.logger.log(
        `Retrieved ${holds.length} fulfillment holds for fulfillment order ${fulfillmentOrderId}`,
      );
      return holds;
    } catch (error) {
      this.logger.error(
        `Failed to get fulfillment holds for fulfillment order ${fulfillmentOrderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Register as a fulfillment service with Shopify
   * Enhanced for 2025-01 API with additional configuration options
   * @param merchantId The merchant ID
   * @param options Optional configuration options for the fulfillment service
   * @returns Registration result
   */
  async registerAsFulfillmentService(
    merchantId: string,
    options?: {
      name?: string;
      callbackPath?: string;
      inventoryManagement?: boolean;
      trackingSupport?: boolean;
      requiresShippingMethod?: boolean;
    },
  ): Promise<any> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Creating a fulfillment service requires REST API in Shopify
      const endpoint = `/admin/fulfillment_services.json`;

      // Extract base URL from the auth callback URL
      const baseUrl = this.config.auth.callbackUrl.split('/auth/')[0];
      const callbackPath =
        options?.callbackPath || '/api/integrations/shopify/fulfillment/callback';

      const data = {
        fulfillment_service: {
          name: options?.name || 'Avnu Marketplace Fulfillment',
          callback_url: `${baseUrl}${callbackPath}`,
          inventory_management:
            options?.inventoryManagement !== undefined ? options.inventoryManagement : true,
          tracking_support: options?.trackingSupport !== undefined ? options.trackingSupport : true,
          requires_shipping_method:
            options?.requiresShippingMethod !== undefined ? options.requiresShippingMethod : true,
          format: 'json',
        },
      };

      const result = await this.shopifyClientService.request<any>(
        shop,
        accessToken,
        endpoint,
        'POST',
        data,
      );

      this.logger.log(`Registered as fulfillment service for merchant ${merchantId}`);
      return result['fulfillment_service'];
    } catch (error) {
      this.logger.error(
        `Failed to register as fulfillment service for merchant ${merchantId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create multiple fulfillment holds at once
   * New method for 2025-01 API to support multi-hold workflows
   * @param merchantId The merchant ID
   * @param fulfillmentOrderId The fulfillment order ID
   * @param holds Array of hold configurations to create
   * @returns The created fulfillment holds
   */
  async createMultipleFulfillmentHolds(
    merchantId: string,
    fulfillmentOrderId: string,
    holds: Array<{
      reason: string;
      reasonNotes?: string;
      releaseDate?: string;
    }>,
  ): Promise<ShopifyFulfillmentHold[]> {
    try {
      const results: ShopifyFulfillmentHold[] = [];

      // Create each hold sequentially
      for (const hold of holds) {
        try {
          const createdHold = await this.createFulfillmentHold(
            merchantId,
            fulfillmentOrderId,
            hold.reason,
            hold.reasonNotes,
            hold.releaseDate,
          );

          results.push(createdHold);
        } catch (error: any) {
          this.logger.error(
            `Failed to create one of multiple fulfillment holds: ${error.message || error}`,
          );
          // Continue with other holds even if one fails
        }
      }

      this.logger.log(
        `Created ${results.length}/${holds.length} fulfillment holds for order ${fulfillmentOrderId}`,
      );
      return results;
    } catch (error: any) {
      this.logger.error(`Failed to create multiple fulfillment holds: ${error.message || error}`);
      throw error;
    }
  }

  /**
   * Delete a registered fulfillment service from Shopify
   * New method for 2025-01 API to support better service management
   * @param merchantId The merchant ID
   * @param fulfillmentServiceId The ID of the fulfillment service to delete
   * @returns Operation success status
   */
  async deleteFulfillmentService(
    merchantId: string,
    fulfillmentServiceId: string,
  ): Promise<boolean> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Deleting a fulfillment service requires REST API in Shopify
      const endpoint = `/admin/fulfillment_services/${fulfillmentServiceId}.json`;

      await this.shopifyClientService.request<any>(shop, accessToken, endpoint, 'DELETE');

      this.logger.log(
        `Deleted fulfillment service ${fulfillmentServiceId} for merchant ${merchantId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete fulfillment service for merchant ${merchantId}:`, error);
      return false;
    }
  }

  /**
   * Get registered fulfillment services for a merchant
   * New method for 2025-01 API to support better service discovery
   * @param merchantId The merchant ID
   * @returns List of registered fulfillment services
   */
  async getFulfillmentServices(merchantId: string): Promise<any[]> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Getting fulfillment services requires REST API in Shopify
      const endpoint = `/admin/fulfillment_services.json`;

      const result = await this.shopifyClientService.request<any>(
        shop,
        accessToken,
        endpoint,
        'GET',
      );

      this.logger.log(
        `Retrieved ${result['fulfillment_services']?.length || 0} fulfillment services for merchant ${merchantId}`,
      );
      return result['fulfillment_services'] || [];
    } catch (error) {
      this.logger.error(`Failed to get fulfillment services for merchant ${merchantId}:`, error);
      return [];
    }
  }

  /**
   * Update a fulfillment service configuration
   * New method for 2025-01 API
   * @param merchantId The merchant ID
   * @param fulfillmentServiceId The fulfillment service ID to update
   * @param updateData The data to update
   * @returns Updated fulfillment service data
   */
  async updateFulfillmentService(
    merchantId: string,
    fulfillmentServiceId: string,
    updateData: {
      name?: string;
      callbackUrl?: string;
      inventoryManagement?: boolean;
      trackingSupport?: boolean;
      requiresShippingMethod?: boolean;
    },
  ): Promise<any> {
    try {
      const connection = await this.getShopifyConnection(merchantId);
      const shop = connection.platformStoreName;
      const accessToken = connection.accessToken;

      // Updating a fulfillment service requires REST API in Shopify
      const endpoint = `/admin/fulfillment_services/${fulfillmentServiceId}.json`;

      // Build the update payload
      const data: Record<string, any> = { fulfillment_service: {} };

      if (updateData.name) {
        data['fulfillment_service']['name'] = updateData.name;
      }

      if (updateData.callbackUrl) {
        data['fulfillment_service']['callback_url'] = updateData.callbackUrl;
      }

      if (updateData.inventoryManagement !== undefined) {
        data['fulfillment_service']['inventory_management'] = updateData.inventoryManagement;
      }

      if (updateData.trackingSupport !== undefined) {
        data['fulfillment_service']['tracking_support'] = updateData.trackingSupport;
      }

      if (updateData.requiresShippingMethod !== undefined) {
        data['fulfillment_service']['requires_shipping_method'] = updateData.requiresShippingMethod;
      }

      const result = await this.shopifyClientService.request<any>(
        shop,
        accessToken,
        endpoint,
        'PUT',
        data,
      );

      this.logger.log(
        `Updated fulfillment service ${fulfillmentServiceId} for merchant ${merchantId}`,
      );
      return result['fulfillment_service'];
    } catch (error) {
      this.logger.error(`Failed to update fulfillment service for merchant ${merchantId}:`, error);
      throw error;
    }
  }
}
