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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyClientExtensions = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const shopify_client_service_1 = require("./shopify-client.service");
let ShopifyClientExtensions = class ShopifyClientExtensions {
    constructor(shopifyClientService) {
        this.shopifyClientService = shopifyClientService;
    }
    async isShopifyReachable() {
        try {
            const response = await axios_1.default.get('https://status.shopify.com/api/v2/status.json', {
                timeout: 5000,
            });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
};
exports.ShopifyClientExtensions = ShopifyClientExtensions;
exports.ShopifyClientExtensions = ShopifyClientExtensions = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shopify_client_service_1.ShopifyClientService])
], ShopifyClientExtensions);
//# sourceMappingURL=shopify-client-extensions.js.map