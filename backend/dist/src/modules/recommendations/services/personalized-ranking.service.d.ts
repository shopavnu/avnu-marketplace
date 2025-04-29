import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { UserPreferenceProfileService } from '../../personalization/services/user-preference-profile.service';
export declare class PersonalizedRankingService {
    private readonly productRepository;
    private readonly userPreferenceProfileService;
    private readonly logger;
    constructor(productRepository: Repository<Product>, userPreferenceProfileService: UserPreferenceProfileService);
    getPersonalizedRecommendations(userId: string, limit?: number, excludePurchased?: boolean, freshness?: number): Promise<Product[]>;
    private getTrendingProducts;
}
