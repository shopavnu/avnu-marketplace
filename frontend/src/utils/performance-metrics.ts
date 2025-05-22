/**
 * Performance Metrics Collector
 *
 * This utility collects Web Vitals and other performance metrics from the client
 * and sends them to the backend API for analysis.
 */

import * as webVitals from "web-vitals";

interface PerformanceMetricsOptions {
  apiEndpoint?: string;
  sampleRate?: number;
  includeResourceTiming?: boolean;
  includeNetworkInformation?: boolean;
}

export class PerformanceMetricsCollector {
  private apiEndpoint: string;
  private sampleRate: number;
  private includeResourceTiming: boolean;
  private includeNetworkInformation: boolean;
  private sessionId: string;
  private userId: string | null;
  private deviceType: string;
  private platform: string;
  private browserName: string;
  private browserVersion: string;

  constructor(options: PerformanceMetricsOptions = {}) {
    this.apiEndpoint = options.apiEndpoint || "/analytics/performance/client";
    this.sampleRate = options.sampleRate || 0.1; // 10% sampling by default
    this.includeResourceTiming = options.includeResourceTiming || false;
    this.includeNetworkInformation = options.includeNetworkInformation || false;

    // Get session ID from localStorage or create a new one
    this.sessionId =
      localStorage.getItem("sessionId") || this.generateSessionId();

    // Get user ID if available
    this.userId = localStorage.getItem("userId");

    // Detect device type
    this.deviceType = this.detectDeviceType();

    // Detect platform
    this.platform = this.detectPlatform();

    // Detect browser
    const browserInfo = this.detectBrowser();
    this.browserName = browserInfo.name;
    this.browserVersion = browserInfo.version;
  }

