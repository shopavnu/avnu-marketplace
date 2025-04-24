import React, { useEffect, useRef, useState } from 'react';

interface InfiniteScrollProps {
  /**
   * Function to load more data
   */
  loadMore: () => Promise<void>;
  
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  
  /**
   * Whether data is currently being loaded
   */
  isLoading: boolean;
  
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Distance from the bottom (in pixels) to trigger the loadMore function
   * @default 200
   */
  threshold?: number;
  
  /**
   * Custom loading indicator
   */
  loadingIndicator?: React.ReactNode;
  
  /**
   * Custom end message
   */
  endMessage?: React.ReactNode;
  
  /**
   * Additional styles for the container
   */
  containerStyle?: React.CSSProperties;
}

/**
 * InfiniteScroll component that automatically loads more content when the user scrolls near the bottom
 */
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  loadMore,
  hasMore,
  isLoading,
  children,
  threshold = 200,
  loadingIndicator,
  endMessage,
  containerStyle,
}) => {
  const [shouldCheckScroll, setShouldCheckScroll] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && shouldCheckScroll) {
          loadMore().catch(error => {
            console.error('Error loading more items:', error);
          });
          // Temporarily disable scroll check to prevent multiple calls
          setShouldCheckScroll(false);
          setTimeout(() => setShouldCheckScroll(true), 500);
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.1,
      }
    );
    
    // Store a reference to the current loader element
    const currentLoaderRef = loaderRef.current;
    
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }
    
    return () => {
      // Use the stored reference in the cleanup function
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [loadMore, hasMore, isLoading, threshold, shouldCheckScroll]);
  
  return (
    <div style={containerStyle} className="infinite-scroll-container">
      {children}
      
      <div ref={loaderRef} className="infinite-scroll-loader py-4">
        {isLoading && (
          loadingIndicator || (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sage"></div>
            </div>
          )
        )}
        
        {!hasMore && !isLoading && (
          endMessage || (
            <div className="flex justify-center py-4">
              <p className="text-gray-500 text-sm">End of results</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;
