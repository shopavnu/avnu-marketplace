export declare class VariantResultType {
  variantId: string;
  variantName: string;
  isControl?: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  totalRevenue: number;
  averageRevenue: number;
  isWinner?: boolean;
  improvementRate?: number;
}
export declare class ExperimentResultsType {
  experimentId: string;
  experimentName: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  variants: VariantResultType[];
}
