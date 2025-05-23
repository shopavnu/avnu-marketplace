import { BrandsPrismaService } from '../services/brands-prisma.service';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsPrismaService);
    list(skip?: number, take?: number): Promise<({
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
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
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
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
        updatedAt: Date | null;
    }>;
    getBrandProducts(id: string): Promise<{
        products: ({
            variants: {
                id: string;
                productId: string;
                optionName: string;
                optionValue: string;
                stock: number;
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
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
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
    }, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
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
    }, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
        updatedAt: Date | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        logoUrl: string | null;
        websiteUrl: string | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        supportedCausesInfo: string | null;
        foundedYear: number | null;
        location: string | null;
        values: string[];
        createdAt: Date;
        updatedAt: Date | null;
    }>;
}
