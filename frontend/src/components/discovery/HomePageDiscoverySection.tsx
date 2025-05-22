import React from 'react';
import Link from 'next/link';
import { OptimizedPersonalizedGrid } from '@/components/discovery';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface HomePageDiscoverySectionProps {
  className?: string;
}

/**
 * A dedicated discovery section for the home page
 * Designed to promote personalized product discovery
 */
const HomePageDiscoverySection: React.FC<HomePageDiscoverySectionProps> = ({
  className = '',
}) => {
  // Use intersection observer to lazy load the section
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section 
      ref={ref} 
      className={`py-12 bg-sage/5 ${className}`}
      aria-labelledby="homepage-discovery-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 
              id="homepage-discovery-heading" 
              className="text-3xl font-semibold"
            >
              Discover Products Made For You
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Personalized recommendations based on your browsing history and preferences
            </p>
          </div>
          
          <Link 
            href="/final-discovery"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
          >
            Explore More
          </Link>
        </div>
        
        {isIntersecting && (
          <OptimizedPersonalizedGrid
            title="For You"
            maxItems={8}
            columns={4}
            gap={24}
          />
        )}
      </div>
    </section>
  );
};

export default HomePageDiscoverySection;
