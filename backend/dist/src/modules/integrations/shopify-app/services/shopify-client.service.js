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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ShopifyClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const shopify_config_1 = require("../../../common/config/shopify-config");
let ShopifyClientService = ShopifyClientService_1 = class ShopifyClientService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(ShopifyClientService_1.name);
        this.restClient = axios_1.default.create({
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 10000,
        });
        if (this.config.monitoring.logApiCalls) {
            this.restClient.interceptors.request.use((request) => {
                this.logger.debug(`[Shopify API Request] ${request.method?.toUpperCase()} ${request.url}`);
                return request;
            });
        }
        this.restClient.interceptors.response.use((response) => response, async (error) => {
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers && error.response.headers['retry-after']
                    ? parseInt(error.response.headers['retry-after'], 10) * 1000
                    : 1000;
                this.logger.warn(`[Shopify API] Rate limited, retrying after ${retryAfter}ms`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                if (error.config) {
                    return this.restClient(error.config);
                }
            }
            this.handleApiError(error);
            throw error;
        });
    }
    async query(shop, accessToken, query, variables) {
        try {
            if (this.config.monitoring.logApiCalls) {
                const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'AnonymousQuery';
                this.logger.debug(`[Shopify GraphQL] ${queryName} for shop ${shop}`);
            }
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
            return response.data && response.data.data ? response.data.data : {};
        }
        catch (error) {
            this.handleApiError(error, shop, query);
            throw error;
        }
    }
    async request(shop, accessToken, endpoint, method = 'GET', data) {
        try {
            if (!endpoint.startsWith('/')) {
                endpoint = `/${endpoint}`;
            }
            const config = {
                method: method,
                url: `https://${shop}/admin/api/${this.config.api.version}${endpoint}`,
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
            };
            if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
                config.data = data;
            }
            if (method.toUpperCase() === 'GET' && data) {
                config.params = data;
            }
            const response = await this.restClient(config);
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, shop, endpoint);
            throw error;
        }
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
        if (error.response && typeof error.response === 'object') {
            const status = error.response.status || 'unknown';
            this.logger.error(`[Shopify API] Error ${status} for ${maskedShop}:`, {
                status: status,
                statusText: error.response.statusText || 'Unknown Error',
                endpoint: endpoint || 'unknown-endpoint',
                data: error.response.data || {},
            });
        }
        else if (error.request) {
            this.logger.error(`[Shopify API] No response from ${maskedShop}:`, {
                endpoint: endpoint || 'unknown-endpoint',
                message: error.message,
            });
        }
        else {
            this.logger.error(`[Shopify API] Request setup error for ${maskedShop}:`, {
                endpoint: endpoint || 'unknown-endpoint',
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
exports.ShopifyClientService = ShopifyClientService = ShopifyClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [void 0])
], ShopifyClientService);
//# sourceMappingURL=shopify-client.service.js.map