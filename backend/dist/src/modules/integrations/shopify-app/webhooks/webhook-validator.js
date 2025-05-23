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
var WebhookValidator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookValidator = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const shopify_config_1 = require("../../../common/config/shopify-config");
let WebhookValidator = WebhookValidator_1 = class WebhookValidator {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(WebhookValidator_1.name);
    }
    verifyWebhookSignature(rawBody, headers) {
        try {
            const hmacHeader = this.getHeader(headers, 'X-Shopify-Hmac-Sha256') ||
                this.getHeader(headers, 'Shopify-Hmac-Sha256');
            if (!hmacHeader) {
                this.logger.warn('Missing HMAC signature in webhook headers');
                return false;
            }
            const shopDomain = this.getHeader(headers, 'X-Shopify-Shop-Domain') ||
                this.getHeader(headers, 'Shopify-Shop-Domain');
            if (!shopDomain || !this.isValidShopDomain(shopDomain)) {
                this.logger.warn(`Invalid shop domain in webhook headers: ${shopDomain}`);
                return false;
            }
            const timestamp = this.getHeader(headers, 'X-Shopify-Hmac-Timestamp') ||
                this.getHeader(headers, 'Shopify-Hmac-Timestamp');
            if (timestamp) {
                const webhookTime = new Date(timestamp);
                const currentTime = new Date();
                const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
                if (webhookTime < fiveMinutesAgo) {
                    this.logger.warn('Webhook timestamp is too old, possible replay attack');
                    return false;
                }
            }
            const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET ||
                process.env.SHOPIFY_API_SECRET ||
                '';
            if (!webhookSecret) {
                this.logger.error('Webhook secret is not configured!');
                return false;
            }
            const calculatedHmac = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('base64');
            return this.safeCompare(calculatedHmac, hmacHeader);
        }
        catch (error) {
            this.logger.error('Error verifying webhook signature:', error);
            return false;
        }
    }
    getHeader(headers, key) {
        const lowerCaseKey = key.toLowerCase();
        for (const [headerKey, headerValue] of Object.entries(headers)) {
            if (headerKey.toLowerCase() === lowerCaseKey) {
                return headerValue;
            }
        }
        return undefined;
    }
    isValidShopDomain(shop) {
        const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
        return shopRegex.test(shop);
    }
    safeCompare(a, b) {
        try {
            return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
        }
        catch (error) {
            const aBuffer = Buffer.from(a);
            const bBuffer = Buffer.from(b);
            const len = Math.max(aBuffer.length, bBuffer.length);
            const aPadded = Buffer.alloc(len, 0);
            const bPadded = Buffer.alloc(len, 0);
            aBuffer.copy(aPadded);
            bBuffer.copy(bPadded);
            try {
                return crypto.timingSafeEqual(aPadded, bPadded);
            }
            catch (error) {
                this.logger.error('Error in timing-safe comparison:', error);
                return a === b;
            }
        }
    }
    validateHmac(hmac, body, secret) {
        try {
            if (!hmac || !body || !secret) {
                return false;
            }
            const calculatedHmac = crypto.createHmac('sha256', secret).update(body).digest('base64');
            return this.safeCompare(calculatedHmac, hmac);
        }
        catch (error) {
            this.logger.error(`Error validating HMAC: ${error.message}`);
            return false;
        }
    }
};
exports.WebhookValidator = WebhookValidator;
exports.WebhookValidator = WebhookValidator = WebhookValidator_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(shopify_config_1.shopifyConfig.KEY)),
    __metadata("design:paramtypes", [void 0])
], WebhookValidator);
//# sourceMappingURL=webhook-validator.js.map