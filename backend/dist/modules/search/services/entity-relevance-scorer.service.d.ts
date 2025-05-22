import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '../enums/search-entity-type.enum';
import { EntityBoostingDto } from '../dto/entity-specific-filters.dto';
export declare class EntityRelevanceScorerService {
  private readonly configService;
  private readonly logger;
  private readonly defaultProductBoost;
  private readonly defaultMerchantBoost;
  private readonly defaultBrandBoost;
  private readonly userHistoryBoostFactor;
  private readonly userPreferencesBoostFactor;
  constructor(configService: ConfigService);
  applyEntityBoosting(
    results: any,
    entityType: SearchEntityType,
    entityBoosting?: EntityBoostingDto,
  ): any;
  private calculateUserEntityBoosts;
  enhanceQueryWithEntityBoosting(
    baseQuery: any,
    entityType: SearchEntityType,
    entityBoosting?: EntityBoostingDto,
  ): any;
  normalizeScores(results: any): any;
  calculateEntityRelevance(entityType: SearchEntityType, query: string, source: any): number;
  private calculateProductRelevance;
  private calculateMerchantRelevance;
  private calculateBrandRelevance;
}
