// This file contains TypeScript definitions for all analytics components

import { ReactNode } from 'react';

// Scroll Analytics Types
export interface ScrollAnalyticsData {
  scrollDepthByPage: {
    page: string;
    depth: number;
  }[];
  scrollEngagementTrend: {
    date: string;
    engagement: number;
  }[];
  scrollDepthDistribution: {
    depth: string;
    users: number;
  }[];
  scrollMilestones: {
    milestone: string;
    reachPercentage: number;
  }[];
  contentVisibility: {
    section: string;
    visibilityPercentage: number;
    avgTimeViewed: number;
    engagementScore: number;
  }[];
  userSegmentScrollBehavior: {
    segment: string;
    avgScrollDepth: number;
  }[];
}

export interface ScrollAnalyticsProps {
  data: ScrollAnalyticsData;
  loading: boolean;
}

// Heatmap Analytics Types
export interface HeatmapData {
  clickHeatmap: {
    x: number;
    y: number;
    value: number;
  }[];
  mouseMovementHeatmap: {
    x: number;
    y: number;
    value: number;
  }[];
  interactionHotspots: {
    elementId: string;
    elementType: string;
    clickCount: number;
    avgTimeSpent: number;
  }[];
  pagePerformance: {
    page: string;
    avgLoadTime: number;
    bounceRate: number;
    conversionRate: number;
  }[];
}

export interface HeatmapAnalyticsProps {
  data: HeatmapData;
  loading: boolean;
}

// Conversion Funnel Types
export interface ConversionFunnelData {
  funnelStages: {
    stage: string;
    users: number;
    conversionRate: number;
  }[];
  dropOffPoints: {
    point: string;
    dropOffRate: number;
    possibleReasons: string[];
  }[];
  conversionBySegment: {
    segment: string;
    conversionRate: number;
  }[];
  conversionTrends: {
    date: string;
    conversionRate: number;
  }[];
}

export interface ConversionFunnelProps {
  data: ConversionFunnelData;
  loading: boolean;
}

// Tab Panel Props
export interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}
