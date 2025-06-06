import React from 'react';
import { analyticsService } from '../../services/analytics.service';

interface CursorPaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  totalResults: number;
  currentCount: number;
}

export const CursorPagination: React.FC<CursorPaginationProps> = ({ 
  hasMore, 
  isLoading,
  onLoadMore,
  totalResults,
  currentCount
}) => {
  const handleLoadMore = () => {
    // Track pagination event
    analyticsService.trackEvent({
      event: 'pagination_used',
      properties: {
        current_count: currentCount,
        total_count: totalResults,
        method: 'cursor',
      }
    });
    
    onLoadMore();
  };
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-sage/20 border-t-sage rounded-full animate-spin"></div>
          <p className="text-neutral-gray text-sm">Loading more products...</p>
        </div>
      ) : hasMore ? (
        <>
          <p className="text-neutral-gray text-sm">
            Showing {currentCount} of {totalResults} products
          </p>
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 rounded-full bg-sage hover:bg-sage-dark transition-colors duration-200 text-white font-medium"
          >
            Load More
          </button>
        </>
      ) : (
        <p className="text-neutral-gray text-sm">
          {totalResults > 0 
            ? `Showing all ${totalResults} products` 
            : 'No products found'}
        </p>
      )}
    </div>
  );
};

export default CursorPagination;
