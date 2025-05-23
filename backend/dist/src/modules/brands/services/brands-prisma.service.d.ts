import { PrismaClient } from '@prisma/client';
export declare class BrandsPrismaService {
    private prisma;
    constructor(prisma: PrismaClient);
    findAll(options?: {
        skip?: number;
        take?: number;
        includeProducts?: boolean;
    }): Promise<({
        products: {
            id: string;
            description: string;
            brandId: string;
            title: string;
            price: number;
            imageUrl: string;
        }[];
    } & {
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
    })[]>;
    findOne(id: string, includeProducts?: boolean): Promise<{
        products: {
            id: string;
            description: string;
            brandId: string;
            title: string;
            price: number;
            imageUrl: string;
        }[];
    } & {
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
    }>;
    create(data: {
        name: string;
        description?: string;
        logoUrl?: string;
        websiteUrl?: string;
        socialLinks?: {
            instagram?: string;
            twitter?: string;
            facebook?: string;
        };
        supportedCausesInfo?: string;
        foundedYear?: number;
        location?: string;
        values?: string[];
    }): Promise<{
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
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        logoUrl?: string;
        websiteUrl?: string;
        socialLinks?: {
            instagram?: string;
            twitter?: string;
            facebook?: string;
        };
        supportedCausesInfo?: string;
        foundedYear?: number;
        location?: string;
        values?: string[];
    }): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    searchBrands(query: string): Promise<({
        products: {
            id: string;
            description: string;
            brandId: string;
            title: string;
            price: number;
            imageUrl: string;
        }[];
    } & {
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
    })[]>;
    getBrandWithProducts(id: string): Promise<{
        products: ({
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
        })[];
    } & {
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
    }>;
}