  /**
   * Initialize performance metrics collection
   */
  public init(): void {
    // Check if we should collect metrics based on sample rate
    if (Math.random() > this.sampleRate) {
      return;
    }

    // Collect Core Web Vitals
    this.collectWebVitals();

    // Collect navigation timing metrics on window load
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.collectNavigationTiming();
      }, 0);
    });
  }

  /**
   * Collect Web Vitals metrics
   */
  private collectWebVitals(): void {
    webVitals.onCLS((metric) => this.handleWebVitalMetric("CLS", metric.value));
    webVitals.onFID((metric) => this.handleWebVitalMetric("FID", metric.value));
    webVitals.onLCP((metric) => this.handleWebVitalMetric("LCP", metric.value));
    webVitals.onFCP((metric) => this.handleWebVitalMetric("FCP", metric.value));
    webVitals.onTTFB((metric) =>
      this.handleWebVitalMetric("TTFB", metric.value),
    );
  }

  /**
   * Handle Web Vital metric
   */
  private handleWebVitalMetric(name: string, value: number): void {
    const metrics: any = {
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: window.location.pathname,
      deviceType: this.deviceType,
      platform: this.platform,
      browserName: this.browserName,
      browserVersion: this.browserVersion,
    };

    // Map the metric to the expected field names
    switch (name) {
      case "CLS":
        metrics.cumulativeLayoutShift = value;
        break;
      case "FID":
        metrics.firstInputDelay = value;
        break;
      case "LCP":
        metrics.largestContentfulPaint = value;
        break;
      case "FCP":
        metrics.firstContentfulPaint = value;
        break;
      case "TTFB":
        // TTFB is not directly stored but can be derived from navigation timing
        break;
    }

    // Only send metrics if we have at least one of the core metrics
    if (
      metrics.cumulativeLayoutShift !== undefined ||
      metrics.firstInputDelay !== undefined ||
      metrics.largestContentfulPaint !== undefined ||
      metrics.firstContentfulPaint !== undefined
    ) {
      this.sendMetrics(metrics);
    }
  }

  /**
   * Collect Navigation Timing metrics
   */
  private collectNavigationTiming(): void {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    const metrics: any = {
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: window.location.pathname,
      deviceType: this.deviceType,
      platform: this.platform,
      browserName: this.browserName,
      browserVersion: this.browserVersion,
      // Calculate timing metrics
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      windowLoad: timing.loadEventEnd - navigationStart,
    };

    // Include resource timing if enabled
    if (this.includeResourceTiming) {
      metrics.resourceLoadTimes = this.collectResourceTiming();
    }

    // Include network information if enabled and available
    if (this.includeNetworkInformation) {
      metrics.networkInformation = this.collectNetworkInformation();
    }

    this.sendMetrics(metrics);
  }

  /**
   * Collect Resource Timing metrics
   */
  private collectResourceTiming(): any {
    if (!window.performance || !window.performance.getEntriesByType) {
      return null;
    }

    const resources = window.performance.getEntriesByType("resource");

    // Group resources by type
    const resourcesByType: any = {};

    resources.forEach((resource: any) => {
      const type = resource.initiatorType || "other";

      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }

      resourcesByType[type].push({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
      });
    });

    // Calculate summary stats for each type
    const summary: any = {};

    Object.keys(resourcesByType).forEach((type) => {
      const resources = resourcesByType[type];
      const totalDuration = resources.reduce(
        (sum: number, r: any) => sum + r.duration,
        0,
      );
      const totalSize = resources.reduce(
        (sum: number, r: any) => sum + r.size,
        0,
      );

      summary[type] = {
        count: resources.length,
        totalDuration,
        avgDuration: totalDuration / resources.length,
        totalSize,
        avgSize: totalSize / resources.length,
      };
    });

    return JSON.stringify(summary);
  }

  /**
   * Collect Network Information
   */
  private collectNetworkInformation(): any {
    // @ts-ignore - TypeScript doesn't know about the Network Information API
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (!connection) {
      return null;
    }

    return JSON.stringify({
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    });
  }

  /**
   * Send metrics to the backend API
   */
  private sendMetrics(metrics: any): void {
    // Use sendBeacon if available for more reliable delivery
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metrics)], {
        type: "application/json",
      });
      navigator.sendBeacon(this.apiEndpoint, blob);
    } else {
      // Fall back to fetch API
      fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metrics),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to send performance metrics:", error);
      });
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const sessionId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );

    localStorage.setItem("sessionId", sessionId);
    return sessionId;
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    const userAgent = navigator.userAgent;

    if (/iPad|tablet|Kindle|PlayBook/i.test(userAgent)) {
      return "tablet";
    } else if (
      /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      )
    ) {
      return "mobile";
    } else {
      return "desktop";
    }
  }

  /**
   * Detect platform
   */
  private detectPlatform(): string {
    const userAgent = navigator.userAgent;

    if (/Windows/i.test(userAgent)) {
      return "windows";
    } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
      return "mac";
    } else if (/Linux/i.test(userAgent)) {
      return "linux";
    } else if (/Android/i.test(userAgent)) {
      return "android";
    } else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
      return "ios";
    } else {
      return "other";
    }
  }

  /**
   * Detect browser name and version
   */
  private detectBrowser(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    let name = "unknown";
    let version = "unknown";

    if (/Edge|Edg/i.test(userAgent)) {
      name = "edge";
      version = userAgent.match(/(Edge|Edg)\/(\d+(\.\d+)?)/i)?.[2] || "unknown";
    } else if (/Chrome/i.test(userAgent)) {
      name = "chrome";
      version = userAgent.match(/Chrome\/(\d+(\.\d+)?)/i)?.[1] || "unknown";
    } else if (/Firefox/i.test(userAgent)) {
      name = "firefox";
      version = userAgent.match(/Firefox\/(\d+(\.\d+)?)/i)?.[1] || "unknown";
    } else if (/Safari/i.test(userAgent)) {
      name = "safari";
      version = userAgent.match(/Safari\/(\d+(\.\d+)?)/i)?.[1] || "unknown";
    } else if (/MSIE|Trident/i.test(userAgent)) {
      name = "ie";
      version = userAgent.match(/(MSIE |rv:)(\d+(\.\d+)?)/i)?.[2] || "unknown";
    }

    return { name, version };
  }
}

// Export a singleton instance
export const performanceMetrics = new PerformanceMetricsCollector();

// Initialize performance metrics collection
if (typeof window !== "undefined") {
  performanceMetrics.init();
}
