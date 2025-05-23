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
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const clerk_auth_service_1 = require("../clerk-auth.service");
const core_1 = require("@nestjs/core");
const IS_PUBLIC_KEY = 'isPublic';
let ClerkAuthGuard = class ClerkAuthGuard {
    constructor(clerkAuthService, reflector) {
        this.clerkAuthService = clerkAuthService;
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        if (request.auth?.userId) {
            return true;
        }
        if (context.getType() === 'graphql') {
            const gqlContext = context.getArgByIndex(2);
            if (gqlContext?.auth?.userId) {
                return true;
            }
        }
        throw new common_1.UnauthorizedException('Authentication required');
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clerk_auth_service_1.ClerkAuthService,
        core_1.Reflector])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map