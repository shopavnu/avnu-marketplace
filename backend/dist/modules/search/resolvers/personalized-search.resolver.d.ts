import { PersonalizedSearchService } from '../services/personalized-search.service';
import { SearchOptionsInput } from '../dto/search-options.dto';
export declare class PersonalizedSearchResolver {
  private readonly personalizedSearchService;
  constructor(personalizedSearchService: PersonalizedSearchService);
  personalizedSearch(context: any, query: string, options?: SearchOptionsInput): Promise<any>;
  personalizedRecommendations(context: any, limit?: number): Promise<any>;
  discoveryFeed(context: any, limit?: number): Promise<any>;
  personalizedSimilarProducts(
    context: any,
    productId: string,
    limit?: number,
    _options?: SearchOptionsInput,
  ): Promise<any>;
}
