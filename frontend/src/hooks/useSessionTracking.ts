import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import sessionService from '../services/session.service';

/**
 * Hook for tracking page views and session data
 * @returns Session tracking utilities
 */
export const useSessionTracking = () => {
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Track page views
  useEffect(() => {
    // Skip on first render to avoid duplicate tracking
    // Next.js can trigger multiple route changes on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Track the page view
    const path = router.asPath;
    const title = document.title;
    sessionService.trackPageView(path, title);

    // Setup listener for route changes
    const handleRouteChange = (url: string) => {
      // Wait for the page to fully load before tracking
      setTimeout(() => {
        sessionService.trackPageView(url, document.title);
      }, 100);
    };

    // Subscribe to route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.asPath, router]);

  return {
    // Return session ID for components that need it
    sessionId: sessionService.getSessionId(),
    
    // Tracking methods
    trackInteraction: sessionService.trackInteraction.bind(sessionService),
    trackSearchQuery: sessionService.trackSearchQuery.bind(sessionService),
    trackResultClick: sessionService.trackResultClick.bind(sessionService),
    trackSearchResultImpressions: sessionService.trackSearchResultImpressions.bind(sessionService),
    trackAddToCart: sessionService.trackAddToCart.bind(sessionService),
    
    // Session data
    getSessionDuration: sessionService.getSessionDuration.bind(sessionService),
    getSessionData: sessionService.getSessionData.bind(sessionService),
  };
};

export default useSessionTracking;
