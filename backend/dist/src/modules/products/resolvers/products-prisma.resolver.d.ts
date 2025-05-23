import { ProductsPrismaService } from '../services/products-prisma.service';
export declare class ProductsPrismaResolver {
    private readonly productsService;
    constructor(productsService: ProductsPrismaService);
    getProducts(skip?: number, take?: number): Promise<({
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
    getProduct(id: string): Promise<{
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
    createProduct(title: string, description: string, price: number, imageUrl: string, brandId: string, variants?: any[]): Promise<{
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
    updateProduct(id: string, title?: string, description?: string, price?: number, imageUrl?: string, brandId?: string): Promise<{
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
    deleteProduct(id: string): Promise<{
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
