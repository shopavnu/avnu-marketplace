import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { products, Product } from '@/data/products';
import { ScrollItem } from '@/components/common';
import { SectionType, discoverySections } from '@/data/sections';
import { ConsistentProductCard } from '@/components/products';
// HeightDebugger removed for clean UI

// Define types for our discovery feed
interface DiscoveryProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  images: string[];
  slug: string;
  brand: string;
  categories: string[];
  rating: {
    average: number;
    count: number;
  };
  vendor?: {
    id: string;
    name: string;
  };
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isHandmade?: boolean;
  isSustainable?: boolean;
  isLocal?: boolean;
  isBestseller?: boolean;
}

interface DiscoverySection {
  id: string;
  title: string;
  description: string;
  type: SectionType;
  layout: 'grid' | 'masonry' | 'featured';
  backgroundColor?: string;
  items: DiscoveryProduct[];
}

interface DiscoveryData {
  sections: DiscoverySection[];
  metadata: {
    personalizedCount: number;
    trendingCount: number;
    newArrivalsCount: number;
    emergingBrandsCount: number;
    sponsoredCount: number;
  };
}

// Helper function to transform a product to the discovery format
const transformProduct = (product: Product): DiscoveryProduct => ({
  id: product.id,
  title: product.title,
  description: product.description,
  price: product.price,
  salePrice: product.salePrice,
  image: product.image,
  images: product.images,
  slug: product.slug,
  brand: product.brand,
  categories: product.categories,
  rating: product.rating.average ? 
    { average: product.rating.average, count: product.rating.count || 0 } : 
    { average: product.rating.avnuRating.average, count: product.rating.avnuRating.count },
  vendor: product.vendor ? {
    id: product.vendor.id,
    name: product.vendor.name
  } : undefined,
  isNew: product.isNew,
  isFeatured: product.isFeatured,
  isTrending: product.isTrending,
  isHandmade: product.isHandmade,
  isSustainable: product.isSustainable,
  isLocal: product.isLocal,
  isBestseller: product.isBestseller
});

// Enhanced mock data for the vertical discovery homepage
const createMockDiscoveryData = (limit = 20): DiscoveryData => {
  // Get sections from our sections data
  const sectionsData = discoverySections;
  
  // Create a map to store products by section type
  const sectionProducts: Record<SectionType, DiscoveryProduct[]> = {
    [SectionType.FEATURED]: [],
    [SectionType.NEW_ARRIVALS]: [],
    [SectionType.TRENDING]: [],
    [SectionType.FOR_YOU]: [],
    [SectionType.SUSTAINABLE]: [],
    [SectionType.HANDMADE]: [],
    [SectionType.LOCAL]: [],
    [SectionType.CATEGORY_SPOTLIGHT]: [],
    [SectionType.BRAND_SPOTLIGHT]: [],
    [SectionType.SEASONAL]: [],
    [SectionType.BESTSELLERS]: []
  };
  
  // Assign products to sections based on their sectionTypes
  products.forEach(product => {
    if (!product.sectionTypes || product.sectionTypes.length === 0) {
      // If no section types, assign based on properties
      if (product.isNew) sectionProducts[SectionType.NEW_ARRIVALS].push(transformProduct(product));
      if (product.isFeatured) sectionProducts[SectionType.FEATURED].push(transformProduct(product));
      if (product.isTrending) sectionProducts[SectionType.TRENDING].push(transformProduct(product));
      if (product.isHandmade) sectionProducts[SectionType.HANDMADE].push(transformProduct(product));
      if (product.isSustainable) sectionProducts[SectionType.SUSTAINABLE].push(transformProduct(product));
      if (product.isLocal) sectionProducts[SectionType.LOCAL].push(transformProduct(product));
      if (product.isBestseller) sectionProducts[SectionType.BESTSELLERS].push(transformProduct(product));
      
      // Randomly assign to FOR_YOU
      if (Math.random() > 0.7) sectionProducts[SectionType.FOR_YOU].push(transformProduct(product));
    } else {
      // Assign based on explicit section types
      product.sectionTypes.forEach(sectionType => {
        if (sectionProducts[sectionType]) {
          sectionProducts[sectionType].push(transformProduct(product));
        }
      });
    }
  });
  
  // Create discovery sections with products
  const sectionsList = sectionsData.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description || '',
    type: section.type,
    layout: section.layout,
    backgroundColor: section.backgroundColor,
    items: sectionProducts[section.type].slice(0, section.productCount || limit)
  }));
  
  // Sort sections by priority
  sectionsList.sort((a, b) => {
    const aSection = sectionsData.find(s => s.id === a.id);
    const bSection = sectionsData.find(s => s.id === b.id);
    return ((aSection?.priority || 999) - (bSection?.priority || 999));
  });
  
  // Filter out sections with no products
  const filteredSections = sectionsList.filter(section => section.items.length > 0);
  
  return {
    sections: filteredSections,
    metadata: {
      personalizedCount: sectionProducts[SectionType.FOR_YOU].length,
      trendingCount: sectionProducts[SectionType.TRENDING].length,
      newArrivalsCount: sectionProducts[SectionType.NEW_ARRIVALS].length,
      emergingBrandsCount: 5,
      sponsoredCount: 0
    }
  };
};

