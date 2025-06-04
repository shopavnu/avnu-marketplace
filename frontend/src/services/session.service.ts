/**
 * Session tracking service for managing user sessions
 * This service helps track user behavior within a single visit
 * and synchronizes data with the backend for personalization
 */
import sessionSyncService from "./session-sync.service";

// Interaction type for detailed tracking
export enum InteractionType {
  SEARCH = "search",
  CLICK = "click",
  VIEW = "view",
  FILTER = "filter",
  SORT = "sort",
  IMPRESSION = "impression",
  DWELL = "dwell",
  ADD_TO_CART = "add_to_cart",
  PURCHASE = "purchase",
}

// Detailed interaction data
export interface Interaction {
  type: InteractionType;
  timestamp: number;
  data: Record<string, any>;
  durationMs?: number; // For dwell time tracking
}

// Page view tracking
export interface PageView {
  path: string;
  title: string;
  entryTime: number;
  exitTime?: number;
  dwellTimeMs?: number;
  referrer?: string;
}

// Session data interface
export interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivityTime: number;
  searchQueries: string[];
  clickedResults: string[];
  viewedCategories: string[];
  viewedBrands: string[];
  filters: Record<string, any>[];
  referrer?: string;
  // Enhanced tracking
  interactions: Interaction[];
  pageViews: PageView[];
  currentPage?: PageView;
  totalInteractions: number;
  deviceInfo?: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    deviceType: "mobile" | "tablet" | "desktop";
  };
}

class SessionService {
  private static SESSION_KEY = "avnu_session";
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private currentSession: SessionData | null = null;

  constructor() {
    // Initialize or restore session when service is created
    this.initSession();

    // Set up activity tracking
    if (typeof window !== "undefined") {
      // Update last activity time on user interaction
      ["click", "mousemove", "keypress", "scroll", "touchstart"].forEach(
        (event) => {
          window.addEventListener(event, () => this.updateLastActivity());
        },
      );

      // Check session timeout periodically
      setInterval(() => this.checkSessionTimeout(), 60000); // Check every minute
    }
  }

  /**
   * Initialize a new session or restore existing one
   */
  private initSession(): void {
    if (typeof window === "undefined") return;

    try {
      // Try to restore existing session
      const savedSession = localStorage.getItem(SessionService.SESSION_KEY);

      if (savedSession) {
        const parsedSession = JSON.parse(savedSession) as SessionData;

        // Check if session has timed out
        const now = Date.now();
        const timeSinceLastActivity = now - parsedSession.lastActivityTime;

        if (timeSinceLastActivity < SessionService.SESSION_TIMEOUT) {
          // Session is still valid
          this.currentSession = parsedSession;
          this.updateLastActivity();

          // Sync with backend
          sessionSyncService.initializeSession(parsedSession.sessionId);
          return;
        }
      }

      // Create new session if not found or timed out
      this.createNewSession();
    } catch (error) {
      console.error("Failed to initialize session:", error);
      this.createNewSession();
    }
  }

