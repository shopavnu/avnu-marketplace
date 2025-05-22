export declare class VariantSignificanceType {
  variantId: string;
  variantName: string;
  isControl?: boolean;
  impressions: number;
  conversions: number;
  conversionRate: number;
  improvement: number;
  zScore: number;
  pValue: number;
  confidenceLevel: number;
  significant: boolean;
  isWinner?: boolean;
}
export declare class StatisticalSignificanceType {
  experimentId: string;
  experimentName: string;
  results: VariantSignificanceType[];
}
