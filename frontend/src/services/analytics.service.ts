// Analytics service for tracking user interactions
import { gql } from "@apollo/client";
import apolloClient from "../lib/apollo-client";
import { sessionService } from "./session.service";

// GraphQL mutation for tracking search events
const TRACK_SEARCH_EVENT = gql`
  mutation TrackSearchEvent($event: SearchEventInput!) {
    trackSearchEvent(event: $event) {
      success
    }
  }
`;

// Event types
export enum SearchEventType {
  SEARCH_QUERY = "SEARCH_QUERY",
  SUGGESTION_CLICK = "SUGGESTION_CLICK",
  SUGGESTION_IMPRESSION = "SUGGESTION_IMPRESSION",
  SEARCH_RESULT_CLICK = "SEARCH_RESULT_CLICK",
  SEARCH_RESULT_IMPRESSION = "SEARCH_RESULT_IMPRESSION",
  SEARCH_RESULT_DWELL_TIME = "SEARCH_RESULT_DWELL_TIME",
  FILTER_APPLY = "FILTER_APPLY",
  SORT_APPLY = "SORT_APPLY",
  CATEGORY_CLICK = "CATEGORY_CLICK",
  CAUSE_CLICK = "CAUSE_CLICK",
  PRODUCT_VIEW = "PRODUCT_VIEW",
  ADD_TO_CART = "ADD_TO_CART",
  PRODUCT_ATTRIBUTE_SELECT = "PRODUCT_ATTRIBUTE_SELECT",
}

// Event data interface
export interface SearchEventData {
  query?: string;
  suggestionText?: string;
  suggestionType?: string;
  suggestionCategory?: string;
  isPopular?: boolean;
  isPersonalized?: boolean;
  resultId?: string;
  resultIds?: string[];
  position?: number;
  startPosition?: number;
  count?: number;
  timestamp?: number;
  dwellTimeMs?: number; // Dwell time in milliseconds
  entryTime?: number; // Time when user entered the page
  exitTime?: number; // Time when user left the page
  sessionId?: string; // Current user session ID
  sessionDuration?: number; // Current session duration in milliseconds
  previousQueries?: string[]; // Previous search queries in this session
  filterType?: string;
  filterValue?: string | number | boolean | { min?: number; max?: number };
  sortField?: string;
  sortDirection?: "asc" | "desc";
  categoryId?: string;
  causeId?: string;
  productId?: string;
  productName?: string;
  productBrand?: string;
  productCategory?: string;
  productPrice?: number;
  attributeKey?: string;
  attributeValue?: string;
  quantity?: number;
  referrer?: string;
  [key: string]: any;
}

class AnalyticsService {
  /**
   * Track a search-related event
   */
  async trackSearchEvent(eventType: SearchEventType, data: SearchEventData) {
    try {
      // Add session information to all events
      const sessionId = sessionService.getSessionId();
      const sessionData = sessionService.getSessionData();

      // Enrich event data with session information
      const enrichedData = {
        ...data,
        sessionId,
        sessionDuration: sessionService.getSessionDuration(),
        previousQueries: sessionData?.searchQueries || [],
        timestamp: Date.now(),
      };

      // Track specific events in the session service
      if (eventType === SearchEventType.SEARCH_QUERY && data.query) {
        sessionService.trackSearchQuery(data.query);
      } else if (
        eventType === SearchEventType.SEARCH_RESULT_CLICK &&
        data.resultId
      ) {
        sessionService.trackResultClick(data.resultId);
      } else if (
        eventType === SearchEventType.CATEGORY_CLICK &&
        data.categoryId
      ) {
        sessionService.trackCategoryView(data.categoryId);
      } else if (
        eventType === SearchEventType.FILTER_APPLY &&
        data.filterType
      ) {
        sessionService.trackFilter(data.filterType, data.filterValue);
      }

      const response = await apolloClient.mutate({
        mutation: TRACK_SEARCH_EVENT,
        variables: {
          event: {
            eventType,
            timestamp: new Date().toISOString(),
            data: enrichedData,
          },
        },
      });

      return response.data?.trackSearchEvent?.success || false;
    } catch (error) {
      console.error("Failed to track search event:", error);
      return false;
    }
  }

  /**
   * Track when a user performs a search query
   */
  trackSearchQuery(query: string) {
    return this.trackSearchEvent(SearchEventType.SEARCH_QUERY, { query });
  }

