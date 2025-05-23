export declare class SearchSuggestionType {
    text: string;
    score: number;
    category?: string;
    type?: string;
    isPopular: boolean;
    isPersonalized: boolean;
}
export declare class SearchSuggestionsResponseType {
    suggestions: SearchSuggestionType[];
    total: number;
    isPersonalized: boolean;
    originalQuery?: string;
    error?: string;
}
