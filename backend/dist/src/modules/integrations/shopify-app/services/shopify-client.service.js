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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyClientService = void 0;
const common_1 = require("@nestjs/common");
const shopify_config_1 = require("../../../common/config/shopify-config");
const shopify_version_manager_service_1 = require("./shopify-version-manager.service");
const connection_pool_manager_1 = require("../utils/connection-pool-manager");
const circuit_breaker_1 = require("../utils/circuit-breaker");
const structured_logger_1 = require("../utils/structured-logger");
const cache_manager_1 = require("../utils/cache-manager");
let ShopifyClientService = class ShopifyClientService {
    constructor(config, versionManager, connectionPool, circuitBreaker, cacheManager, logger) {
        this.config = config;
        this.versionManager = versionManager;
        this.connectionPool = connectionPool;
        this.circuitBreaker = circuitBreaker;
        this.cacheManager = cacheManager;
        this.logger = logger;
        this.logger.log('ShopifyClientService initialized with scalability enhancements');
    }
    async query(shop, accessToken, query, variables) {
        const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery';
        const circuitKey = `shop:${shop}:graphql:${queryName}`;
        this.logger.logApiRequest('graphql', shop, {
            queryName,
            operationType: query.includes('mutation') ? 'mutation' : 'query',
        });
        const priorities = this.connectionPool.getPriorities();
        const priority = query.includes('mutation') ? priorities.HIGH : priorities.MEDIUM;
        try {
            if (!query.includes('mutation')) {
                const cacheResult = await this.cacheManager.getOrFetch({
                    namespace: 'graphql',
                    merchantId: shop,
                    resource: queryName,
                    id: JSON.stringify(variables || {}),
                }, async () => {
                    return this.executeGraphQLQuery(shop, accessToken, query, variables, circuitKey, priority);
                }, { ttl: 300 });
                return cacheResult;
            }
            return await this.executeGraphQLQuery(shop, accessToken, query, variables, circuitKey, priority);
        }
        catch (error) {
            this.logger.error(`GraphQL query failed: ${queryName}`, {
                shopDomain: shop,
                errorMessage: error.message,
                errorCode: error.code,
                queryName,
            });
            throw error;
        }
    }
    async executeGraphQLQuery(shop, accessToken, query, variables, circuitKey, priority) {
        return this.circuitBreaker.executeWithCircuitBreaker(circuitKey, async () => {
            const config = {
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
            const startTime = Date.now();
            const response = await this.connectionPool.executeRequest(shop, config, priority);
            const duration = Date.now() - startTime;
            this.logger.logApiResponse('graphql', shop, response.status, duration, {
                queryName: query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery',
            });
            if (response.data && response.data.errors) {
                const errors = response.data.errors;
                this.handleGraphQLErrors(errors, shop, query);
                throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`);
            }
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
    async request(shop, accessToken, endpoint, method = 'GET', data) {
        const normalizedEndpoint = endpoint.split('?')[0].replace(/\d+/g, ':id');
        const circuitKey = `shop:${shop}:rest:${method}:${normalizedEndpoint}`;
        this.logger.logApiRequest(`rest:${method}`, shop, { endpoint });
        const priorities = this.connectionPool.getPriorities();
        let priority = priorities.MEDIUM;
        if (endpoint.includes('/orders') || endpoint.includes('/inventory')) {
            priority = priorities.HIGH;
        }
        else if (endpoint.includes('/checkouts')) {
            priority = priorities.CRITICAL;
        }
        else if (endpoint.includes('/reports') || endpoint.includes('/analytics')) {
            priority = priorities.LOW;
        }
        try {
            if (method === 'GET') {
                const cacheResult = await this.cacheManager.getOrFetch({
                    namespace: 'rest',
                    merchantId: shop,
                    resource: normalizedEndpoint,
                    id: JSON.stringify(data || {}),
                }, async () => {
                    return this.executeRestRequest(shop, accessToken, endpoint, method, data, circuitKey, priority);
                }, {
                    ttl: 300,
                    ...(endpoint.includes('/inventory') ? { ttl: 60 } : {}),
                    ...(endpoint.includes('/orders/') ? { ttl: 30 } : {}),
                });
                return cacheResult;
            }
            return await this.executeRestRequest(shop, accessToken, endpoint, method, data, circuitKey, priority);
        }
        catch (error) {
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
    async executeRestRequest(shop, accessToken, endpoint, method, data, circuitKey, priority) {
        return this.circuitBreaker.executeWithCircuitBreaker(circuitKey, async () => {
            const config = {
                method,
                url: this.versionManager.getVersionedEndpoint(shop, endpoint),
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                data: method !== 'GET' ? data : undefined,
                params: method === 'GET' ? data : undefined,
            };
            const startTime = Date.now();
            const response = await this.connectionPool.executeRequest(shop, config, priority);
            const duration = Date.now() - startTime;
            this.logger.logApiResponse(`rest:${method}`, shop, response.status, duration, {
                endpoint,
            });
            if (method !== 'GET') {
                const resourceType = endpoint.split('/')[1];
                if (resourceType) {
                    this.cacheManager.invalidateResource(shop, resourceType);
                }
            }
            return response.data;
        });
    }
    async getShopInfo(shop, accessToken) {
        const shopInfo = await this.query(shop, accessToken, `
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
      `);
        return shopInfo && shopInfo['shop'] ? shopInfo['shop'] : null;
    }
    extractUserErrors(responseData) {
        if (!responseData || !responseData.data) {
            return null;
        }
        const mutationName = Object.keys(responseData.data)[0];
        if (!mutationName) {
            return null;
        }
        const mutationResponse = responseData.data[mutationName];
        if (!mutationResponse) {
            return null;
        }
        return mutationResponse.userErrors || null;
    }
    handleGraphQLErrors(errors, shop, query) {
        this.logger.error(`[Shopify GraphQL] Errors for shop ${shop}:`, {
            errors: errors.map(e => ({
                message: e.message,
                path: e.path,
                extensions: e.extensions,
            })),
            query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        });
    }
    handleUserErrors(errors, shop, query) {
        this.logger.warn(`[Shopify GraphQL] User errors for shop ${shop}:`, {
            errors: errors.map(e => ({
                message: e.message,
                field: e.field,
                code: e.code,
            })),
            query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        });
    }
    handleApiError(error, shop, endpoint) {
        const maskedShop = shop ? this.maskShopDomain(shop) : 'unknown-shop';
        const apiVersion = this.versionManager.getApiVersion();
        if (error.response && typeof error.response === 'object') {
            const status = error.response.status || 'unknown';
            this.logger.error(`[Shopify API] Error ${status} for ${maskedShop}:`, {
                status: status,
                statusText: error.response.statusText || 'Unknown Error',
                endpoint: endpoint || 'unknown-endpoint',
                apiVersion: apiVersion,
                data: error.response.data || {},
            });
            if (status === 400 && error.response.data?.errors?.includes('version')) {
                this.logger.error(`API version ${apiVersion} might be causing compatibility issues. Consider updating version.`);
            }
        }
        else if (error.request) {
            this.logger.error(`[Shopify API] No response from ${maskedShop}:`, {
                endpoint: endpoint || 'unknown-endpoint',
                apiVersion: apiVersion,
                message: error.message,
            });
        }
        else {
            this.logger.error(`[Shopify API] Request setup error for ${maskedShop}:`, {
                endpoint: endpoint || 'unknown-endpoint',
                apiVersion: apiVersion,
                message: error.message,
            });
        }
    }
    maskShopDomain(shop) {
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
};
exports.ShopifyClientService = ShopifyClientService;
exports.ShopifyClientService = ShopifyClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [void 0, shopify_version_manager_service_1.ShopifyVersionManagerService,
        connection_pool_manager_1.ShopifyConnectionPoolManager,
        circuit_breaker_1.ShopifyCircuitBreaker,
        cache_manager_1.ShopifyCacheManager,
        structured_logger_1.ShopifyStructuredLogger])
], ShopifyClientService);
//# sourceMappingURL=shopify-client.service.js.map