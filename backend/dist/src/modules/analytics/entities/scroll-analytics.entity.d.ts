export declare enum ScrollDirection {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
}
export declare class ScrollAnalytics {
    id: string;
    userId: string;
    sessionId: string;
    pagePath: string;
    direction: ScrollDirection;
    maxScrollDepth: number;
    pageHeight: number;
    maxScrollPercentage: number;
    scrollCount: number;
    dwellTimeSeconds: number;
    scrollDepthTimestamps: string;
    deviceType: string;
    platform: string;
    viewportDimensions: string;
    timestamp: Date;
}
