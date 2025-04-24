import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { DiscoverySection, DiscoveryProduct } from '@/types/products';

// GraphQL query for discovery homepage
const DISCOVERY_HOMEPAGE = gql`
  query DiscoveryHomepage($userId: ID, $sessionId: ID, $limit: Int) {
    discoveryHomepage(userId: $userId, sessionId: $sessionId, options: { limit: $limit }) {
      sections {
        id
        title
        description
        type
        items {
          id
          name
          description
          price
          salePrice
          images
          slug
          brand {
            id
            name
          }
          categories
          rating
          reviewCount
        }
      }
      metadata {
        personalizedCount
        trendingCount
        newArrivalsCount
        emergingBrandsCount
        sponsoredCount
      }
    }
  }
`;

interface DiscoveryFeedProps {
  limit?: number;
  showTitle?: boolean;
}

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user?: SessionUser;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ 
  limit = 20,
  showTitle = true
}) => {
  // We'll use localStorage for session management instead of next-auth
  const [session, setSession] = useState<Session | null>(null);
  const userId = session?.user?.id;
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Generate or retrieve session ID for non-authenticated users and check for stored session
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('avnu_user');
    if (storedUser) {
      try {
        setSession({ user: JSON.parse(storedUser) });
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    
    // Generate session ID if no user ID
    if (!userId) {
      const storedSessionId = localStorage.getItem('avnu_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('avnu_session_id', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [userId]);

  // Fetch discovery homepage data
  const { data, loading, error } = useQuery(DISCOVERY_HOMEPAGE, {
    variables: {
      userId: userId || null,
      sessionId: !userId ? sessionId : null,
      limit
    },
    skip: !userId && !sessionId, // Skip query until we have either userId or sessionId
    fetchPolicy: 'cache-and-network',
  });

  if (error) {
    console.error('Error fetching discovery feed:', error);
  }

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
                    {section.type === 'new' && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      </div>
                    )}
                    
                    {section.type === 'emerging_brands' && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
                          Emerging Brand
                        </span>
                      </div>
                    )}
                  </div>

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

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-gray">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-montserrat font-medium text-charcoal">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="ml-2 text-sm text-red-500 line-through">
                            ${product.salePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
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
