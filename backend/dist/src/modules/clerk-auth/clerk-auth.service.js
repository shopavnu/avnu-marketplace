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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthService = void 0;
const common_1 = require("@nestjs/common");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const config_1 = require("@nestjs/config");
let ClerkAuthService = class ClerkAuthService {
    constructor(configService) {
        this.configService = configService;
        const secretKey = this.configService.get('CLERK_SECRET_KEY');
        if (!secretKey) {
            throw new Error('CLERK_SECRET_KEY is not defined in the environment variables');
        }
        this.clerk = (0, clerk_sdk_node_1.Clerk)({ secretKey });
        this.verifyToken = this.clerk.verifyToken;
    }
    getClerkMiddleware() {
        return (0, clerk_sdk_node_1.ClerkExpressWithAuth)();
    }
    getRequireAuthMiddleware() {
        return (0, clerk_sdk_node_1.ClerkExpressRequireAuth)();
    }
    async verifySessionToken(token) {
        try {
            const session = await this.verifyToken(token);
            return session;
        }
        catch (error) {
            return null;
        }
    }
    async getUser(userId) {
        return this.clerk.users.getUser(userId);
    }
};
exports.ClerkAuthService = ClerkAuthService;
exports.ClerkAuthService = ClerkAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ClerkAuthService);
//# sourceMappingURL=clerk-auth.service.js.map