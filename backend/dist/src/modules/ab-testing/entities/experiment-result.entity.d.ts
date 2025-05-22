import { ExperimentVariant } from './experiment-variant.entity';
export declare enum ResultType {
  IMPRESSION = 'impression',
  CLICK = 'click',
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
  CUSTOM = 'custom',
}
export declare class ExperimentResult {
  id: string;
  variantId: string;
  variant: ExperimentVariant;
  userId: string;
  sessionId: string;
  resultType: ResultType;
  value: number;
  context: string;
  metadata: string;
  timestamp: Date;
}
