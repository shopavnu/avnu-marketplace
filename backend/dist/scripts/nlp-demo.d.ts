declare class NlpProcessor {
    processQueryBasic(query: string): {
        processedQuery: string;
        entities: {
            type: string;
            value: string;
        }[];
        intent: string;
    };
    processQueryEnhanced(query: string): {
        originalQuery: string;
        processedQuery: string;
        expandedQuery: string;
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
    };
    private extractEntities;
    private detectIntent;
    private expandQuery;
    private generateSearchParameters;
    private buildProcessedQuery;
}
declare const testQueries: string[];
declare const nlpProcessor: NlpProcessor;