  /**
   * Track when a user clicks on a search suggestion
   */
  trackSuggestionClick(suggestion: {
    text: string;
    category?: string;
    type?: string;
    isPopular: boolean;
    isPersonalized: boolean;
  }) {
    return this.trackSearchEvent(SearchEventType.SUGGESTION_CLICK, {
      suggestionText: suggestion.text,
      suggestionCategory: suggestion.category,
      suggestionType: suggestion.type,
      isPopular: suggestion.isPopular,
      isPersonalized: suggestion.isPersonalized,
    });
  }

  /**
   * Track when search suggestions are shown to the user
   */
  trackSuggestionImpression(query: string, suggestionsCount: number) {
    return this.trackSearchEvent(SearchEventType.SUGGESTION_IMPRESSION, {
      query,
      suggestionsCount,
    });
  }

  /**
   * Track when a user clicks on a search result
   */
  trackSearchResultClick(resultId: string, position: number, query: string) {
    return this.trackSearchEvent(SearchEventType.SEARCH_RESULT_CLICK, {
      resultId,
      position,
      query,
    });
  }

  /**
   * Track when search results are shown to the user
   */
  trackSearchResultImpression(
    resultIds: string[],
    query: string,
    startPosition: number = 0,
  ) {
    return this.trackSearchEvent(SearchEventType.SEARCH_RESULT_IMPRESSION, {
      resultIds,
      query,
      startPosition,
      count: resultIds.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Track the amount of time a user spends viewing a search result
   * @param resultId ID of the result that was viewed
   * @param query The search query that led to this result
   * @param dwellTimeMs Time spent on the page in milliseconds
   * @param position Position of the result in search results
   */
  trackSearchResultDwellTime(
    resultId: string,
    query: string,
    dwellTimeMs: number,
    position?: number,
  ) {
    return this.trackSearchEvent(SearchEventType.SEARCH_RESULT_DWELL_TIME, {
      resultId,
      query,
      position,
      dwellTimeMs,
      timestamp: Date.now(),
    });
  }

  /**
   * Track when a user applies a filter
   */
  trackFilterApply(filterType: string, filterValue: any, query?: string) {
    return this.trackSearchEvent(SearchEventType.FILTER_APPLY, {
      filterType,
      filterValue,
      query,
    });
  }

  /**
   * Track when a user applies a sort option
   */
  trackSortApply(
    sortField: string,
    sortDirection: "asc" | "desc",
    query?: string,
  ) {
    return this.trackSearchEvent(SearchEventType.SORT_APPLY, {
      sortField,
      sortDirection,
      query,
    });
  }

  /**
   * Track when a user clicks on a category
   */
  trackCategoryClick(categoryId: string, query?: string) {
    return this.trackSearchEvent(SearchEventType.CATEGORY_CLICK, {
      categoryId,
      query,
    });
  }

  /**
   * Track when a user clicks on a cause (e.g., sustainable, eco-friendly)
   */
  trackCauseClick(causeId: string, query?: string) {
    return this.trackSearchEvent(SearchEventType.CAUSE_CLICK, {
      causeId,
      query,
    });
  }

  /**
   * Track when a user views a product detail page
   */
  trackProductView(
    product: {
      id: string;
      title: string;
      brand: string;
      category: string;
      price: number;
    },
    referrer?: string,
  ) {
    return this.trackSearchEvent(SearchEventType.PRODUCT_VIEW, {
      productId: product.id,
      productName: product.title,
      productBrand: product.brand,
      productCategory: product.category,
      productPrice: product.price,
      referrer,
    });
  }

  /**
   * Track when a user adds a product to cart
   */
  trackAddToCart(
    product: {
      id: string;
      title: string;
      brand: string;
      category: string;
      price: number;
    },
    quantity: number = 1,
    selectedAttributes?: Record<string, string>,
  ) {
    return this.trackSearchEvent(SearchEventType.ADD_TO_CART, {
      productId: product.id,
      productName: product.title,
      productBrand: product.brand,
      productCategory: product.category,
      productPrice: product.price,
      quantity,
      selectedAttributes,
    });
  }

  /**
   * Track when a user selects a product attribute (size, color, etc.)
   */
  trackProductAttributeSelect(
    productId: string,
    attributeKey: string,
    attributeValue: string,
  ) {
    return this.trackSearchEvent(SearchEventType.PRODUCT_ATTRIBUTE_SELECT, {
      productId,
      attributeKey,
      attributeValue,
    });
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService();
