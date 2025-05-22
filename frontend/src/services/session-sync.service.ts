/**
 * Service for syncing session data with the backend
 */
import { InteractionType } from "./session.service";
// Using fetch API instead of axios to avoid dependency issues
// If axios is needed, make sure to install it with: npm install axios

// Map frontend interaction types to backend interaction types
const interactionTypeMap: Record<string, string> = {
  search: "SEARCH",
  click: "CLICK",
  view: "VIEW",
  filter: "FILTER",
  sort: "SORT",
  impression: "IMPRESSION",
  dwell: "DWELL",
  add_to_cart: "ADD_TO_CART",
  purchase: "PURCHASE",
};

class SessionSyncService {
  private readonly API_BASE_URL = "/api/session";
  private syncQueue: Array<{
    sessionId: string;
    type: string;
    data: Record<string, any>;
    durationMs?: number;
  }> = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start sync interval when service is created
    if (typeof window !== "undefined") {
      this.syncInterval = setInterval(() => this.processSyncQueue(), 5000); // Sync every 5 seconds

      // Sync on page unload
      window.addEventListener("beforeunload", () => {
        this.processSyncQueueSync();
      });
    }
  }

  /**
   * Initialize a session with the backend
   * @param sessionId Session ID
   */
  async initializeSession(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.API_BASE_URL}/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error: unknown) {
      console.error(
        "Failed to initialize session:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Track an interaction with the backend
   * @param sessionId Session ID
   * @param type Interaction type
   * @param data Interaction data
   * @param durationMs Optional duration in milliseconds
   */
  trackInteraction(
    sessionId: string,
    type: InteractionType,
    data: Record<string, any>,
    durationMs?: number,
  ): void {
    // Add to sync queue
    this.syncQueue.push({
      sessionId,
      type: interactionTypeMap[type] || type,
      data,
      durationMs,
    });

    // Process queue if not already syncing
    if (!this.isSyncing && this.syncQueue.length >= 10) {
      this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue asynchronously
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;

    try {
      // Take up to 10 items from the queue
      const itemsToSync = this.syncQueue.splice(0, 10);

      // Send items in batch
      await Promise.all(
        itemsToSync.map((item) =>
          fetch(`${this.API_BASE_URL}/track`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          }).catch((error: unknown) => {
            console.error(
              "Failed to sync interaction:",
              error instanceof Error ? error.message : error,
            );
            // Put failed items back in the queue
            this.syncQueue.push(item);
          }),
        ),
      );
    } finally {
      this.isSyncing = false;

      // If there are more items, process them
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 100);
      }
    }
  }

  /**
   * Process the sync queue synchronously (for beforeunload)
   */
  private processSyncQueueSync(): void {
    if (this.syncQueue.length === 0) return;

    try {
      // Take all items from the queue
      const itemsToSync = [...this.syncQueue];
      this.syncQueue = [];

      // Use synchronous XMLHttpRequest
      itemsToSync.forEach((item) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${this.API_BASE_URL}/track`, false); // false = synchronous
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(item));
      });
    } catch (error) {
      console.error("Failed to sync interactions on unload:", error);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Process any remaining items
    this.processSyncQueueSync();
  }
}

// Create singleton instance
const sessionSyncService = new SessionSyncService();

export default sessionSyncService;
