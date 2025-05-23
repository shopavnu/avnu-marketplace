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
exports.MerchantAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@nestjs/core");
const user_entity_1 = require("../../users/entities/user.entity");
const public_decorator_1 = require("../decorators/public.decorator");
const passport_1 = require("@nestjs/passport");
let MerchantAuthGuard = class MerchantAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        try {
            const isAuthenticated = await super.canActivate(context);
            if (!isAuthenticated) {
                return false;
            }
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const request = this.getRequest(context);
        const user = request.user;
        if (!user) {
            return false;
        }
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return true;
        }
        if (user.role !== user_entity_1.UserRole.MERCHANT) {
            throw new common_1.ForbiddenException('You must be a merchant to access this resource');
        }
        if (!user.merchantId) {
            throw new common_1.ForbiddenException('No merchant account associated with this user');
        }
        if (context.getType().toString() === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            const args = gqlContext.getArgs();
            if (args.merchantId && args.merchantId !== user.merchantId) {
                throw new common_1.ForbiddenException('You do not have access to this merchant account');
            }
        }
        return true;
    }
    getRequest(context) {
        if (context.getType().toString() === 'http') {
            return context.switchToHttp().getRequest();
        }
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        return gqlContext.getContext().req;
    }
};
exports.MerchantAuthGuard = MerchantAuthGuard;
exports.MerchantAuthGuard = MerchantAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], MerchantAuthGuard);
//# sourceMappingURL=merchant-auth.guard.js.map