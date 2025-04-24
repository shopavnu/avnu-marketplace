import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Google Analytics event data interface
 */
export interface AnalyticsEvent {
  name: string;
  params: Record<string, any>;
}

/**
 * Service for integrating with Google Analytics
 */
@Injectable()
export class GoogleAnalyticsService {
  private readonly logger = new Logger(GoogleAnalyticsService.name);
  private readonly measurementId: string;
  private readonly apiSecret: string;
  private readonly endpoint: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.measurementId = this.configService.get<string>('GOOGLE_ANALYTICS_MEASUREMENT_ID', '');
    this.apiSecret = this.configService.get<string>('GOOGLE_ANALYTICS_API_SECRET', '');
    this.endpoint = 'https://www.google-analytics.com/mp/collect';
    this.isEnabled = !!this.measurementId && !!this.apiSecret;

    if (!this.isEnabled) {
      this.logger.warn('Google Analytics integration is disabled due to missing configuration');
    } else {
      this.logger.log('Google Analytics integration initialized');
    }
  }

  /**
   * Send an event to Google Analytics
   * @param clientId Unique identifier for the user/client
   * @param event The event to track
   * @param userId Optional user ID for authenticated users
   */
  async sendEvent(clientId: string, event: AnalyticsEvent, userId?: string): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.debug('Google Analytics event not sent - integration disabled');
      return false;
    }

    try {
      const url = `${this.endpoint}?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;

      const payload = {
        client_id: clientId,
        user_id: userId,
        events: [
          {
            name: event.name,
            params: event.params,
          },
        ],
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        this.logger.debug(`Successfully sent event "${event.name}" to Google Analytics`);
        return true;
      } else {
        this.logger.warn(`Unexpected response from Google Analytics: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send event to Google Analytics: ${error.message}`);
      return false;
    }
  }

  /**
   * Track a search event in Google Analytics
   * @param clientId Unique identifier for the user/client
   * @param searchTerm The search term used
   * @param resultCount Number of results returned
   * @param testInfo Optional A/B test information
   * @param userId Optional user ID for authenticated users
   */
  async trackSearch(
    clientId: string,
    searchTerm: string,
    resultCount: number,
    testInfo?: {
      testId: string;
      variantId: string;
    },
    userId?: string,
  ): Promise<boolean> {
    const params: Record<string, any> = {
      search_term: searchTerm,
      result_count: resultCount,
    };

    // Add A/B test information if available
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }

    return this.sendEvent(
      clientId,
      {
        name: 'search',
        params,
      },
      userId,
    );
  }

  /**
   * Track a search click event in Google Analytics
   * @param clientId Unique identifier for the user/client
   * @param searchTerm The search term used
   * @param productId ID of the clicked product
   * @param position Position of the product in search results
   * @param testInfo Optional A/B test information
   * @param userId Optional user ID for authenticated users
   */
  async trackSearchClick(
    clientId: string,
    searchTerm: string,
    productId: string,
    position: number,
    testInfo?: {
      testId: string;
      variantId: string;
    },
    userId?: string,
  ): Promise<boolean> {
    const params: Record<string, any> = {
      search_term: searchTerm,
      item_id: productId,
      position,
    };

    // Add A/B test information if available
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }

    return this.sendEvent(
      clientId,
      {
        name: 'search_click',
        params,
      },
      userId,
    );
  }

  /**
   * Track a search refinement event in Google Analytics
   * @param clientId Unique identifier for the user/client
   * @param originalSearchTerm The original search term
   * @param refinedSearchTerm The refined search term
   * @param filterApplied Filters that were applied
   * @param testInfo Optional A/B test information
   * @param userId Optional user ID for authenticated users
   */
  async trackSearchRefinement(
    clientId: string,
    originalSearchTerm: string,
    refinedSearchTerm: string,
    filterApplied: Record<string, any>,
    testInfo?: {
      testId: string;
      variantId: string;
    },
    userId?: string,
  ): Promise<boolean> {
    const params: Record<string, any> = {
      original_search_term: originalSearchTerm,
      refined_search_term: refinedSearchTerm,
      filter_applied: JSON.stringify(filterApplied),
    };

    // Add A/B test information if available
    if (testInfo) {
      params.ab_test_id = testInfo.testId;
      params.variant_id = testInfo.variantId;
    }

    return this.sendEvent(
      clientId,
      {
        name: 'search_refinement',
        params,
      },
      userId,
    );
  }

  /**
   * Track an A/B test impression in Google Analytics
   * @param clientId Unique identifier for the user/client
   * @param testId ID of the A/B test
   * @param variantId ID of the variant shown to the user
   * @param context Additional context information
   * @param userId Optional user ID for authenticated users
   */
  async trackABTestImpression(
    clientId: string,
    testId: string,
    variantId: string,
    context: Record<string, any>,
    userId?: string,
  ): Promise<boolean> {
    return this.sendEvent(
      clientId,
      {
        name: 'ab_test_impression',
        params: {
          test_id: testId,
          variant_id: variantId,
          context: JSON.stringify(context),
        },
      },
      userId,
    );
  }

  /**
   * Generate a client ID if one doesn't exist
   * This should be stored in the user's browser cookies
   */
  generateClientId(): string {
    return 'GA1.1.' + Math.floor(Math.random() * 2147483647) + '.' + Math.floor(Date.now() / 1000);
  }
}