interface DiscoveryFeedProps {
  limit?: number;
  showTitle?: boolean;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ 
  limit = 20,
  showTitle = true
}) => {
  // Use local mock data instead of GraphQL query
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{discoveryHomepage: DiscoveryData} | null>(null);
  
  // Simulate loading state for a more realistic experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({ discoveryHomepage: createMockDiscoveryData(limit) });
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [limit]);
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const sections = data?.discoveryHomepage?.sections || [];

  return (
    <div className="pb-32">
      {/* Add Height Debugger to diagnose card height issues */}
      {/* HeightDebugger removed for clean UI */}
      
      {/* Header */}
      <div className="container mx-auto px-4 mb-8 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
          Discover Products You'll Love
        </h2>
        <p className="text-gray-600 max-w-2xl">
          Explore our curated collection of unique, high-quality products from independent brands and artisans.
        </p>
      </div>

      {loading && (
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-80 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No discovery items found. Check back soon!</p>
        </div>
      )}

      {sections.map((section: DiscoverySection) => (
        <motion.div 
          key={section.id}
          className="mb-16 pb-12 border-b border-gray-100 last:border-0"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex justify-between items-end mb-8">
            <div>
              {showTitle && (
                <h2 className="font-montserrat text-2xl font-medium text-charcoal mb-2">{section.title}</h2>
              )}
              <p className="text-neutral-gray">{section.description}</p>
            </div>
            <Link 
              href={`/discover/${section.type.toLowerCase()}`} 
              className="flex items-center text-sage hover:text-sage-dark transition-colors group"
            >
              <span className="text-sm font-medium mr-2">See All</span>
              <ArrowRightIcon className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Grid - No animation wrappers to prevent layout shifts */}
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            style={{ 
              display: 'grid',
              gridTemplateRows: 'repeat(auto-fill, 360px)', /* Force all grid rows to be exactly 360px tall */
              contain: 'layout', /* Add CSS containment to the grid */
              position: 'relative',
              zIndex: 1
            }}
            data-testid="product-grid"
          >
            {section.items.map((product: DiscoveryProduct, index) => (
              <div 
                key={product.id}
                style={{ 
                  height: '360px',
                  width: '100%',
                  contain: 'strict',
                  position: 'relative'
                }}
                data-testid="product-cell"
              >
                <ConsistentProductCard 
                  product={product}
                  badges={
                    <>
                      {section.type === SectionType.NEW_ARRIVALS && (
                        <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                      {product.isSustainable && (
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                          Sustainable
                        </span>
                      )}
                      {product.isHandmade && (
                        <span className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-full">
                          Handmade
                        </span>
                      )}
                      {product.isLocal && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                          Local
                        </span>
                      )}
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                          Sale
                        </span>
                      )}
                    </>
                  }
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DiscoveryFeed;
