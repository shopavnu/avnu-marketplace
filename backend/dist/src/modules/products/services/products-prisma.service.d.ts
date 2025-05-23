import { PrismaClient } from '@prisma/client';
export declare class ProductsPrismaService {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(options?: {
        skip?: number;
        take?: number;
        includeVariants?: boolean;
        includeBrand?: boolean;
    }): Promise<({
        brand: {
            id: string;
            description: string | null;
            name: string;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            createdAt: Date;
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    })[]>;
    findOne(id: string): Promise<{
        brand: {
            id: string;
            description: string | null;
            name: string;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            createdAt: Date;
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    }>;
    create(data: {
        title: string;
        description: string;
        price: number;
        imageUrl: string;
        brandId: string;
        variants?: {
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    }): Promise<{
        brand: {
            id: string;
            description: string | null;
            name: string;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            createdAt: Date;
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    }>;
    update(id: string, data: {
        title?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        brandId?: string;
    }): Promise<{
        brand: {
            id: string;
            description: string | null;
            name: string;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            createdAt: Date;
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    }>;
    searchProducts(query: string): Promise<({
        brand: {
            id: string;
            description: string | null;
            name: string;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            createdAt: Date;
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    })[]>;
    getProductsByBrand(brandId: string): Promise<({
        variants: {
            id: string;
            productId: string;
            optionName: string;
            optionValue: string;
            stock: number;
        }[];
    } & {
        id: string;
        brandId: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
    })[]>;
}
