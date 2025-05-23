import { ProductsPrismaService } from '../services/products-prisma.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsPrismaService);
    list(skip?: number, take?: number): Promise<({
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
    search(query: string): Promise<({
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
}
