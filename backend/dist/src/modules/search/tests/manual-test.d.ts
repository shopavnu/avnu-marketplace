interface SearchSuggestionInput {
    query: string;
    limit: number;
    includePopular: boolean;
    includePersonalized: boolean;
    includeCategoryContext: boolean;
    categories?: string[];
    types?: string[];
}
interface SearchSuggestionType {
    text: string;
    score: number;
    category?: string;
    type?: string;
    isPopular: boolean;
    isPersonalized: boolean;
}
interface SearchSuggestionsResponseType {
    suggestions: SearchSuggestionType[];
    total: number;
    isPersonalized: boolean;
    originalQuery?: string;
}
declare function getSuggestions(input: SearchSuggestionInput, user?: any): SearchSuggestionsResponseType;
declare function runTests(): void;
