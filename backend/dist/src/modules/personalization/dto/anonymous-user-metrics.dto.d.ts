export declare class AnonymousUserOverviewDto {
  totalAnonymousUsers: number;
  activeAnonymousUsers: number;
  conversionRate: number;
  avgSessionDuration: number;
  returningUserRate: number;
}
export declare class InteractionTypeMetricsDto {
  type: string;
  count: number;
  percentage: number;
}
export declare class CategoryPreferenceDto {
  categoryId: string;
  categoryName: string;
  weight: number;
  interactionCount: number;
}
export declare class BrandPreferenceDto {
  brandId: string;
  brandName: string;
  weight: number;
  interactionCount: number;
}
export declare class SearchTermDto {
  query: string;
  count: number;
  conversionRate: number;
}
export declare class TimeframeMetricsDto {
  date: string;
  anonymousUsers: number;
  newUsers: number;
  returningUsers: number;
  avgSessionDuration: number;
}
export declare class AnonymousUserMetricsDto {
  overview: AnonymousUserOverviewDto;
  interactionsByType: InteractionTypeMetricsDto[];
  topCategoryPreferences: CategoryPreferenceDto[];
  topBrandPreferences: BrandPreferenceDto[];
  topSearchTerms: SearchTermDto[];
  byTimeframe: TimeframeMetricsDto[];
}
