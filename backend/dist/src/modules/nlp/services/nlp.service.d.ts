import { ConfigService } from '@nestjs/config';
export declare class NlpService {
    private readonly configService;
    private readonly logger;
    private tokenizer;
    private stemmer;
    private tfidf;
    private readonly minTokenLength;
    constructor(configService: ConfigService);
    processQuery(query: string): {
        originalQuery: string;
        processedQuery: string;
        tokens: string[];
        stems: string[];
        entities: {
            type: string;
            value: string;
        }[];
        intent: string;
        filters: Record<string, any>;
    };
    private tokenizeAndClean;
    private extractEntities;
    private findEntityAfterIndicator;
    private determineIntent;
    private extractFilters;
    private buildProcessedQuery;
    extractKeywords(text: string, maxKeywords?: number): string[];
    calculateSimilarity(text1: string, text2: string): number;
    classifyText(text: string, categories: {
        name: string;
        examples: string[];
    }[]): string;
    generateEmbeddings(text: string): number[];
}
