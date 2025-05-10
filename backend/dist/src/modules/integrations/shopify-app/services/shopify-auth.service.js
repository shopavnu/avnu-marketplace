"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ShopifyAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../enums/platform-type.enum");
const shopify_config_1 = require("../../../common/config/shopify-config");
const crypto = __importStar(require("crypto"));
let ShopifyAuthService = ShopifyAuthService_1 = class ShopifyAuthService {
    constructor(merchantPlatformConnectionRepository, config) {
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.config = config;
        this.logger = new common_1.Logger(ShopifyAuthService_1.name);
    }
    generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    async getAuthUrl(shop) {
        const state = this.generateNonce();
        this.logger.log(`Generated state ${state} for shop ${shop}`);
        const url = new URL(`https://${shop}/admin/oauth/authorize`);
        url.searchParams.append('client_id', this.config.api.key || '');
        url.searchParams.append('scope', this.config.api.scopes);
        url.searchParams.append('redirect_uri', this.config.auth.callbackUrl);
        url.searchParams.append('state', state);
        return url.toString();
    }
    async handleCallback(shop, code, state) {
        try {
            this.logger.log(`Processing callback for shop ${shop} with state ${state}`);
            const accessToken = await this.exchangeCodeForToken(shop, code);
            if (!accessToken) {
                this.logger.error(`Failed to get access token for shop ${shop}`);
                return false;
            }
            await this.saveShopifyConnection(shop, accessToken);
            return true;
        }
        catch (error) {
            this.logger.error(`Error in Shopify callback: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
    async exchangeCodeForToken(shop, code) {
        try {
            this.logger.log(`Exchanging code for access token for shop ${shop}`);
            const mockAccessToken = `mock_token_${Date.now()}`;
            return mockAccessToken;
        }
        catch (error) {
            this.logger.error(`Error exchanging code for token: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    async saveShopifyConnection(shop, accessToken) {
        try {
            let connection = await this.merchantPlatformConnectionRepository.findOne({
                where: {
                    platformStoreName: shop,
                    platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                },
            });
            const now = new Date();
            if (connection) {
                connection.accessToken = accessToken;
                connection.isActive = true;
                connection.lastSyncedAt = now;
                connection.updatedAt = now;
            }
            else {
                connection = new merchant_platform_connection_entity_1.MerchantPlatformConnection();
                connection.merchantId = 'default-merchant';
                connection.platformType = platform_type_enum_1.PlatformType.SHOPIFY;
                connection.platformStoreName = shop;
                connection.platformStoreUrl = `https://${shop}`;
                connection.accessToken = accessToken;
                connection.isActive = true;
                connection.lastSyncedAt = now;
                connection.createdAt = now;
                connection.updatedAt = now;
            }
            return await this.merchantPlatformConnectionRepository.save(connection);
        }
        catch (error) {
            this.logger.error(`Error saving Shopify connection: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
};
exports.ShopifyAuthService = ShopifyAuthService;
exports.ShopifyAuthService = ShopifyAuthService = ShopifyAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __param(1, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [typeorm_2.Repository, void 0])
], ShopifyAuthService);
//# sourceMappingURL=shopify-auth.service.js.map