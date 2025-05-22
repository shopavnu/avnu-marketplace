export declare class ABTestVariantDto {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  isControl: boolean;
}
export declare class ABTestVariantMetricDto {
  id: string;
  value: number;
  improvement: number;
}
export declare class ABTestMetricDto {
  name: string;
  control: number;
  variants: ABTestVariantMetricDto[];
}
export declare class ABTestResultDto {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  variants: ABTestVariantDto[];
  metrics: ABTestMetricDto[];
  winner?: string;
  confidenceLevel?: number;
}
