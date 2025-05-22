import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserPreferenceService } from './user-preference.service';
export declare class CollaborativeFilteringService {
  private readonly configService;
  private readonly elasticsearchService;
  private readonly userPreferenceService;
  private readonly logger;
  private readonly similarityThreshold;
  private readonly maxSimilarUsers;
  private readonly interactionsIndex;
  private readonly preferencesIndex;
  constructor(
    configService: ConfigService,
    elasticsearchService: ElasticsearchService,
    userPreferenceService: UserPreferenceService,
  );
  getRelatedCategories(category: string): Array<{
    category: string;
    similarity: number;
  }>;
  findSimilarUsers(userId: string): Promise<
    Array<{
      userId: string;
      similarity: number;
    }>
  >;
  enhanceUserPreferences(userId: string): Promise<boolean>;
  getCollaborativeRecommendations(
    userId: string,
    limit?: number,
  ): Promise<
    Array<{
      productId: string;
      score: number;
    }>
  >;
  applyCollaborativeBoosts(query: any, userId: string, boostStrength?: number): Promise<any>;
  private extractPreferenceFeatures;
  private calculateCosineSimilarity;
  private enhancePreferenceMap;
}
