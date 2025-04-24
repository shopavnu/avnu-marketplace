import { useEffect, useRef, useState } from 'react';
import sessionService from '../services/session.service';

interface ImpressionTrackingOptions {
  /**
   * The threshold of visibility required to count as an impression (0-1)
   * Default: 0.5 (50% visible)
   */
  threshold?: number;
  
  /**
   * The search query associated with these results
   */
  searchQuery?: string;
  
  /**
   * Whether to track impressions (can be disabled for performance)
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Hook for tracking search result impressions using Intersection Observer
 * @param options Configuration options
 * @returns Functions and refs for tracking impressions
 */
export const useImpressionTracking = (options: ImpressionTrackingOptions = {}) => {
  const { 
    threshold = 0.5, 
    searchQuery = '',
    enabled = true 
  } = options;
  
  // Keep track of which results have already been tracked
  const [trackedImpressions, setTrackedImpressions] = useState<Set<string>>(new Set());
  
  // Reference to the observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Initialize observer
  useEffect(() => {
    if (!enabled || !searchQuery) return;
    
    // Cleanup function
    const cleanup = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newlyVisibleResults: string[] = [];
        
        entries.forEach(entry => {
          const resultId = entry.target.getAttribute('data-result-id');
          
          if (resultId && entry.isIntersecting && !trackedImpressions.has(resultId)) {
            newlyVisibleResults.push(resultId);
            setTrackedImpressions(prev => {
              const newSet = new Set(Array.from(prev));
              newSet.add(resultId);
              return newSet;
            });
          }
        });
        
        if (newlyVisibleResults.length > 0 && searchQuery) {
          // Track impressions in session service
          sessionService.trackSearchResultImpressions(newlyVisibleResults, searchQuery);
        }
      },
      { threshold }
    );
    
    return cleanup;
  }, [enabled, searchQuery, threshold, trackedImpressions]);
  
  /**
   * Register an element to be tracked for impressions
   * @param element The DOM element to track
   * @param resultId The ID of the result
   */
  const trackElement = (element: HTMLElement | null, resultId: string) => {
    if (!element || !observerRef.current || !enabled || trackedImpressions.has(resultId)) return;
    
    // Set data attribute for the observer
    element.setAttribute('data-result-id', resultId);
    
    // Start observing
    observerRef.current.observe(element);
  };
  
  /**
   * Reset tracking (e.g., when search results change)
   */
  const resetTracking = () => {
    // Disconnect current observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Reset tracked impressions
    setTrackedImpressions(new Set());
  };
  
  return {
    trackElement,
    resetTracking,
    trackedImpressions: Array.from(trackedImpressions)
  };
};

export default useImpressionTracking;
