import { PersonalizedSearchService } from '../services/personalized-search.service';
export declare class PersonalizedSearchController {
    private readonly personalizedSearchService;
    constructor(personalizedSearchService: PersonalizedSearchService);
    personalizedSearch(req: any, body: {
        query: string;
        options?: any;
    }): Promise<any>;
    getRecommendations(req: any, limit?: number): Promise<any>;
    getDiscoveryFeed(req: any, limit?: number): Promise<any>;
    getSimilarProducts(req: any, productId: string, limit?: number): Promise<any>;
}
