import { ProductsPrismaService } from '../services/products-prisma.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsPrismaService);
    list(skip?: number, take?: number): Promise<({
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
    search(query: string): Promise<({
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
}
