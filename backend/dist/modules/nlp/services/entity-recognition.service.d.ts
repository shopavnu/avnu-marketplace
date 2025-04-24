import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
export declare class EntityRecognitionService {
    private readonly configService;
    private readonly elasticsearchService;
    private readonly logger;
    private readonly categoryPatterns;
    private readonly brandPatterns;
    private readonly valuePatterns;
    private readonly sizePatterns;
    private readonly colorPatterns;
    private readonly materialPatterns;
    private readonly pricePatterns;
    private readonly ratingPatterns;
    private readonly datePatterns;
    private readonly knownCategories;
    private readonly knownBrands;
    private readonly knownValues;
    private readonly knownColors;
    private readonly knownMaterials;
    constructor(configService: ConfigService, elasticsearchService: ElasticsearchService);
    private loadEntitiesFromElasticsearch;
    extractEntities(query: string, tokens: string[]): {
        entities: {
            type: string;
            value: string;
            confidence: number;
        }[];
        enhancedQuery: string;
    };
    private extractCategories;
    private extractBrands;
    private extractValues;
    private extractSizes;
    private extractColors;
    private extractMaterials;
    private extractPriceRanges;
    private extractRatings;
    private extractDates;
    private buildEnhancedQuery;
}