  /**
   * Create a new session
   */
  private createNewSession(): void {
    if (typeof window === "undefined") return;

    const sessionId = this.generateSessionId();
    const timestamp = Date.now();

    // Detect device type
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      )
    ) {
      deviceType = screenWidth < 768 ? "mobile" : "tablet";
    }

    // Create current page view
    const currentPage: PageView = {
      path: window.location.pathname,
      title: document.title,
      entryTime: timestamp,
      referrer: document.referrer || undefined,
    };

    this.currentSession = {
      sessionId,
      startTime: timestamp,
      lastActivityTime: timestamp,
      searchQueries: [],
      clickedResults: [],
      viewedCategories: [],
      viewedBrands: [],
      filters: [],
      referrer: document.referrer || undefined,
      // Initialize new tracking properties
      interactions: [],
      pageViews: [currentPage],
      currentPage,
      totalInteractions: 0,
      deviceInfo: {
        userAgent,
        screenWidth,
        screenHeight,
        deviceType,
      },
    };

    // Log session creation
    console.log(`New session created: ${sessionId}`);

    // Save to local storage
    this.saveSession();

    // Initialize session with backend
    sessionSyncService.initializeSession(sessionId);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return (
      "session_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Update last activity time
   */
  private updateLastActivity(): void {
    if (!this.currentSession) return;

    this.currentSession.lastActivityTime = Date.now();
    this.saveSession();
  }

  /**
   * Check if session has timed out
   */
  private checkSessionTimeout(): void {
    if (!this.currentSession) return;

    const now = Date.now();
    if (
      now - this.currentSession.lastActivityTime >=
      SessionService.SESSION_TIMEOUT
    ) {
      // Session timed out, create a new one
      this.createNewSession();
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (typeof window === "undefined" || !this.currentSession) return;

    try {
      localStorage.setItem(
        SessionService.SESSION_KEY,
        JSON.stringify(this.currentSession),
      );
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.currentSession?.sessionId || null;
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionData | null {
    return this.currentSession;
  }

  /**
   * Track a search query
   */
  trackSearchQuery(query: string): void {
    if (!this.currentSession) return;

    // Add query if it doesn't exist already
    if (!this.currentSession.searchQueries.includes(query)) {
      this.currentSession.searchQueries.push(query);

      // Add to detailed interactions
      this.trackInteraction(InteractionType.SEARCH, { query });
    }
  }

  /**
   * Track a clicked result
   */
  trackResultClick(resultId: string, position?: number, query?: string): void {
    if (!this.currentSession) return;

    // Add result ID if it doesn't exist already
    if (!this.currentSession.clickedResults.includes(resultId)) {
      this.currentSession.clickedResults.push(resultId);

      // Add to detailed interactions
      this.trackInteraction(InteractionType.CLICK, {
        resultId,
        position,
        query,
      });
    }
  }

  /**
   * Track a viewed category
   */
  trackCategoryView(categoryId: string): void {
    if (!this.currentSession) return;

    // Add category if it doesn't exist already
    if (!this.currentSession.viewedCategories.includes(categoryId)) {
      this.currentSession.viewedCategories.push(categoryId);

      // Add to detailed interactions
      this.trackInteraction(InteractionType.VIEW, {
        type: "category",
        categoryId,
      });
    }
  }

  /**
   * Track a viewed brand
   */
  trackBrandView(brandId: string): void {
    if (!this.currentSession) return;

    // Add brand if it doesn't exist already
    if (!this.currentSession.viewedBrands.includes(brandId)) {
      this.currentSession.viewedBrands.push(brandId);

      // Add to detailed interactions
      this.trackInteraction(InteractionType.VIEW, { type: "brand", brandId });
    }
  }

  /**
   * Track applied filter
   */
  trackFilter(filterType: string, filterValue: any): void {
    if (!this.currentSession) return;

    this.currentSession.filters.push({ type: filterType, value: filterValue });

    // Add to detailed interactions
    this.trackInteraction(InteractionType.FILTER, { filterType, filterValue });
  }

  /**
   * Track a generic interaction
   * @param type The type of interaction
   * @param data Additional data about the interaction
   * @param durationMs Optional duration of the interaction in milliseconds
   */
  trackInteraction(
    type: InteractionType,
    data: Record<string, any>,
    durationMs?: number,
  ): void {
    if (!this.currentSession) return;

    const interaction: Interaction = {
      type,
      timestamp: Date.now(),
      data,
      durationMs,
    };

    // Add to interactions array
    this.currentSession.interactions.push(interaction);
    this.currentSession.totalInteractions++;

    // Update last activity time
    this.updateLastActivity();

    // Sync with backend
    sessionSyncService.trackInteraction(
      this.currentSession.sessionId,
      type,
      data,
      durationMs,
    );
  }

  /**
   * Track a page view
   * @param path The path of the page
   * @param title The title of the page
   */
  trackPageView(path: string, title: string): void {
    if (!this.currentSession) return;

    const timestamp = Date.now();

    // If there's a current page, update its exit time and calculate dwell time
    if (this.currentSession.currentPage) {
      this.currentSession.currentPage.exitTime = timestamp;
      this.currentSession.currentPage.dwellTimeMs =
        timestamp - this.currentSession.currentPage.entryTime;

      // Track dwell time as an interaction
      if (this.currentSession.currentPage.dwellTimeMs > 1000) {
        // Only track if > 1 second
        this.trackInteraction(
          InteractionType.DWELL,
          {
            path: this.currentSession.currentPage.path,
            title: this.currentSession.currentPage.title,
          },
          this.currentSession.currentPage.dwellTimeMs,
        );
      }
    }

    // Create new page view
    const pageView: PageView = {
      path,
      title,
      entryTime: timestamp,
      referrer: this.currentSession.currentPage?.path,
    };

    // Update session
    this.currentSession.pageViews.push(pageView);
    this.currentSession.currentPage = pageView;

    // Track as an interaction
    this.trackInteraction(InteractionType.VIEW, { type: "page", path, title });
  }

  /**
   * Track search result impressions
   * @param resultIds Array of result IDs that were impressed
   * @param query The search query
   */
  trackSearchResultImpressions(resultIds: string[], query: string): void {
    if (!this.currentSession || !resultIds.length) return;

    // Track as an interaction
    this.trackInteraction(InteractionType.IMPRESSION, {
      resultIds,
      query,
      count: resultIds.length,
    });
  }

  /**
   * Track add to cart
   * @param productId Product ID
   * @param quantity Quantity added
   */
  trackAddToCart(productId: string, quantity: number = 1): void {
    if (!this.currentSession) return;

    // Track as an interaction
    this.trackInteraction(InteractionType.ADD_TO_CART, { productId, quantity });
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    if (!this.currentSession) return 0;

    return this.currentSession.lastActivityTime - this.currentSession.startTime;
  }
  
  /**
   * Add a custom event to the session
   * @param eventName Name of the custom event
   * @param eventData Additional data for the event
   */
  addCustomEvent(eventName: string, eventData: Record<string, any> = {}): void {
    if (!this.currentSession) return;
    
    // Track as a generic interaction with custom event type
    this.trackInteraction(
      InteractionType.CLICK, // Using CLICK as a generic type
      { 
        type: 'custom_event',
        eventName,
        ...eventData
      }
    );
    
    // Update session and save
    this.updateLastActivity();
    this.saveSession();
  }
}

// Create singleton instance
export const sessionService = new SessionService();

export default sessionService;
