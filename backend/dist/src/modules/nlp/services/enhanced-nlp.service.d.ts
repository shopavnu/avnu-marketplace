import { ConfigService } from '@nestjs/config';
import { QueryExpansionService } from './query-expansion.service';
import { EntityRecognitionService } from './entity-recognition.service';
import { IntentDetectionService } from './intent-detection.service';
export declare class EnhancedNlpService {
    private readonly configService;
    private readonly queryExpansionService;
    private readonly entityRecognitionService;
    private readonly intentDetectionService;
    private readonly logger;
    private tokenizer;
    private stemmer;
    private readonly minTokenLength;
    constructor(configService: ConfigService, queryExpansionService: QueryExpansionService, entityRecognitionService: EntityRecognitionService, intentDetectionService: IntentDetectionService);
    processQuery(query: string): Promise<{
        originalQuery: string;
        processedQuery: string;
        expandedQuery: string;
        tokens: string[];
        stems: string[];
        entities: {
            type: string;
            value: string;
            confidence: number;
        }[];
        intent: {
            primary: string;
            confidence: number;
            secondary: {
                intent: string;
                confidence: number;
            }[];
        };
        expansionTerms: string[];
        searchParameters: {
            boost: Record<string, number>;
            sort: {
                field: string;
                order: 'asc' | 'desc';
            }[];
            filters: Record<string, any>;
        };
    }>;
    private tokenizeAndClean;
    private buildProcessedQuery;
    analyzeQuery(query: string): Promise<{
        originalQuery: string;
        tokens: string[];
        stems: string[];
        entities: {
            type: string;
            value: string;
            confidence: number;
        }[];
        intent: {
            primary: string;
            confidence: number;
            secondary: {
                intent: string;
                confidence: number;
            }[];
        };
        expansion: {
            expandedQuery: string;
            expansionTerms: string[];
            expansionSources: Record<string, string[]>;
        };
        searchParameters: {
            boost: Record<string, number>;
            sort: {
                field: string;
                order: 'asc' | 'desc';
            }[];
            filters: Record<string, any>;
        };
    }>;
}
