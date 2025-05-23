import { BrandsPrismaService } from '../services/brands-prisma.service';
export declare class BrandsPrismaResolver {
    private readonly brandsService;
    constructor(brandsService: BrandsPrismaService);
    getBrands(skip?: number, take?: number, includeProducts?: boolean): Promise<({
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
    getBrand(id: string, includeProducts?: boolean): Promise<{
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
    createBrand(name: string): Promise<{
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
    updateBrand(id: string, name?: string): Promise<{
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
    deleteBrand(id: string): Promise<{
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
    getBrandWithProducts(id: string): Promise<{
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
}
