import { useState, useEffect, useRef, useCallback } from 'react';

interface IntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  skip?: boolean;
}

/**
 * A hook for detecting when an element enters or exits the viewport
 * Uses the Intersection Observer API for efficient detection
 * 
 * @param options Configuration options for the intersection observer
 * @returns Object containing the ref to attach to the target element and the entry state
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  skip = false
}: IntersectionOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry);
    setIsIntersecting(entry.isIntersecting);
    
    if (triggerOnce && entry.isIntersecting) {
      setHasTriggered(true);
      
      // Clean up observer if we only need to trigger once
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    }
  }, [triggerOnce]);

  // Set up the intersection observer
  useEffect(() => {
    // Skip setup if requested or if we've already triggered once
    if (skip || (triggerOnce && hasTriggered)) return;
    
    // Clean up previous observer
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
      observerRef.current = null;
    }
    
    const observer = new IntersectionObserver(updateEntry, {
      root,
      rootMargin,
      threshold
    });
    
    observerRef.current = observer;
    
    // Observe the element if it exists
    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (observer && currentElement) {
        observer.unobserve(currentElement);
        observer.disconnect();
      }
    };
  }, [root, rootMargin, threshold, skip, triggerOnce, hasTriggered, updateEntry]);

  // Re-observe if the element changes
  const setRef = useCallback((element: T | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    
    elementRef.current = element;
    
    if (element && observerRef.current && !skip && !(triggerOnce && hasTriggered)) {
      observerRef.current.observe(element);
    }
  }, [skip, triggerOnce, hasTriggered]);

  return {
    ref: setRef,
    entry,
    isIntersecting,
    hasTriggered
  };
}

export default useIntersectionObserver;
