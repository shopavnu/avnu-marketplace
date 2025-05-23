"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsPrismaModule = void 0;
const common_1 = require("@nestjs/common");
const brands_prisma_service_1 = require("./services/brands-prisma.service");
const brands_prisma_resolver_1 = require("./resolvers/brands-prisma.resolver");
const brands_controller_1 = require("./controllers/brands.controller");
let BrandsPrismaModule = class BrandsPrismaModule {
};
exports.BrandsPrismaModule = BrandsPrismaModule;
exports.BrandsPrismaModule = BrandsPrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [brands_prisma_service_1.BrandsPrismaService, brands_prisma_resolver_1.BrandsPrismaResolver],
        controllers: [brands_controller_1.BrandsController],
        exports: [brands_prisma_service_1.BrandsPrismaService],
    })
], BrandsPrismaModule);
//# sourceMappingURL=brands-prisma.module.js.map