import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { analyticsService } from "../services/analytics.service";
import sessionService, { InteractionType } from "../services/session.service";

interface DwellTimeTrackingOptions {
  resultId: string;
  query: string;
  position?: number;
}

/**
 * Hook to track dwell time on a page
 * Measures the time a user spends on a page and reports it when they navigate away
 */
export function useDwellTimeTracking({
  resultId,
  query,
  position,
}: DwellTimeTrackingOptions) {
  const entryTime = useRef<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    // Reset entry time when the component mounts
    entryTime.current = Date.now();

    // Function to track dwell time when user leaves the page
    const trackDwellTime = () => {
      const exitTime = Date.now();
      const dwellTimeMs = exitTime - entryTime.current;

      // Only track if user spent at least 1 second on the page
      // This helps filter out accidental clicks or bots
      if (dwellTimeMs >= 1000) {
        // Track in analytics service
        analyticsService.trackSearchResultDwellTime(
          resultId,
          query,
          dwellTimeMs,
          position,
        );

        // Also track in session service for personalization
        sessionService.trackInteraction(
          InteractionType.DWELL,
          {
            resultId,
            query,
            position,
            dwellTimeMs,
          },
          dwellTimeMs,
        );
      }
    };

    // Add event listeners for page navigation and tab/window close
    router.events.on("routeChangeStart", trackDwellTime);
    window.addEventListener("beforeunload", trackDwellTime);

    // Clean up event listeners
    return () => {
      router.events.off("routeChangeStart", trackDwellTime);
      window.removeEventListener("beforeunload", trackDwellTime);

      // Also track dwell time when component unmounts
      trackDwellTime();
    };
  }, [resultId, query, position, router.events]);
}

export default useDwellTimeTracking;
