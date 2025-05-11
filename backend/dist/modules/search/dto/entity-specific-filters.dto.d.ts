import { FilterOption, RangeFilterOption, SortOption } from './search-options.dto';
export declare class ProductFilterDto {
  categories?: string[];
  tags?: string[];
  values?: string[];
  brandIds?: string[];
  merchantIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  newArrivalsWithinDays?: number;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  toGenericFilters(): {
    filters: FilterOption[];
    rangeFilters: RangeFilterOption[];
  };
}
export declare class MerchantFilterDto {
  categories?: string[];
  values?: string[];
  locations?: string[];
  minRating?: number;
  verifiedOnly?: boolean;
  activeOnly?: boolean;
  newMerchantsWithinDays?: number;
  minProductCount?: number;
  toGenericFilters(): {
    filters: FilterOption[];
    rangeFilters: RangeFilterOption[];
  };
}
export declare class BrandFilterDto {
  categories?: string[];
  values?: string[];
  locations?: string[];
  verifiedOnly?: boolean;
  activeOnly?: boolean;
  minFoundedYear?: number;
  maxFoundedYear?: number;
  newBrandsWithinDays?: number;
  minProductCount?: number;
  toGenericFilters(): {
    filters: FilterOption[];
    rangeFilters: RangeFilterOption[];
  };
}
export declare class EntityBoostingDto {
  productBoost?: number;
  merchantBoost?: number;
  brandBoost?: number;
}
export declare class EnhancedSearchOptionsDto {
  query?: string;
  page?: number;
  limit?: number;
  enableNlp?: boolean;
  personalized?: boolean;
  productFilters?: ProductFilterDto;
  merchantFilters?: MerchantFilterDto;
  brandFilters?: BrandFilterDto;
  sort?: SortOption[];
  entityBoosting?: EntityBoostingDto;
  boostByValues?: boolean;
  includeSponsoredContent?: boolean;
  experimentId?: string;
}
