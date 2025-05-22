export declare class SuggestionType {
  text: string;
  type: string;
  prefix?: string;
  highlighted?: string;
}
export declare class AutocompleteSuggestionsType {
  suggestions: SuggestionType[];
  metadata?: any;
}
