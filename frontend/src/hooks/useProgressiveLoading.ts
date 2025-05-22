import { useState, useEffect, useRef, useCallback } from "react";
import useIntersectionObserver from "./useIntersectionObserver";

export interface ProgressiveLoadingOptions<T> {
  /**
   * Initial data to display before any loading occurs
   */
  initialData?: T[];

  /**
   * Function to load more data, should return a promise with the new data
   */
  loadMoreFn: (page: number, pageSize: number) => Promise<T[]>;

  /**
   * Number of items to load per page
   */
  pageSize?: number;

  /**
   * Distance from the bottom of the viewport to trigger loading more data (in pixels)
   */
  threshold?: number;

  /**
   * Whether to enable loading more data
   */
  enabled?: boolean;

  /**
   * Maximum number of items to load
   */
  maxItems?: number;

  /**
   * Callback when data is loaded
   */
  onDataLoaded?: (newData: T[], allData: T[]) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Delay between loading more data (in ms)
   */
  loadingDelay?: number;
}

export interface ProgressiveLoadingResult<T> {
  /**
   * All loaded data
   */
  data: T[];

  /**
   * Whether data is currently being loaded
   */
  isLoading: boolean;

  /**
   * Whether there is more data to load
   */
  hasMore: boolean;

  /**
   * Current page number
   */
  page: number;

  /**
   * Function to manually load more data
   */
  loadMore: () => Promise<void>;

  /**
   * Ref callback to attach to the element that should trigger loading more data
   */
  loadMoreRef: (element: HTMLDivElement | null) => void;

  /**
   * Whether an error occurred during loading
   */
  error: Error | null;

  /**
   * Reset the loading state and start over
   */
  reset: () => void;

  /**
   * Whether the initial data has been loaded
   */
  isInitialLoading: boolean;
}

/**
 * Hook for implementing progressive loading of content as the user scrolls
 *
 * @param options Configuration options for progressive loading
 * @returns Loading state and methods for managing progressive loading
 */
function useProgressiveLoading<T>({
  initialData = [],
  loadMoreFn,
  pageSize = 10,
  threshold = 300,
  enabled = true,
  maxItems = Infinity,
  onDataLoaded,
  onError,
  loadingDelay = 0,
}: ProgressiveLoadingOptions<T>): ProgressiveLoadingResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(
    initialData.length === 0,
  );
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up intersection observer for infinite scroll
  const { ref: loadMoreRef, isIntersecting: shouldLoadMore } =
    useIntersectionObserver({
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0.1,
      triggerOnce: false,
      skip: !enabled || isLoading || !hasMore || data.length >= maxItems,
    });

  // Function to load more data
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || data.length >= maxItems) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a timeout for loading delay if specified
      if (loadingDelay > 0) {
        await new Promise((resolve) => {
          loadingTimeoutRef.current = setTimeout(resolve, loadingDelay);
        });
      }

      // Load more data
      const newData = await loadMoreFn(page, pageSize);

      // Update state based on the result
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        const updatedData = [...data, ...newData];
        setData(updatedData);
        setPage((prevPage) => prevPage + 1);
        setHasMore(
          newData.length === pageSize && updatedData.length < maxItems,
        );

        // Call onDataLoaded callback if provided
        if (onDataLoaded) {
          onDataLoaded(newData, updatedData);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [
    isLoading,
    hasMore,
    data,
    maxItems,
    loadMoreFn,
    page,
    pageSize,
    loadingDelay,
    onDataLoaded,
    onError,
  ]);

  // Load more data when intersection observer triggers
  useEffect(() => {
    if (
      shouldLoadMore &&
      enabled &&
      !isLoading &&
      hasMore &&
      data.length < maxItems
    ) {
      loadMore();
    }
  }, [
    shouldLoadMore,
    enabled,
    isLoading,
    hasMore,
    data.length,
    maxItems,
    loadMore,
  ]);

  // Load initial data if no initial data was provided
  useEffect(() => {
    if (
      initialData.length === 0 &&
      enabled &&
      !isLoading &&
      hasMore &&
      page === 1
    ) {
      loadMore();
    }
  }, [initialData.length, enabled, isLoading, hasMore, page, loadMore]);

  // Reset function to start over
  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setIsInitialLoading(initialData.length === 0);
    setHasMore(true);
    setPage(1);
    setError(null);

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [initialData]);

  return {
    data,
    isLoading,
    hasMore,
    page,
    loadMore,
    loadMoreRef,
    error,
    reset,
    isInitialLoading,
  };
}

export default useProgressiveLoading;
