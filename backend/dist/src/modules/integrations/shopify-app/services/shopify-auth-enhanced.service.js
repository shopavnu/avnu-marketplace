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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ShopifyAuthEnhancedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAuthEnhancedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const shopify_config_1 = require("../../../common/config/shopify-config");
const merchant_platform_connection_entity_1 = require("../../entities/merchant-platform-connection.entity");
const platform_type_enum_1 = require("../../enums/platform-type.enum");
let ShopifyAuthEnhancedService = ShopifyAuthEnhancedService_1 = class ShopifyAuthEnhancedService {
    constructor(config, merchantPlatformConnectionRepository) {
        this.config = config;
        this.merchantPlatformConnectionRepository = merchantPlatformConnectionRepository;
        this.logger = new common_1.Logger(ShopifyAuthEnhancedService_1.name);
        const rawKey = process.env['ENCRYPTION_KEY'] || this.config.auth?.encryptionKey || '';
        if (!rawKey) {
            this.logger.warn('No encryption key provided - using fallback. THIS IS NOT SECURE FOR PRODUCTION!');
            this.encryptionKey = crypto.randomBytes(32);
        }
        else {
            this.encryptionKey = crypto.createHash('sha256').update(String(rawKey)).digest();
        }
    }
    generateSecureState(baseState) {
        const hmac = crypto.createHmac('sha256', this.config.api.secret || '');
        hmac.update(baseState);
        const hash = hmac.digest('hex');
        return {
            secureState: baseState,
            hash,
        };
    }
    isValidShopDomain(shop) {
        const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
        return shopRegex.test(shop);
    }
    verifyRequiredScopes(grantedScopes) {
        const scopesArray = grantedScopes.split(',').map(scope => scope.trim());
        const requiredScopes = [
            'read_products',
            'write_products',
            'read_orders',
            'write_orders',
            'read_fulfillments',
            'write_fulfillments',
            'read_merchant_managed_fulfillment_orders',
            'write_merchant_managed_fulfillment_orders',
        ];
        const missingScopes = requiredScopes.filter(scope => !scopesArray.includes(scope));
        if (missingScopes.length > 0) {
            this.logger.warn(`Missing required scopes: ${missingScopes.join(', ')}`);
            throw new Error(`Missing required Shopify API scopes: ${missingScopes.join(', ')}`);
        }
    }
    async verifyAccessToken(shop, accessToken) {
        try {
            const response = await axios_1.default.get(`https://${shop}/admin/api/${this.config.api.version}/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Failed to verify access token: Invalid response format');
            }
            const data = response.data;
            if (!data['shop']) {
                throw new Error('Failed to verify access token: Missing shop data');
            }
            const shopData = data;
            this.logger.log(`Successfully verified access token for shop: ${shop}`);
        }
        catch (error) {
            this.logger.error('Access token verification failed', error);
            throw new Error('Failed to verify access token with Shopify');
        }
    }
    generateAuthUrl(shop) {
        const state = this.generateNonce();
        const { secureState, hash } = this.generateSecureState(state);
        this.logger.log(`Generated OAuth state ${secureState} for shop ${shop} with hash ${hash}`);
        const url = new URL(`https://${shop}/admin/oauth/authorize`);
        url.searchParams.append('client_id', this.config.api.key || '');
        url.searchParams.append('scope', this.config.api.scopes || '');
        const redirectUri = `${this.config.auth.callbackUrl}`;
        url.searchParams.append('redirect_uri', redirectUri);
        url.searchParams.append('state', secureState);
        url.searchParams.append('grant_options[]', 'per-user');
        return url.toString();
    }
    async handleCallback(shop, code, state) {
        this.logger.log(`Processing OAuth callback for shop ${shop} with state ${state}`);
        try {
            if (!this.isValidShopDomain(shop)) {
                throw new common_1.UnauthorizedException('Invalid shop domain');
            }
            const response = await axios_1.default.post(`https://${shop}/admin/oauth/access_token`, {
                client_id: this.config.api.key,
                client_secret: this.config.api.secret,
                code: code,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': `Avnu-Marketplace/${this.config.api.version}`,
                },
            });
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid response from Shopify OAuth endpoint');
            }
            const data = response.data;
            if (!data['access_token']) {
                throw new Error('Missing access_token in OAuth response');
            }
            const responseData = data;
            const accessToken = responseData.access_token;
            const grantedScopes = responseData.scope || this.config.api.scopes;
            this.verifyRequiredScopes(grantedScopes);
            const merchantId = await this.findOrCreateMerchantByShop(shop);
            await this.storeAccessToken(shop, accessToken, merchantId, {
                grantedScopes,
                expiresIn: responseData.expires_in,
                apiVersion: this.config.api.version,
            });
            await this.verifyAccessToken(shop, accessToken);
            return accessToken;
        }
        catch (error) {
            this.logger.error(`OAuth token exchange failed for shop ${shop}`, error);
            throw new common_1.UnauthorizedException('Failed to authenticate with Shopify: ' +
                (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async verifySessionToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }
            try {
                if (!parts[1]) {
                    throw new Error('Invalid token format: missing payload');
                }
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return payload;
            }
            catch (parseError) {
                throw new Error('Invalid token payload');
            }
        }
        catch (error) {
            this.logger.error('Session token verification failed', error);
            throw new common_1.UnauthorizedException('Invalid session token');
        }
    }
    async storeAccessToken(shop, accessToken, merchantId, metadata) {
        try {
            const encryptedToken = this.encrypt(accessToken);
            const connection = await this.merchantPlatformConnectionRepository.findOne({
                where: {
                    merchantId,
                    platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                    platformIdentifier: shop,
                },
            });
            const now = new Date();
            const tokenMetadata = {
                scopes: metadata?.grantedScopes || this.config.api.scopes,
                apiVersion: metadata?.apiVersion || this.config.api.version,
                lastAuthenticated: now.toISOString(),
                encryptionMethod: 'aes-256-gcm',
                tokenRotationRequired: false,
            };
            if (metadata?.expiresIn) {
                const expirationDate = new Date(now.getTime() + metadata.expiresIn * 1000);
                tokenMetadata.expiresAt = expirationDate.toISOString();
            }
            if (connection) {
                await this.merchantPlatformConnectionRepository.update({ id: connection.id }, {
                    accessToken: encryptedToken,
                    updatedAt: now,
                    isActive: true,
                    platformConfig: {
                        shopName: shop,
                        accessToken: encryptedToken,
                    },
                    metadata: {
                        ...connection.metadata,
                        ...tokenMetadata,
                    },
                });
                this.logger.log(`Updated connection and encrypted access token for shop ${shop}`);
            }
            else {
                await this.merchantPlatformConnectionRepository.save({
                    merchantId,
                    platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                    platformIdentifier: shop,
                    accessToken: encryptedToken,
                    isActive: true,
                    platformConfig: {
                        shopName: shop,
                        accessToken: encryptedToken,
                    },
                    metadata: {
                        ...tokenMetadata,
                        installedAt: now.toISOString(),
                        installedApiVersion: this.config.api.version,
                    },
                });
                this.logger.log(`Created new connection and stored encrypted access token for shop ${shop}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to store access token for shop ${shop}`, error);
            throw error;
        }
    }
    async getAccessToken(merchantId) {
        const connection = await this.merchantPlatformConnectionRepository.findOne({
            where: {
                merchantId,
                platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                isActive: true,
            },
        });
        if (!connection) {
            throw new common_1.NotFoundException(`No active Shopify connection found for merchant ${merchantId}`);
        }
        const accessToken = this.decrypt(connection.accessToken);
        return {
            shop: connection.platformIdentifier,
            accessToken,
        };
    }
    async handleUninstall(shop) {
        this.logger.log(`Processing uninstall for shop ${shop}`);
        const connections = await this.merchantPlatformConnectionRepository.find({
            where: {
                platformType: platform_type_enum_1.PlatformType.SHOPIFY,
                platformIdentifier: shop,
            },
        });
        if (connections.length === 0) {
            this.logger.warn(`No connections found for shop ${shop} during uninstall`);
            return;
        }
        for (const connection of connections) {
            await this.merchantPlatformConnectionRepository.update({ id: connection.id }, {
                isActive: false,
                metadata: {
                    ...connection.metadata,
                    uninstalledAt: new Date().toISOString(),
                },
            });
        }
        this.logger.log(`Successfully marked ${connections.length} connections as inactive for shop ${shop}`);
    }
    async findOrCreateMerchantByShop(shop) {
        return `merchant-${shop.split('.')[0]}`;
    }
    generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    encrypt(plaintext) {
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const now = new Date().getTime().toString();
        const context = Buffer.from(now);
        const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv);
        cipher.setAAD(context);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return ({
            iv: iv.toString('hex'),
            authTag,
            context: context.toString('hex'),
            data: encrypted,
            algorithm,
            version: '2',
        }.iv +
            authTag +
            context.toString('hex') +
            encrypted);
    }
    decrypt(ciphertext) {
        const algorithm = 'aes-256-gcm';
        const hasContext = ciphertext.length > 64 + 16;
        const iv = Buffer.from(ciphertext.substring(0, 32), 'hex');
        const authTag = Buffer.from(ciphertext.substring(32, 64), 'hex');
        let encrypted;
        let context;
        if (hasContext) {
            context = Buffer.from(ciphertext.substring(64, 80), 'hex');
            encrypted = ciphertext.substring(80);
        }
        else {
            encrypted = ciphertext.substring(64);
        }
        const decipher = crypto.createDecipheriv(algorithm, this.encryptionKey, iv);
        decipher.setAuthTag(authTag);
        if (context) {
            decipher.setAAD(context);
        }
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.ShopifyAuthEnhancedService = ShopifyAuthEnhancedService;
exports.ShopifyAuthEnhancedService = ShopifyAuthEnhancedService = ShopifyAuthEnhancedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_platform_connection_entity_1.MerchantPlatformConnection)),
    __metadata("design:paramtypes", [void 0, typeorm_2.Repository])
], ShopifyAuthEnhancedService);
//# sourceMappingURL=shopify-auth-enhanced.service.js.map