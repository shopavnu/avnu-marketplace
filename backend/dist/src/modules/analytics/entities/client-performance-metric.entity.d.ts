export declare class ClientPerformanceMetric {
    id: string;
    userId: string;
    sessionId: string;
    pagePath: string;
    deviceType: string;
    platform: string;
    browserName: string;
    browserVersion: string;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    domContentLoaded: number;
    windowLoad: number;
    resourceLoadTimes: string;
    networkInformation: string;
    timestamp: Date;
}
