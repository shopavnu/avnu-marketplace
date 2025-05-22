/**
 * User Behavior Analytics Collector
 *
 * This utility collects user behavior data including vertical scrolling patterns
 * and interaction heatmap data, then sends it to the backend API for analysis.
 */

interface UserBehaviorOptions {
  scrollApiEndpoint?: string;
  heatmapApiEndpoint?: string;
  heatmapBatchApiEndpoint?: string;
  scrollSampleRate?: number;
  heatmapSampleRate?: number;
  scrollThrottleMs?: number;
  heatmapThrottleMs?: number;
  batchSize?: number;
}

export class UserBehaviorAnalytics {
  private scrollApiEndpoint: string;
  private heatmapApiEndpoint: string;
  private heatmapBatchApiEndpoint: string;
  private scrollSampleRate: number;
  private heatmapSampleRate: number;
  private scrollThrottleMs: number;
  private heatmapThrottleMs: number;
  private batchSize: number;
  private sessionId: string;
  private userId: string | null;
  private deviceType: string;
  private platform: string;
  private scrollData: {
    pagePath: string;
    maxScrollDepth: number;
    pageHeight: number;
    scrollCount: number;
    startTime: number;
    scrollDepthTimestamps: { depth: number; timestamp: number }[];
  } | null = null;
  private heatmapBuffer: any[] = [];
  private scrollTimeout: any = null;
  private isTracking: boolean = false;
  private viewportDimensions: { width: number; height: number };

