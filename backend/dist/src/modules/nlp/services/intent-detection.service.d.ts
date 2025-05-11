import { ConfigService } from '@nestjs/config';
export declare class IntentDetectionService {
  private readonly configService;
  private readonly logger;
  private readonly classifier;
  private readonly intentPatterns;
  private readonly intentKeywords;
  private readonly intentExamples;
  private readonly confidenceThreshold;
  constructor(configService: ConfigService);
  private trainClassifier;
  detectIntent(
    query: string,
    _tokens: string[],
  ): {
    intent: string;
    confidence: number;
    subIntents: {
      intent: string;
      confidence: number;
    }[];
  };
  getSearchParameters(
    intent: string,
    entities: {
      type: string;
      value: string;
      confidence: number;
    }[],
    query?: string,
  ): {
    boost: Record<string, number>;
    sort: {
      field: string;
      order: 'asc' | 'desc';
    }[];
    filters: Record<string, any>;
  };
}
