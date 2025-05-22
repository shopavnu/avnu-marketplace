import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useAuth } from "./useAuth";

// Define interaction types
export type InteractionType =
  | "search"
  | "click"
  | "view"
  | "filter"
  | "sort"
  | "impression"
  | "dwell"
  | "add_to_cart"
  | "purchase"
  | "scroll_depth"
  | "product_view"
  | "RECOMMENDATION_IMPRESSION"
  | "RECOMMENDATION_CLICK"
  | "RECOMMENDATION_CONVERSION";

/**
 * Hook for managing user session and tracking interactions
 */
export const useSession = () => {
  const { isAuthenticated, user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session on component mount
  useEffect(() => {
    // Try to get existing session ID from localStorage
    let existingSessionId = localStorage.getItem("avnu_session_id");

    // If no session ID exists, create a new one
    if (!existingSessionId) {
      existingSessionId = uuidv4();
      localStorage.setItem("avnu_session_id", existingSessionId);
    }

    setSessionId(existingSessionId);

    // If user is authenticated, associate session with user
    if (isAuthenticated && user?.id && existingSessionId) {
      axios
        .post("/api/personalization/session/associate", {
          sessionId: existingSessionId,
          userId: user.id,
        })
        .catch((error) => {
          console.error("Failed to associate session with user:", error);
        });
    }
  }, [isAuthenticated, user]);

  // Function to track user interactions
  const trackInteraction = useCallback(
    async (
      type: InteractionType,
      data: Record<string, any>,
      durationMs?: number,
    ) => {
      if (!sessionId) return;

      try {
        await axios.post("/api/personalization/session/track", {
          sessionId,
          type,
          data,
          durationMs,
          userId: isAuthenticated && user ? user.id : undefined,
        });
      } catch (error) {
        console.error("Failed to track interaction:", error);
      }
    },
    [sessionId, isAuthenticated, user],
  );

  // Function to get recent interactions
  const getRecentInteractions = useCallback(
    async (type?: InteractionType, limit: number = 20) => {
      if (!sessionId) return [];

      try {
        const response = await axios.get(
          "/api/personalization/session/interactions",
          {
            params: { sessionId, type, limit },
          },
        );
        return response.data;
      } catch (error) {
        console.error("Failed to get recent interactions:", error);
        return [];
      }
    },
    [sessionId],
  );

  return {
    sessionId,
    trackInteraction,
    getRecentInteractions,
  };
};
