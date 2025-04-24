export declare enum SearchEventType {
    SEARCH_QUERY = "SEARCH_QUERY",
    SUGGESTION_CLICK = "SUGGESTION_CLICK",
    SUGGESTION_IMPRESSION = "SUGGESTION_IMPRESSION",
    SEARCH_RESULT_CLICK = "SEARCH_RESULT_CLICK"
}
export declare class SearchEventInput {
    eventType: SearchEventType;
    timestamp: string;
    data?: Record<string, any>;
}
