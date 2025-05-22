import {
  ProductResultType,
  MerchantResultType,
  BrandResultType,
  FacetType,
} from './search-response.type';
import { CursorPaginationType } from './cursor-pagination.type';
export declare const CursorSearchResultUnion:
  | ProductResultType
  | MerchantResultType
  | BrandResultType;
export declare class CursorSearchResponseType {
  query?: string;
  pagination: CursorPaginationType;
  results: (typeof CursorSearchResultUnion)[];
  highlightsEnabled: boolean;
  facets?: FacetType[];
  isPersonalized?: boolean;
  experimentId?: string;
  appliedFilters?: string[];
}
