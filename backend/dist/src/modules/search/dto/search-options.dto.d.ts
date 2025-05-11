import { SearchEntityType } from '../enums/search-entity-type.enum';
export declare enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
export declare class SortOption {
  field: string;
  order?: SortOrder;
}
export declare class FilterOption {
  field: string;
  values: string[];
  exact?: boolean;
}
export declare class RangeFilterOption {
  field: string;
  min?: number;
  max?: number;
}
export declare class SearchOptionsInput {
  query?: string;
  entityType?: SearchEntityType;
  page?: number;
  limit?: number;
  sort?: SortOption[];
  filters?: FilterOption[];
  rangeFilters?: RangeFilterOption[];
  personalized?: boolean;
  enablePersonalization?: boolean;
  personalizationStrength?: number;
  enableNlp?: boolean;
  nlpData?: {
    intent: string;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    expandedTerms?: string[];
  };
  boostByValues?: boolean;
  includeSponsoredContent?: boolean;
  experimentId?: string;
  enableABTesting?: boolean;
  enableAnalytics?: boolean;
  clientId?: string;
  metadata?: Record<string, any>;
  enableHighlighting?: boolean;
  highlightFields?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
  highlightFragmentSize?: number;
}
