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
            name: string;
            createdAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
        price: number;
        imageUrl: string;
    })[]>;
    findOne(id: string): Promise<{
        brand: {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
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
            name: string;
            createdAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
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
            name: string;
            createdAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
        price: number;
        imageUrl: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string;
        brandId: string;
        title: string;
        price: number;
        imageUrl: string;
    }>;
    searchProducts(query: string): Promise<({
        brand: {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            logoUrl: string | null;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            supportedCausesInfo: string | null;
            foundedYear: number | null;
            location: string | null;
            values: string[];
            updatedAt: Date | null;
        };
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
        price: number;
        imageUrl: string;
    })[]>;
    getProductsByBrand(brandId: string): Promise<({
        variants: {
            id: string;
            optionName: string;
            optionValue: string;
            stock: number;
            productId: string;
        }[];
    } & {
        id: string;
        description: string;
        brandId: string;
        title: string;
        price: number;
        imageUrl: string;
    })[]>;
}
