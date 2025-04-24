import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RelevanceAlgorithm, ABTestConfig } from './search-relevance.service';
import { GoogleAnalyticsService } from '../../analytics/services/google-analytics.service';

/**
 * Service for managing A/B testing of search relevance algorithms
 */
@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name);
  private readonly activeTests: Map<string, ABTestConfig> = new Map();
  private readonly userAssignments: Map<string, Map<string, string>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
  ) {
    this.initializeActiveTests();
  }

  /**
   * Initialize active tests from configuration
   */
  private initializeActiveTests(): void {
    // In a real implementation, these would be loaded from a database
    const currentDate = new Date();

    const basicVsIntent: ABTestConfig = {
      id: 'search-relevance-test-001',
      name: 'Basic vs. Intent-Based Relevance',
      description: 'Testing standard BM25 algorithm against intent-based boosting',
      variants: [
        {
          id: 'control',
          algorithm: RelevanceAlgorithm.STANDARD,
          weight: 50,
        },
        {
          id: 'intent-boosted',
          algorithm: RelevanceAlgorithm.INTENT_BOOSTED,
          weight: 50,
        },
      ],
      startDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      isActive: true,
      analyticsEventName: 'search_relevance_test_001',
    };

    const userPreferenceTest: ABTestConfig = {
      id: 'user-preference-test-001',
      name: 'User Preference Boosting',
      description: 'Testing effectiveness of user preference-based boosting',
      variants: [
        {
          id: 'control',
          algorithm: RelevanceAlgorithm.STANDARD,
          weight: 33,
        },
        {
          id: 'preference-light',
          algorithm: RelevanceAlgorithm.USER_PREFERENCE,
          weight: 33,
          params: {
            preferenceWeight: 0.5,
          },
        },
        {
          id: 'preference-heavy',
          algorithm: RelevanceAlgorithm.USER_PREFERENCE,
          weight: 34,
          params: {
            preferenceWeight: 1.5,
          },
        },
      ],
      startDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endDate: new Date(currentDate.getTime() + 27 * 24 * 60 * 60 * 1000), // 27 days from now
      isActive: true,
      analyticsEventName: 'user_preference_test_001',
    };

    this.activeTests.set(basicVsIntent.id, basicVsIntent);
    this.activeTests.set(userPreferenceTest.id, userPreferenceTest);

    this.logger.log(`Initialized ${this.activeTests.size} active A/B tests`);
  }

  /**
   * Get all active A/B tests
   */
  getActiveTests(): ABTestConfig[] {
    return Array.from(this.activeTests.values()).filter(
      test =>
        test.isActive &&
        test.startDate <= new Date() &&
        (!test.endDate || test.endDate >= new Date()),
    );
  }

  /**
   * Get a specific A/B test by ID
   */
  getTestById(testId: string): ABTestConfig | undefined {
    return this.activeTests.get(testId);
  }

  /**
   * Assign a user to a variant for a specific test
   * @param testId The test ID
   * @param userId The user ID
   * @param clientId The client ID for analytics
   * @returns The assigned variant or null if test not found
   */
  assignUserToVariant(
    testId: string,
    userId: string,
    clientId: string,
  ): {
    variantId: string;
    algorithm: RelevanceAlgorithm;
    params?: Record<string, any>;
  } | null {
    const test = this.activeTests.get(testId);
    if (!test || !test.isActive) {
      return null;
    }

    // Check if user is already assigned to a variant
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }

    const userTestAssignments = this.userAssignments.get(userId);
    if (userTestAssignments.has(testId)) {
      const variantId = userTestAssignments.get(testId);
      const variant = test.variants.find(v => v.id === variantId);

      if (variant) {
        return {
          variantId: variant.id,
          algorithm: variant.algorithm,
          params: variant.params,
        };
      }
    }

    // Assign user to a variant based on weights
    const variant = this.selectVariantByWeight(test.variants);
    userTestAssignments.set(testId, variant.id);

    // Track the assignment in analytics
    this.trackVariantAssignment(clientId, test, variant.id, userId);

    return {
      variantId: variant.id,
      algorithm: variant.algorithm,
      params: variant.params,
    };
  }

  /**
   * Select a variant based on the defined weights
   */
  private selectVariantByWeight(
    variants: Array<{
      id: string;
      algorithm: RelevanceAlgorithm;
      weight: number;
      params?: Record<string, any>;
    }>,
  ): {
    id: string;
    algorithm: RelevanceAlgorithm;
    params?: Record<string, any>;
  } {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    let randomValue = Math.random() * totalWeight;

    for (const variant of variants) {
      randomValue -= variant.weight;
      if (randomValue <= 0) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  /**
   * Track variant assignment in Google Analytics
   */
  private async trackVariantAssignment(
    clientId: string,
    test: ABTestConfig,
    variantId: string,
    userId?: string,
  ): Promise<void> {
    try {
      await this.googleAnalyticsService.trackABTestImpression(
        clientId,
        test.id,
        variantId,
        {
          test_name: test.name,
          test_type: 'search_relevance',
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track variant assignment: ${error.message}`);
    }
  }

  /**
   * Track search results for A/B testing
   */
  async trackSearchResults(
    clientId: string,
    testId: string,
    variantId: string,
    searchTerm: string,
    resultCount: number,
    userId?: string,
  ): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) return;

    try {
      await this.googleAnalyticsService.trackSearch(
        clientId,
        searchTerm,
        resultCount,
        {
          testId,
          variantId,
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track search results: ${error.message}`);
    }
  }

  /**
   * Track search result click for A/B testing
   */
  async trackSearchClick(
    clientId: string,
    testId: string,
    variantId: string,
    searchTerm: string,
    productId: string,
    position: number,
    userId?: string,
  ): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) return;

    try {
      await this.googleAnalyticsService.trackSearchClick(
        clientId,
        searchTerm,
        productId,
        position,
        {
          testId,
          variantId,
        },
        userId,
      );
    } catch (error) {
      this.logger.error(`Failed to track search click: ${error.message}`);
    }
  }

  /**
   * Get metrics for a specific A/B test
   *
   * @param testId The test ID
   * @returns Test metrics or null if test not found
   */
  async getTestMetrics(testId: string): Promise<any> {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    try {
      // In a real implementation, this would fetch metrics from Google Analytics
      // or another analytics service. For now, we'll return mock data.

      // Generate mock metrics for each variant
      const variantMetrics = test.variants.map(variant => {
        // Generate realistic but random metrics
        const searches = Math.floor(Math.random() * 1000) + 500;
        const clicks = Math.floor(searches * (Math.random() * 0.3 + 0.1));
        const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.05));

        return {
          variantId: variant.id,
          algorithm: variant.algorithm,
          metrics: {
            searches,
            clicks,
            conversions,
            clickThroughRate: clicks / searches,
            conversionRate: conversions / searches,
          },
        };
      });

      // Determine the control variant
      const controlVariant = variantMetrics.find(v => v.variantId === 'control');

      // Calculate improvements relative to control
      const variantsWithImprovements = variantMetrics.map(variant => {
        if (variant.variantId === 'control') {
          return {
            ...variant,
            improvements: {
              clickThroughRate: 0,
              conversionRate: 0,
            },
            isSignificant: false,
          };
        }

        // Calculate improvements
        const clickThroughImprovement =
          ((variant.metrics.clickThroughRate - controlVariant.metrics.clickThroughRate) /
            controlVariant.metrics.clickThroughRate) *
          100;

        const conversionImprovement =
          ((variant.metrics.conversionRate - controlVariant.metrics.conversionRate) /
            controlVariant.metrics.conversionRate) *
          100;

        // Determine if the improvement is statistically significant
        // In a real implementation, this would use a proper statistical test
        const isSignificant =
          Math.abs(clickThroughImprovement) > 10 || Math.abs(conversionImprovement) > 15;

        return {
          ...variant,
          improvements: {
            clickThroughRate: clickThroughImprovement,
            conversionRate: conversionImprovement,
          },
          isSignificant,
        };
      });

      // Calculate overall test metrics
      const totalSearches = variantMetrics.reduce((sum, v) => sum + v.metrics.searches, 0);
      const totalClicks = variantMetrics.reduce((sum, v) => sum + v.metrics.clicks, 0);
      const totalConversions = variantMetrics.reduce((sum, v) => sum + v.metrics.conversions, 0);

      // Find the best performing variant
      const bestVariant = variantsWithImprovements
        .filter(v => v.variantId !== 'control')
        .sort((a, b) => b.improvements.conversionRate - a.improvements.conversionRate)[0];

      // Determine if the test has a significant result
      const hasSignificantResult = variantsWithImprovements.some(v => v.isSignificant);

      return {
        testId: test.id,
        testName: test.name,
        startDate: test.startDate,
        endDate: test.endDate,
        isActive: test.isActive,
        variants: variantsWithImprovements,
        overall: {
          searches: totalSearches,
          clicks: totalClicks,
          conversions: totalConversions,
          clickThroughRate: totalClicks / totalSearches,
          conversionRate: totalConversions / totalSearches,
        },
        bestVariant: bestVariant
          ? {
              variantId: bestVariant.variantId,
              algorithm: bestVariant.algorithm,
              improvement: bestVariant.improvements.conversionRate,
            }
          : null,
        hasSignificantResult,
        runningDays: Math.floor(
          (new Date().getTime() - test.startDate.getTime()) / (24 * 60 * 60 * 1000),
        ),
        remainingDays: test.endDate
          ? Math.floor((test.endDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
          : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get test metrics for ${testId}: ${error.message}`);
      return null;
    }
  }
}
