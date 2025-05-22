import React from 'react';
import { OptimizedPersonalizedGrid } from '@/components/discovery';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

interface DiscoverySectionWrapperProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  columns?: number;
  gap?: number;
  className?: string;
  showSeeAllLink?: boolean;
  seeAllUrl?: string;
}

/**
 * A reusable wrapper for the OptimizedPersonalizedGrid component
 * that can be easily integrated into any page
 */
const DiscoverySectionWrapper: React.FC<DiscoverySectionWrapperProps> = ({
  title = 'Discover More',
  subtitle,
  maxItems = 8,
  columns = 4,
  gap = 24,
  className = '',
  showSeeAllLink = false,
  seeAllUrl = '/final-discovery',
}) => {
  // Use intersection observer to lazy load the discovery section
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section 
      ref={ref} 
      className={`py-8 ${className}`}
      aria-labelledby={`discovery-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            id={`discovery-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-2xl font-semibold"
          >
            {title}
          </h2>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        {showSeeAllLink && (
          <a 
            href={seeAllUrl} 
            className="text-sage hover:underline"
            aria-label={`See all ${title}`}
          >
            See all
          </a>
        )}
      </div>
      
      {isIntersecting ? (
        <OptimizedPersonalizedGrid
          title={title}
          maxItems={maxItems}
          columns={columns}
          gap={gap}
        />
      ) : (
        <ProductGridSkeleton count={maxItems} columns={columns} gap={`${gap}px`} />
      )}
    </section>
  );
};

export default DiscoverySectionWrapper;
