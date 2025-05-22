import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSession } from "../../hooks/useSession";

interface ScrollTrackerProps {
  pageType: string;
  visibleProductIds?: string[];
  throttleMs?: number;
  children: React.ReactNode;
}

/**
 * Component that tracks scroll depth and reports it to the backend
 * for personalization purposes
 */
const ScrollTracker: React.FC<ScrollTrackerProps> = ({
  pageType,
  visibleProductIds = [],
  throttleMs = 1000,
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const { sessionId, trackInteraction } = useSession();
  const [lastScrollDepth, setLastScrollDepth] = useState(0);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only track if we have a valid session
    if (!sessionId) return;

    const trackScrollDepth = () => {
      if (!scrollableRef.current) return;

      const scrollElement = scrollableRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
      );
      const clientHeight =
        window.innerHeight || document.documentElement.clientHeight;

      // Calculate scroll percentage (0-100)
      const scrollPercentage = Math.min(
        100,
        Math.round((scrollTop / (scrollHeight - clientHeight)) * 100),
      );

      // Only track if scroll depth has changed significantly (at least 5%)
      if (Math.abs(scrollPercentage - lastScrollDepth) >= 5) {
        setLastScrollDepth(scrollPercentage);

        // Throttle tracking to prevent too many events
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
        }

        throttleTimerRef.current = setTimeout(() => {
          trackInteraction("scroll_depth", {
            pageType,
            scrollPercentage,
            visibleProductIds,
            timestamp: new Date().toISOString(),
            isAuthenticated,
          });
        }, throttleMs);
      }
    };

    // Track initial scroll position
    trackScrollDepth();

    // Add scroll event listener
    window.addEventListener("scroll", trackScrollDepth);

    // Clean up
    return () => {
      window.removeEventListener("scroll", trackScrollDepth);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [
    sessionId,
    pageType,
    visibleProductIds,
    throttleMs,
    lastScrollDepth,
    isAuthenticated,
    trackInteraction,
  ]);

  return (
    <div ref={scrollableRef} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
};

export default ScrollTracker;
