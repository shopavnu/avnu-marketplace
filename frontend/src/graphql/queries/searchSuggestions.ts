import { gql } from "@apollo/client";

export const GET_SEARCH_SUGGESTIONS = gql`
  query GetSearchSuggestions($input: SearchSuggestionInput!) {
    getSuggestions(input: $input) {
      suggestions {
        text
        score
        category
        type
        isPopular
        isPersonalized
      }
      total
      isPersonalized
      originalQuery
    }
  }
`;

export interface SearchSuggestionType {
  text: string;
  score: number;
  category?: string;
  type?: string;
  isPopular: boolean;
  isPersonalized: boolean;
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestionType[];
  total: number;
  isPersonalized: boolean;
  originalQuery?: string;
}

export interface SearchSuggestionInput {
  query: string;
  limit?: number;
  includePopular?: boolean;
  includePersonalized?: boolean;
  includeCategoryContext?: boolean;
  categories?: string[];
  types?: string[];
}

export interface GetSearchSuggestionsData {
  getSuggestions: SearchSuggestionsResponse;
}

export interface GetSearchSuggestionsVars {
  input: SearchSuggestionInput;
}
