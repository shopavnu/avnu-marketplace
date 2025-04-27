import React, { useState, useRef, useEffect } from 'react';
import { Category } from '@/data/categories';

interface CategoryPillsProps {
  /**
   * List of categories to display
   */
  categories: Category[];
  
  /**
   * Currently selected category ID
   */
  selectedCategoryId?: string;
  
  /**
   * Function called when a category is selected
   */
  onSelectCategory: (categoryId: string) => void;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * Airbnb-inspired horizontal scrolling category pills
 * Used for filtering products by category
 */
const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  
  // Handle scroll to update shadows
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // Show left shadow when scrolled right
    setShowLeftShadow(scrollLeft > 20);
    
    // Show right shadow when there's more content to scroll
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 20);
  };
  
  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Scroll left button handler
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };
  
  // Scroll right button handler
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Left scroll button */}
      {showLeftShadow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 flex items-center justify-center"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Category pills container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto py-4 px-2 -mx-2 scrollbar-hide"
        style={{ 
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          WebkitOverflowScrolling: 'touch' // iOS momentum scrolling
        }}
      >
        {/* Hide scrollbar for Chrome/Safari/Opera */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* "All" category pill */}
        <div className="flex-shrink-0 mr-3">
          <button
            onClick={() => onSelectCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategoryId 
                ? 'bg-sage text-white shadow-md' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
        
        {/* Category pills */}
        {categories.map(category => (
          <div key={category.id} className="flex-shrink-0 mr-3">
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategoryId === category.id 
                  ? 'bg-sage text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          </div>
        ))}
      </div>
      
      {/* Right scroll button */}
      {showRightShadow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 flex items-center justify-center"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Left gradient fade */}
      {showLeftShadow && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
          }}
        />
      )}
      
      {/* Right gradient fade */}
      {showRightShadow && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
          style={{
            background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
          }}
        />
      )}
    </div>
  );
};

export default CategoryPills;
