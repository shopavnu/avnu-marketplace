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
exports.ProductsPrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ProductsPrismaService = class ProductsPrismaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        const { skip = 0, take = 10, includeVariants = true, includeBrand = true } = options || {};
        return this.prisma.product.findMany({
            skip,
            take,
            include: {
                variants: includeVariants,
                brand: includeBrand,
            },
        });
    }
    async findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
                variants: true,
            },
        });
    }
    async create(data) {
        return this.prisma.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                imageUrl: data.imageUrl,
                brandId: data.brandId,
                variants: data.variants
                    ? {
                        create: data.variants.map(variant => ({
                            optionName: variant.optionName,
                            optionValue: variant.optionValue,
                            stock: variant.stock,
                        })),
                    }
                    : undefined,
            },
            include: {
                brand: true,
                variants: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
            include: {
                brand: true,
                variants: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
    async searchProducts(query) {
        return this.prisma.product.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                brand: true,
                variants: true,
            },
        });
    }
    async getProductsByBrand(brandId) {
        return this.prisma.product.findMany({
            where: { brandId },
            include: {
                variants: true,
            },
        });
    }
};
exports.ProductsPrismaService = ProductsPrismaService;
exports.ProductsPrismaService = ProductsPrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ProductsPrismaService);
//# sourceMappingURL=products-prisma.service.js.map