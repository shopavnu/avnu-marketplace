// Common analytics data types

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
  topPages: { pagePath: string }[];
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
