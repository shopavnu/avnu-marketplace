import { ProductsPrismaService } from '../services/products-prisma.service';
export declare class ProductsPrismaResolver {
    private readonly productsService;
    constructor(productsService: ProductsPrismaService);
    getProducts(skip?: number, take?: number): Promise<({
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
    getProduct(id: string): Promise<{
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
    createProduct(title: string, description: string, price: number, imageUrl: string, brandId: string, variants?: any[]): Promise<{
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
    updateProduct(id: string, title?: string, description?: string, price?: number, imageUrl?: string, brandId?: string): Promise<{
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
    deleteProduct(id: string): Promise<{
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
