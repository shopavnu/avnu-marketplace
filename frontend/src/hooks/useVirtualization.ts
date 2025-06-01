import { useState, useEffect, useRef, useMemo } from "react";

interface VirtualizationOptions {
  itemHeight: number;
  overscan?: number;
  itemCount: number;
  scrollingDelay?: number;
  containerHeight?: number;
}

interface VirtualizationResult {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    size: number;
  }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollTo: (index: number) => void;
  isScrolling: boolean;
}

/**
 * A hook for virtualizing long lists of elements
 * Renders only the visible items and a configurable number of items above and below the viewport
 *
 * @param options Configuration options for virtualization
 * @returns Virtualization state and methods
 */
export function useVirtualization({
  itemHeight,
  overscan = 3,
  itemCount,
  scrollingDelay = 150,
  containerHeight,
}: VirtualizationOptions): VirtualizationResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [clientHeight, setClientHeight] = useState(containerHeight || 0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculate visible range
  const { virtualItems, startIndex, endIndex, totalHeight } = useMemo(() => {
    // If we don't have a container height yet, return empty state
    if (!clientHeight && !containerHeight) {
      return { virtualItems: [], startIndex: 0, endIndex: 0, totalHeight: 0 };
    }

    const height = containerHeight || clientHeight;

    // Calculate the range of visible items
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + height) / itemHeight) + overscan,
    );

    // Generate virtual items
    const virtualItems = [];
    for (let i = start; i <= end; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        size: itemHeight,
      });
    }

    return {
      virtualItems,
      startIndex: start,
      endIndex: end,
      totalHeight: itemCount * itemHeight,
    };
  }, [
    scrollTop,
    clientHeight,
    containerHeight,
    itemHeight,
    itemCount,
    overscan,
  ]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial client height
    if (!containerHeight) {
      setClientHeight(container.clientHeight);
    }

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      setIsScrolling(true);

      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Set new timeout to mark scrolling as finished
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    };

    container.addEventListener("scroll", handleScroll);

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { height } = entries[0].contentRect;
      if (!containerHeight && height > 0) {
        setClientHeight(height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [containerHeight, scrollingDelay]);

  // Scroll to a specific item
  const scrollTo = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  };

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    containerRef,
    scrollTo,
    isScrolling,
  };
}

export default useVirtualization;