  constructor(options: UserBehaviorOptions = {}) {
    this.scrollApiEndpoint =
      options.scrollApiEndpoint || "/analytics/user-behavior/scroll";
    this.heatmapApiEndpoint =
      options.heatmapApiEndpoint || "/analytics/user-behavior/heatmap";
    this.heatmapBatchApiEndpoint =
      options.heatmapBatchApiEndpoint ||
      "/analytics/user-behavior/heatmap/batch";
    this.scrollSampleRate = options.scrollSampleRate || 0.25; // 25% sampling by default
    this.heatmapSampleRate = options.heatmapSampleRate || 0.1; // 10% sampling by default
    this.scrollThrottleMs = options.scrollThrottleMs || 200; // Throttle scroll events
    this.heatmapThrottleMs = options.heatmapThrottleMs || 100; // Throttle heatmap events
    this.batchSize = options.batchSize || 20; // Number of heatmap events to batch

    // Get session ID from localStorage or create a new one
    this.sessionId =
      localStorage.getItem("sessionId") || this.generateSessionId();

    // Get user ID if available
    this.userId = localStorage.getItem("userId");

    // Detect device type
    this.deviceType = this.detectDeviceType();

    // Detect platform
    this.platform = this.detectPlatform();

    // Get viewport dimensions
    this.viewportDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Initialize user behavior tracking
   */
  public init(): void {
    // Check if we should track scrolling based on sample rate
    if (Math.random() <= this.scrollSampleRate) {
      this.initScrollTracking();
    }

    // Check if we should track heatmap data based on sample rate
    if (Math.random() <= this.heatmapSampleRate) {
      this.initHeatmapTracking();
    }

    // Set tracking flag
    this.isTracking = true;

    // Set up unload handler to send final data
    window.addEventListener("beforeunload", () => {
      this.sendFinalData();
    });
  }

  /**
   * Initialize scroll tracking
   */
  private initScrollTracking(): void {
    // Initialize scroll data
    this.resetScrollData();

    // Add scroll event listener with throttling
    let lastScrollTime = 0;

    window.addEventListener("scroll", () => {
      const now = Date.now();

      // Throttle scroll events
      if (now - lastScrollTime < this.scrollThrottleMs) {
        return;
      }

      lastScrollTime = now;
      this.trackScrollEvent();
    });

    // Track initial scroll position
    this.trackScrollEvent();

    // Set up interval to periodically send scroll data
    setInterval(() => {
      if (this.scrollData && Date.now() - this.scrollData.startTime > 30000) {
        this.sendScrollData();
        this.resetScrollData();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Initialize heatmap tracking
   */
  private initHeatmapTracking(): void {
    // Track clicks
    document.addEventListener("click", (event) => {
      this.trackInteraction(event, "click");
    });

    // Track hovers with throttling
    let lastHoverTime = 0;

    document.addEventListener("mousemove", (event) => {
      const now = Date.now();

      // Throttle hover events
      if (now - lastHoverTime < this.heatmapThrottleMs) {
        return;
      }

      lastHoverTime = now;

      // Only track hover if the mouse has been in the same area for a while
      setTimeout(() => {
        const newEvent = document.createEvent("MouseEvents");
        newEvent.initMouseEvent(
          "mousemove",
          true,
          true,
          window,
          0,
          event.screenX,
          event.screenY,
          event.clientX,
          event.clientY,
          event.ctrlKey,
          event.altKey,
          event.shiftKey,
          event.metaKey,
          event.button,
          null,
        );

        if (
          Math.abs(event.clientX - (newEvent as MouseEvent).clientX) < 10 &&
          Math.abs(event.clientY - (newEvent as MouseEvent).clientY) < 10
        ) {
          this.trackInteraction(event, "hover");
        }
      }, 500); // Wait 500ms to confirm it's a hover
    });

    // Track form interactions
    document.addEventListener("input", (event) => {
      this.trackInteraction(event, "form_interaction");
    });

    // Track text selections
    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Create a partial MouseEvent-like object with the properties we need
        // Cast to unknown first and then to MouseEvent to avoid TypeScript errors
        const event = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          target: range.commonAncestorContainer as Node,
          type: "selection",
          bubbles: true,
        } as unknown as MouseEvent;

        this.trackInteraction(event, "selection");
      }
    });

    // Track scroll pauses
    let scrollTimeout: any = null;

    window.addEventListener("scroll", () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        // Create a synthetic event at the center of the viewport
        const event = {
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
          target: document.elementFromPoint(
            window.innerWidth / 2,
            window.innerHeight / 2,
          ),
        } as MouseEvent;

        this.trackInteraction(event, "scroll_pause");
      }, 1000); // Wait 1 second after scrolling stops
    });

    // Set up interval to periodically send heatmap data
    setInterval(() => {
      if (this.heatmapBuffer.length >= this.batchSize) {
        this.sendHeatmapData();
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Track scroll event
   */
  private trackScrollEvent(): void {
    if (!this.scrollData) {
      this.resetScrollData();
    }

    // Get current scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight,
    );

    // Update scroll data
    this.scrollData!.scrollCount++;
    this.scrollData!.pageHeight = pageHeight;

    // Update max scroll depth
    if (scrollTop > this.scrollData!.maxScrollDepth) {
      this.scrollData!.maxScrollDepth = scrollTop;

      // Record timestamp for this scroll depth
      this.scrollData!.scrollDepthTimestamps.push({
        depth: scrollTop,
        timestamp: Date.now(),
      });
    }

    // Schedule sending data after user stops scrolling
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      if (this.scrollData!.scrollCount > 5) {
        this.sendScrollData();
      }
    }, 2000); // Wait 2 seconds after scrolling stops
  }

  /**
   * Track user interaction for heatmap
   */
  private trackInteraction(
    event: MouseEvent | any,
    interactionType: string,
  ): void {
    // Get coordinates relative to the document
    const x = event.clientX;
    const y = event.clientY + window.scrollY;

    // Get target element
    const target = event.target;

    if (!target) {
      return;
    }

    // Get element details
    let elementSelector = "";
    let elementId = "";
    let elementText = "";

    try {
      // Try to get a CSS selector for the element
      elementSelector = this.getCssSelector(target);

      // Get element ID if available
      elementId = target.id || "";

      // Get element text content (truncated)
      elementText = (target.textContent || "").trim().substring(0, 100);
    } catch (error) {
      console.error("Error getting element details:", error);
    }

    // Create heatmap data entry
    const heatmapData = {
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: window.location.pathname,
      interactionType,
      xPosition: Math.round(x),
      yPosition: Math.round(y),
      elementSelector,
      elementId,
      elementText,
      deviceType: this.deviceType,
      platform: this.platform,
      viewportDimensions: JSON.stringify(this.viewportDimensions),
      timestamp: new Date().toISOString(),
    };

    // Add to buffer
    this.heatmapBuffer.push(heatmapData);

    // Send data if buffer is full
    if (this.heatmapBuffer.length >= this.batchSize) {
      this.sendHeatmapData();
    }
  }

  /**
   * Send scroll data to the backend API
   */
  private sendScrollData(): void {
    if (!this.scrollData || this.scrollData.scrollCount === 0) {
      return;
    }

    // Calculate dwell time
    const dwellTimeSeconds = Math.round(
      (Date.now() - this.scrollData.startTime) / 1000,
    );

    // Calculate max scroll percentage
    const maxScrollPercentage =
      this.scrollData.pageHeight > 0
        ? (this.scrollData.maxScrollDepth / this.scrollData.pageHeight) * 100
        : 0;

    // Prepare data to send
    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      pagePath: this.scrollData.pagePath,
      direction: "vertical",
      maxScrollDepth: this.scrollData.maxScrollDepth,
      pageHeight: this.scrollData.pageHeight,
      maxScrollPercentage,
      scrollCount: this.scrollData.scrollCount,
      dwellTimeSeconds,
      scrollDepthTimestamps: JSON.stringify(
        this.scrollData.scrollDepthTimestamps,
      ),
      deviceType: this.deviceType,
      platform: this.platform,
      viewportDimensions: JSON.stringify(this.viewportDimensions),
    };

    // Send data using sendBeacon if available
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      navigator.sendBeacon(this.scrollApiEndpoint, blob);
    } else {
      // Fall back to fetch API
      fetch(this.scrollApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to send scroll data:", error);
      });
    }
  }

  /**
   * Send heatmap data to the backend API
   */
  private sendHeatmapData(): void {
    if (this.heatmapBuffer.length === 0) {
      return;
    }

    // Make a copy of the buffer and clear it
    const dataToSend = [...this.heatmapBuffer];
    this.heatmapBuffer = [];

    // Send data using sendBeacon if available
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(dataToSend)], {
        type: "application/json",
      });
      navigator.sendBeacon(this.heatmapBatchApiEndpoint, blob);
    } else {
      // Fall back to fetch API
      fetch(this.heatmapBatchApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to send heatmap data:", error);
      });
    }
  }

  /**
   * Send final data before page unload
   */
  private sendFinalData(): void {
    if (this.isTracking) {
      // Send scroll data
      this.sendScrollData();

      // Send heatmap data
      this.sendHeatmapData();
    }
  }

  /**
   * Reset scroll data
   */
  private resetScrollData(): void {
    this.scrollData = {
      pagePath: window.location.pathname,
      maxScrollDepth: window.pageYOffset || document.documentElement.scrollTop,
      pageHeight: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight,
      ),
      scrollCount: 0,
      startTime: Date.now(),
      scrollDepthTimestamps: [],
    };
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
   * Get CSS selector for an element
   */
  private getCssSelector(element: Element): string {
    if (!element) return "";
    if (element.id) return `#${element.id}`;

    let selector = element.tagName.toLowerCase();

    if (element.className) {
      const classes = element.className.split(" ").filter((c) => c);
      if (classes.length > 0) {
        selector += `.${classes.join(".")}`;
      }
    }

    // Add parent context (up to 3 levels)
    let parent = element.parentElement;
    let depth = 0;

    while (parent && depth < 3) {
      let parentSelector = parent.tagName.toLowerCase();

      if (parent.id) {
        parentSelector = `#${parent.id}`;
        selector = `${parentSelector} > ${selector}`;
        break;
      } else if (parent.className) {
        const classes = parent.className.split(" ").filter((c) => c);
        if (classes.length > 0) {
          parentSelector += `.${classes.join(".")}`;
        }
      }

      selector = `${parentSelector} > ${selector}`;
      parent = parent.parentElement;
      depth++;
    }

    return selector;
  }
}

// Export a singleton instance
export const userBehaviorAnalytics = new UserBehaviorAnalytics();

// Initialize user behavior tracking
if (typeof window !== "undefined") {
  userBehaviorAnalytics.init();
}
