export declare class UserSegmentDto {
  id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
  characteristics: string[];
  topCategories: string[];
  topBrands: string[];
  avgSessionDuration: number;
  conversionRate: number;
}
export declare class PageHeatmapDataDto {
  x: number;
  y: number;
  value: number;
}
export declare class FunnelStepDto {
  name: string;
  value: number;
  percentage?: number;
  conversionRate?: number;
}
export declare class UserSegmentationDataDto {
  segments: UserSegmentDto[];
  pageHeatmapData: PageHeatmapDataDto[];
  funnelData: FunnelStepDto[];
}
