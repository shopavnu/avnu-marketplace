import { useState, useEffect, RefObject, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface ScrollPosition {
  scrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
  isScrolled: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollPercentage: number;
}

/**
 * Hook to detect when an element is visible in the viewport
 */
export function useInView(
  ref: RefObject<HTMLElement>,
  options: ScrollAnimationOptions = {}
) {
  const [isInView, setIsInView] = useState(false);
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementInView = entry.isIntersecting;
        setIsInView(isElementInView);

        if (isElementInView && triggerOnce) {
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold, rootMargin, triggerOnce]);

  return isInView;
}

/**
 * Hook to track scroll position and direction
 */
export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    scrollDirection: 'none',
    isScrolled: false,
    isAtTop: true,
    isAtBottom: false,
    scrollPercentage: 0,
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const previousScrollY = scrollPosition.scrollY;
    const scrollDirection = 
      currentScrollY > previousScrollY ? 'down' : 
      currentScrollY < previousScrollY ? 'up' : 'none';
    
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    const windowHeight = window.innerHeight;
    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage = scrollableHeight > 0 
      ? Math.min(Math.max(currentScrollY / scrollableHeight, 0), 1) * 100
      : 0;
    
    setScrollPosition({
      scrollY: currentScrollY,
      scrollDirection,
      isScrolled: currentScrollY > 50,
      isAtTop: currentScrollY < 10,
      isAtBottom: Math.abs(currentScrollY + windowHeight - documentHeight) < 10,
      scrollPercentage,
    });
  }, [scrollPosition.scrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return scrollPosition;
}

/**
 * Hook to animate elements based on scroll position
 */
export function useScrollAnimation(
  ref: RefObject<HTMLElement>,
  options: ScrollAnimationOptions = {}
) {
  const isInView = useInView(ref, options);
  const { scrollY, scrollDirection, scrollPercentage } = useScrollPosition();
  
  return {
    isInView,
    scrollY,
    scrollDirection,
    scrollPercentage,
    // Calculate animation progress based on element position
    animationProgress: isInView ? Math.min(Math.max((scrollPercentage - 10) / 80, 0), 1) : 0,
  };
}

export default useScrollAnimation;
