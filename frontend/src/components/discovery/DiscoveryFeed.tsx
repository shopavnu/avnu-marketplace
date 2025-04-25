import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { products } from '@/data/products';

// Define types for our discovery feed
interface DiscoveryProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  images: string[];
  slug: string;
  brand: {
    id: string;
    name: string;
  };
  categories: string[];
  rating: number;
  reviewCount: number;
}

interface DiscoverySection {
  id: string;
  title: string;
  description: string;
  type: string;
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

// Local mock data for the discovery homepage
const createMockDiscoveryData = (limit = 20): DiscoveryData => {
  // Transform products to match the expected format
  const mockProducts = products.map(product => ({
    id: product.id,
    name: product.title,
    description: product.description,
    price: product.price,
    salePrice: product.price * 0.9,
    images: product.images || [product.image],
    slug: product.slug || product.id.toLowerCase().replace(/\s+/g, '-'),
    brand: {
      id: 'brand-' + Math.floor(Math.random() * 10),
      name: product.brand
    },
    categories: product.categories || ['default'],
    rating: 4.5,
    reviewCount: 10
  }));

  // Create mock sections
  return {
    sections: [
      {
        id: 'section-1',
        title: 'Featured Products',
        description: 'Handpicked selections just for you',
        type: 'FEATURED',
        items: mockProducts.slice(0, 4)
      },
      {
        id: 'section-2',
        title: 'New Arrivals',
        description: 'The latest additions to our marketplace',
        type: 'NEW_ARRIVALS',
        items: mockProducts.slice(4, 10)
      },
      {
        id: 'section-3',
        title: 'Trending Now',
        description: 'What everyone is shopping for',
        type: 'TRENDING',
        items: mockProducts.slice(10, Math.min(mockProducts.length, limit))
      }
    ],
    metadata: {
      personalizedCount: 4,
      trendingCount: 6,
      newArrivalsCount: 6,
      emergingBrandsCount: 3,
      sponsoredCount: 2
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

  const sections: DiscoverySection[] = data?.discoveryHomepage?.sections || [];

  return (
    <div className="w-full">
      {loading && (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-64 rounded-lg" />
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
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              {showTitle && (
                <h2 className="font-montserrat text-xl text-charcoal">{section.title}</h2>
              )}
              <p className="text-sm text-gray-500">{section.description}</p>
            </div>
            <a 
              href={`/discover/${section.type}`} 
              className="flex items-center text-sage hover:text-sage-dark transition-colors"
            >
              <span className="text-sm mr-1">View all</span>
              <ChevronRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.items.slice(0, 4).map((product: DiscoveryProduct) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <Link 
                  href={`/product/${product.id}`} 
                  className="block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={product.images[0] || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Badges for special sections */}
                    {section.type === 'NEW_ARRIVALS' && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      </div>
                    )}

                    <div className="p-3 sm:p-4">
                      {/* Brand */}
                      {product.brand && (
                        <div className="mb-2">
                          <span className="text-xs text-neutral-gray truncate max-w-[120px]">
                            {product.brand.name}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-montserrat font-medium text-charcoal text-sm sm:text-base mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline">
                        <span className="font-inter font-medium text-charcoal">
                          ${product.price.toFixed(2)}
                        </span>

                        {product.salePrice && product.salePrice < product.price && (
                          <span className="ml-2 text-xs text-red-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="mt-2 flex items-center">
                          <div className="flex text-yellow-400">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DiscoveryFeed;
