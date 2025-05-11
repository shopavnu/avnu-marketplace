import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UserPreferenceService, UserPreferences } from './user-preference.service';
export declare class PreferenceDecayService {
  private readonly configService;
  private readonly elasticsearchService;
  private readonly userPreferenceService;
  private readonly logger;
  private readonly preferencesIndex;
  private readonly decayEnabled;
  private readonly decayRates;
  private readonly halfLifeDays;
  private readonly maxPreferenceAge;
  private readonly batchSize;
  constructor(
    configService: ConfigService,
    elasticsearchService: ElasticsearchService,
    userPreferenceService: UserPreferenceService,
  );
  applyDecayToUser(userId: string): Promise<boolean>;
  calculateDecayedPreferences(preferences: UserPreferences): UserPreferences;
  private applyDecayToMap;
  private applyDecayToPriceRanges;
  private filterRecentItems;
  applyDecayToAllUsers(): Promise<void>;
  applyImmediateDecay(
    userId: string,
    preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges',
    decayFactor: number,
  ): Promise<boolean>;
  private applyImmediateDecayToMap;
  private applyImmediateDecayToPriceRanges;
  getDecayRate(preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges'): number;
  getHalfLifeDays(preferenceType: 'categories' | 'brands' | 'values' | 'priceRanges'): number;
  isDecayEnabled(): boolean;
}
