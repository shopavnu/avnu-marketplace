/**
 * Types for analytics components
 */

export interface HeatmapAnalyticsData {
  topPages: {
    pagePath: string;
    viewCount: number;
  }[];
  interactionMetricsByPage: {
    pagePath: string;
    clickCount: number;
    hoverCount: number;
    scrollPauseCount: number;
    avgInteractionTime: number;
    interactionDensity: number;
  }[];
  interactionsByDeviceType: {
    deviceType: string;
    interactionCount: number;
  }[];
  interactionTimeDistribution: {
    timeRange: string;
    sessionCount: number;
  }[];
}

export interface PerformanceMetricsData {
  pageLoadTime: {
    average: number;
    byPage: {
      pagePath: string;
      loadTime: number;
    }[];
  };
  firstContentfulPaint: {
    average: number;
    byPage: {
      pagePath: string;
      fcp: number;
    }[];
  };
  largestContentfulPaint: {
    average: number;
    byPage: {
      pagePath: string;
      lcp: number;
    }[];
  };
  cumulativeLayoutShift: {
    average: number;
    byPage: {
      pagePath: string;
      cls: number;
    }[];
  };
  firstInputDelay: {
    average: number;
    byPage: {
      pagePath: string;
      fid: number;
    }[];
  };
}

export interface UserBehaviorData {
  sessionMetrics: {
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    returnRate: number;
  };
  navigationPaths: {
    path: string[];
    count: number;
    conversionRate: number;
  }[];
  userSegments: {
    segment: string;
    sessionCount: number;
    avgSessionDuration: number;
    conversionRate: number;
  }[];
  deviceDistribution: {
    deviceType: string;
    sessionCount: number;
    percentage: number;
  }[];
}
