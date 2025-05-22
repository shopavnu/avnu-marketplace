// Common analytics data types

/**
 * Performance Metrics Types
 */
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

/**
 * User Behavior Data Types
 */
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
  deviceBreakdown: {
    deviceType: string;
    sessionCount: number;
    percentage: number;
  }[];
}

// Scroll Analytics Types
export interface ScrollDepthByPage {
  pagePath: string;
  avgScrollDepth: number;
}

export interface TimeSpentByPage {
  pagePath: string;
  avgTimeSpent: number;
}

export interface ScrollDepthDistribution {
  depthPercentage: number;
  sessionCount: number;
}

export interface ScrollPausePoint {
  scrollPosition: number;
  pauseCount: number;
}

export interface ScrollVelocityByPage {
  pagePath: string;
  avgScrollVelocity: number;
}

export interface ScrollTrend {
  date: string;
  avgScrollDepth: number;
  sessionCount: number;
}

export interface DetailedScrollData {
  pagePath: string;
  avgScrollDepth: number;
  maxScrollDepth: number;
  avgTimeSpent: number;
  bounceRate: number;
  sessionCount: number;
}

export interface ScrollAnalyticsData {
  scrollDepthByPage: ScrollDepthByPage[];
  timeSpentByPage: TimeSpentByPage[];
  scrollDepthDistribution: ScrollDepthDistribution[];
  scrollPausePoints: ScrollPausePoint[];
  scrollVelocityByPage: ScrollVelocityByPage[];
  scrollTrends: ScrollTrend[];
  detailedScrollData: DetailedScrollData[];
}

// Heatmap Analytics Types
export interface InteractionType {
  type: string;
  count: number;
  percentage: number;
}

export interface TopInteractionArea {
  elementSelector: string;
  interactionCount: number;
}

export interface InteractionMetricsByPage {
  pagePath: string;
  clickCount: number;
  hoverCount: number;
  scrollPauseCount: number;
  avgInteractionTime: number;
  interactionDensity: number;
}

export interface InteractionByDeviceType {
  deviceType: string;
  interactionCount: number;
}

export interface InteractionTimeDistribution {
  timeRange: string;
  sessionCount: number;
}

export interface HeatmapAnalyticsData {
  topPages: { pagePath: string; viewCount?: number }[];
  interactionTypes: InteractionType[];
  topInteractionAreas: TopInteractionArea[];
  interactionMetricsByPage: InteractionMetricsByPage[];
  interactionsByDeviceType: InteractionByDeviceType[];
  interactionTimeDistribution: InteractionTimeDistribution[];
}

// Conversion Funnel Types
export interface FunnelStep {
  name: string;
  count: number;
}

export interface Funnel {
  funnelType: string;
  steps: FunnelStep[];
}

export interface DeviceTypeConversion {
  deviceType: string;
  conversionRate: number;
}

export interface TimeOfDayConversion {
  timeRange: string;
  conversionRate: number;
}

export interface ConversionTrend {
  period: string;
  conversionRate: number;
}

export interface FunnelComparison {
  byDeviceType: DeviceTypeConversion[];
  byTimeOfDay: TimeOfDayConversion[];
  trends: ConversionTrend[];
}

export interface ConversionFunnelData {
  funnelTypes: { label: string; value: string }[];
  funnels: Funnel[];
  funnelComparison: FunnelComparison;
}
