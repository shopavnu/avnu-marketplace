export declare class SearchSuggestionInput {
    query: string;
    limit: number;
    includePopular: boolean;
    includePersonalized: boolean;
    includeCategoryContext: boolean;
    categories?: string[];
    types?: string[];
}
