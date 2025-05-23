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
exports.BrandsPrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let BrandsPrismaService = class BrandsPrismaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        const { skip = 0, take = 10, includeProducts = false } = options || {};
        return this.prisma.brand.findMany({
            skip,
            take,
            include: {
                products: includeProducts,
            },
        });
    }
    async findOne(id, includeProducts = false) {
        return this.prisma.brand.findUnique({
            where: { id },
            include: {
                products: includeProducts,
            },
        });
    }
    async create(data) {
        return this.prisma.brand.create({
            data: {
                name: data.name,
            },
        });
    }
    async update(id, data) {
        return this.prisma.brand.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.brand.delete({
            where: { id },
        });
    }
    async searchBrands(query) {
        return this.prisma.brand.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
            },
            include: {
                products: true,
            },
        });
    }
    async getBrandWithProducts(id) {
        return this.prisma.brand.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        variants: true,
                    },
                },
            },
        });
    }
};
exports.BrandsPrismaService = BrandsPrismaService;
exports.BrandsPrismaService = BrandsPrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], BrandsPrismaService);
//# sourceMappingURL=brands-prisma.service.js.map