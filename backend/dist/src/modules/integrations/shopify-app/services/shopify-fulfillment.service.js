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
var ShopifyFulfillmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyFulfillmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const shopify_config_1 = require("../../../common/config/shopify-config");
const platform_type_enum_1 = require("../../enums/platform-type.enum");
const shopify_config_2 = require("../../../common/config/shopify-config");
let ShopifyFulfillmentService = ShopifyFulfillmentService_1 = class ShopifyFulfillmentService {
    constructor(merchantPlatformConnectionRepository, config, shopifyClientService) {
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.config = config;
        this.shopifyClientService = shopifyClientService;
        this.logger = new common_1.Logger(ShopifyFulfillmentService_1.name);
    }
    async getShopifyConnection(merchantId) {
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
        return connection;
    }
    async createFulfillment(merchantId, orderId, lineItems, trackingInfo) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const result = await this.shopifyClientService.query(shop, accessToken, createFulfillmentMutation, variables);
            if (result &&
                result.fulfillmentCreate &&
                result.fulfillmentCreate.userErrors &&
                result.fulfillmentCreate.userErrors.length > 0) {
                const errors = result.fulfillmentCreate.userErrors;
                const errorMessage = errors[0]?.message || 'Unknown error';
                this.logger.error(`Failed to create fulfillment: ${errorMessage}`);
                throw new Error(`Failed to create fulfillment: ${errorMessage}`);
            }
            const fulfillment = result.fulfillmentCreate.fulfillment;
            if (!fulfillment) {
                throw new Error('Failed to create fulfillment: No fulfillment data returned');
            }
            const formattedLineItems = fulfillment.lineItems?.edges?.map((edge) => ({
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
            const trackingNumbers = [];
            const trackingUrls = [];
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
        }
        catch (error) {
            this.logger.error(`Failed to create fulfillment for order ${orderId}:`, error);
            throw error;
        }
    }
    async updateFulfillment(merchantId, fulfillmentId, data) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const fulfillmentInput = {};
            if (data.trackingNumbers && data.trackingNumbers.length > 0) {
                fulfillmentInput['trackingInfo'] = {
                    number: data.trackingNumbers[0],
                    company: data.trackingCompany || '',
                    url: data.trackingUrls && data.trackingUrls.length > 0 ? data.trackingUrls[0] : '',
                };
            }
            const dataAsRecord = data;
            if (dataAsRecord['notifyCustomer'] !== undefined) {
                fulfillmentInput['notifyCustomer'] = dataAsRecord['notifyCustomer'];
            }
            const variables = {
                fulfillmentId,
                fulfillment: fulfillmentInput,
            };
            const result = await this.shopifyClientService.query(shop, accessToken, updateFulfillmentMutation, variables);
            if (result &&
                result.fulfillmentUpdate &&
                result.fulfillmentUpdate.userErrors &&
                result.fulfillmentUpdate.userErrors.length > 0) {
                const errors = result.fulfillmentUpdate.userErrors;
                const errorMessage = errors[0]?.message || 'Unknown error';
                this.logger.error(`Failed to update fulfillment: ${errorMessage}`);
                throw new Error(`Failed to update fulfillment: ${errorMessage}`);
            }
            const fulfillment = result.fulfillmentUpdate.fulfillment;
            if (!fulfillment) {
                throw new Error('Failed to update fulfillment: No fulfillment data returned');
            }
            this.logger.log(`Updated fulfillment ${fulfillmentId}`);
            const trackingNumbers = [];
            const trackingUrls = [];
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
                status: fulfillment.status,
                createdAt: fulfillment.createdAt,
                updatedAt: fulfillment.updatedAt || fulfillment.createdAt,
                trackingCompany,
                trackingNumbers,
                trackingUrls,
                orderId: data.orderId || '',
                lineItems: data.lineItems || [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to update fulfillment ${fulfillmentId}:`, error);
            throw error;
        }
    }
    async cancelFulfillment(merchantId, fulfillmentId) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const result = await this.shopifyClientService.query(shop, accessToken, cancelFulfillmentMutation, variables);
            if (result &&
                result.fulfillmentCancel &&
                result.fulfillmentCancel.userErrors &&
                result.fulfillmentCancel.userErrors.length > 0) {
                const errors = result.fulfillmentCancel.userErrors;
                const errorMessage = errors[0]?.message || 'Unknown error';
                this.logger.error(`Failed to cancel fulfillment: ${errorMessage}`);
                throw new Error(`Failed to cancel fulfillment: ${errorMessage}`);
            }
            this.logger.log(`Cancelled fulfillment ${fulfillmentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cancel fulfillment ${fulfillmentId}:`, error);
            throw error;
        }
    }
    async createFulfillmentHold(merchantId, fulfillmentOrderId, reason, reasonNotes, releaseDate, notifyCustomer = false, metadata) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const result = await this.shopifyClientService.query(shop, accessToken, createFulfillmentHoldMutation, variables);
            if (result &&
                result.fulfillmentOrderHold &&
                result.fulfillmentOrderHold.userErrors &&
                result.fulfillmentOrderHold.userErrors.length > 0) {
                const errors = result.fulfillmentOrderHold.userErrors;
                const errorMessage = errors[0]?.message || 'Unknown error';
                this.logger.error(`Failed to create fulfillment hold: ${errorMessage}`);
                throw new Error(`Failed to create fulfillment hold: ${errorMessage}`);
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to create fulfillment hold for fulfillment order ${fulfillmentOrderId}:`, error);
            throw error;
        }
    }
    async releaseFulfillmentHold(merchantId, fulfillmentOrderId, holdId, notes, metadata) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const result = await this.shopifyClientService.query(shop, accessToken, releaseFulfillmentHoldMutation, variables);
            if (result &&
                result.fulfillmentOrderHoldRelease &&
                result.fulfillmentOrderHoldRelease.userErrors &&
                result.fulfillmentOrderHoldRelease.userErrors.length > 0) {
                const errors = result.fulfillmentOrderHoldRelease.userErrors;
                const errorMessage = errors[0]?.message || 'Unknown error';
                this.logger.error(`Failed to release fulfillment hold: ${errorMessage}`);
                throw new Error(`Failed to release fulfillment hold: ${errorMessage}`);
            }
            this.logger.log(`Released fulfillment hold ${holdId} for fulfillment order ${fulfillmentOrderId}`);
        }
        catch (error) {
            this.logger.error(`Failed to release fulfillment hold ${holdId} for fulfillment order ${fulfillmentOrderId}:`, error);
            throw error;
        }
    }
    async getFulfillmentHolds(merchantId, fulfillmentOrderId, includeReleased = false) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
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
            const result = await this.shopifyClientService.query(shop, accessToken, getFulfillmentHoldsQuery, variables);
            if (!result || !result.node || !result.node.fulfillmentHolds) {
                throw new Error('Failed to get fulfillment holds: Invalid response structure');
            }
            const holds = result.node.fulfillmentHolds
                .map((hold) => {
                if (!hold)
                    return null;
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
            this.logger.log(`Retrieved ${holds.length} fulfillment holds for fulfillment order ${fulfillmentOrderId}`);
            return holds;
        }
        catch (error) {
            this.logger.error(`Failed to get fulfillment holds for fulfillment order ${fulfillmentOrderId}:`, error);
            throw error;
        }
    }
    async registerAsFulfillmentService(merchantId, options) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
            const endpoint = `/admin/fulfillment_services.json`;
            const baseUrl = this.config.auth.callbackUrl.split('/auth/')[0];
            const callbackPath = options?.callbackPath || '/api/integrations/shopify/fulfillment/callback';
            const data = {
                fulfillment_service: {
                    name: options?.name || 'Avnu Marketplace Fulfillment',
                    callback_url: `${baseUrl}${callbackPath}`,
                    inventory_management: options?.inventoryManagement !== undefined ? options.inventoryManagement : true,
                    tracking_support: options?.trackingSupport !== undefined ? options.trackingSupport : true,
                    requires_shipping_method: options?.requiresShippingMethod !== undefined ? options.requiresShippingMethod : true,
                    format: 'json',
                },
            };
            const result = await this.shopifyClientService.request(shop, accessToken, endpoint, 'POST', data);
            this.logger.log(`Registered as fulfillment service for merchant ${merchantId}`);
            return result['fulfillment_service'];
        }
        catch (error) {
            this.logger.error(`Failed to register as fulfillment service for merchant ${merchantId}:`, error);
            throw error;
        }
    }
    async createMultipleFulfillmentHolds(merchantId, fulfillmentOrderId, holds) {
        try {
            const results = [];
            for (const hold of holds) {
                try {
                    const createdHold = await this.createFulfillmentHold(merchantId, fulfillmentOrderId, hold.reason, hold.reasonNotes, hold.releaseDate);
                    results.push(createdHold);
                }
                catch (error) {
                    this.logger.error(`Failed to create one of multiple fulfillment holds: ${error.message || error}`);
                }
            }
            this.logger.log(`Created ${results.length}/${holds.length} fulfillment holds for order ${fulfillmentOrderId}`);
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to create multiple fulfillment holds: ${error.message || error}`);
            throw error;
        }
    }
    async deleteFulfillmentService(merchantId, fulfillmentServiceId) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
            const endpoint = `/admin/fulfillment_services/${fulfillmentServiceId}.json`;
            await this.shopifyClientService.request(shop, accessToken, endpoint, 'DELETE');
            this.logger.log(`Deleted fulfillment service ${fulfillmentServiceId} for merchant ${merchantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete fulfillment service for merchant ${merchantId}:`, error);
            return false;
        }
    }
    async getFulfillmentServices(merchantId) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
            const endpoint = `/admin/fulfillment_services.json`;
            const result = await this.shopifyClientService.request(shop, accessToken, endpoint, 'GET');
            this.logger.log(`Retrieved ${result['fulfillment_services']?.length || 0} fulfillment services for merchant ${merchantId}`);
            return result['fulfillment_services'] || [];
        }
        catch (error) {
            this.logger.error(`Failed to get fulfillment services for merchant ${merchantId}:`, error);
            return [];
        }
    }
    async updateFulfillmentService(merchantId, fulfillmentServiceId, updateData) {
        try {
            const connection = await this.getShopifyConnection(merchantId);
            const shop = connection.platformStoreName;
            const accessToken = connection.accessToken;
            const endpoint = `/admin/fulfillment_services/${fulfillmentServiceId}.json`;
            const data = { fulfillment_service: {} };
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
            const result = await this.shopifyClientService.request(shop, accessToken, endpoint, 'PUT', data);
            this.logger.log(`Updated fulfillment service ${fulfillmentServiceId} for merchant ${merchantId}`);
            return result['fulfillment_service'];
        }
        catch (error) {
            this.logger.error(`Failed to update fulfillment service for merchant ${merchantId}:`, error);
            throw error;
        }
    }
};
exports.ShopifyFulfillmentService = ShopifyFulfillmentService;
ShopifyFulfillmentService.HOLD_REASONS = {
    AWAITING_INVENTORY: 'INVENTORY',
    AWAITING_PAYMENT: 'PAYMENT',
    AWAITING_RISK_ASSESSMENT: 'RISK_ASSESSMENT',
    AWAITING_THIRD_PARTY_FULFILLER: 'THIRD_PARTY_FULFILLER',
    AWAITING_PROCESSING: 'PROCESSING',
    AWAITING_PICKUP: 'PICKUP',
    OTHER: 'OTHER',
};
exports.ShopifyFulfillmentService = ShopifyFulfillmentService = ShopifyFulfillmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __param(1, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __param(2, (0, common_1.Inject)(shopify_config_2.SHOPIFY_CONSTANTS.INJECTION_TOKENS.SHOPIFY_CLIENT_SERVICE)),
    __metadata("design:paramtypes", [typeorm_2.Repository, void 0, Object])
], ShopifyFulfillmentService);
//# sourceMappingURL=shopify-fulfillment.service.js.map