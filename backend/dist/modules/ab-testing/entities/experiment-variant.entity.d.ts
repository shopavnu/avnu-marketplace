import { Experiment } from './experiment.entity';
import { ExperimentResult } from './experiment-result.entity';
export declare class ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  experimentId: string;
  experiment: Experiment;
  configuration: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  improvementRate: number;
  isWinner: boolean;
  confidenceLevel: number;
  results: ExperimentResult[];
  createdAt: Date;
  updatedAt: Date;
}
