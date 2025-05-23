import { Request, Response } from 'express';
import { AnonymousUserService } from '../services/anonymous-user.service';
import { ProductsService } from '../../products/products.service';
export declare class AnonymousUserController {
    private readonly anonymousUserService;
    private readonly productsService;
    constructor(anonymousUserService: AnonymousUserService, productsService: ProductsService);
    trackInteraction(type: string, data: Record<string, any>, durationMs: number, req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    getRecentSearches(req: Request, res: Response, limit?: number): Promise<{
        searches: any[];
    }>;
    getRecentlyViewedProducts(req: Request, res: Response, limit?: number): Promise<{
        products: any[];
    }>;
    getPersonalizedRecommendations(req: Request, res: Response, limit?: number): Promise<{
        products: any[];
    }>;
    clearAnonymousUserData(req: Request, res: Response): {
        success: boolean;
    };
}
