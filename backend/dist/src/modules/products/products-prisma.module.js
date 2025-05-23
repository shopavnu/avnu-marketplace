"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsPrismaModule = void 0;
const common_1 = require("@nestjs/common");
const products_prisma_service_1 = require("./services/products-prisma.service");
const products_prisma_resolver_1 = require("./resolvers/products-prisma.resolver");
const products_controller_1 = require("./controllers/products.controller");
let ProductsPrismaModule = class ProductsPrismaModule {
};
exports.ProductsPrismaModule = ProductsPrismaModule;
exports.ProductsPrismaModule = ProductsPrismaModule = __decorate([
    (0, common_1.Module)({
        providers: [products_prisma_service_1.ProductsPrismaService, products_prisma_resolver_1.ProductsPrismaResolver],
        controllers: [products_controller_1.ProductsController],
        exports: [products_prisma_service_1.ProductsPrismaService],
    })
], ProductsPrismaModule);
//# sourceMappingURL=products-prisma.module.js.map