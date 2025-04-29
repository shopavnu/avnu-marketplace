import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/products';
import { causes } from '@/components/search/FilterPanel';
import { analyticsService } from '@/services/analytics.service';
import { useRouter } from 'next/router';

interface ResponsiveProductCardProps {
  product: Product;
  priority?: boolean;
  badges?: React.ReactNode;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export default function ResponsiveProductCard({ 
  product, 
  priority = false,
  badges,
  deviceType = 'desktop'
}: ResponsiveProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { query } = router.query;

  // Define dimensions for different device types
  const cardDimensions = {
    mobile: {
      height: '280px',
      imageHeight: '160px',
      contentHeight: '120px'
    },
    tablet: {
      height: '320px',
      imageHeight: '180px',
      contentHeight: '140px'
    },
    desktop: {
      height: '360px',
      imageHeight: '200px',
      contentHeight: '160px'
    }
  };

  // Get current dimensions based on device type
  const currentDimensions = cardDimensions[deviceType];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [combinedRating, setCombinedRating] = useState({
    average: product.rating.avnuRating.average,
    count: 0
  });

  useEffect(() => {
    setCombinedRating({
      average: product.rating.avnuRating.average,
      count: product.rating.avnuRating.count +
        (product.rating.shopifyRating?.count || 0) +
        (product.rating.wooCommerceRating?.count || 0)
    });
  }, [product.rating]);

  return (
    <div 
      ref={cardRef}
      className="product-card"
      style={{ 
        width: '100%',
        height: currentDimensions.height,
        minHeight: currentDimensions.height,
        maxHeight: currentDimensions.height,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        contain: 'strict'
      }}
      data-testid="product-card"
    >
      <Link 
        href={`/product/${product.id}`} 
        className="block flex-grow flex flex-col" 
        onClick={() => {
          // Track product click
          const searchQuery = Array.isArray(query) ? query[0] : query;
          
          if (searchQuery) {
            analyticsService.trackSearchResultClick(
              product.id,
              0, // Position will be determined by backend
              searchQuery
            );
          }
        }}
      >
        <div 
          className="relative overflow-hidden" 
          style={{ 
            height: currentDimensions.imageHeight,
            minHeight: currentDimensions.imageHeight,
            maxHeight: currentDimensions.imageHeight
          }}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {badges ? (
              badges
            ) : (
              <>
                {product.isNew && (
                  <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                    New
                  </span>
                )}
                {product.vendor.isLocal && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium rounded-full">
                    Local
                  </span>
                )}
              </>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm
                     text-charcoal hover:text-sage transition-colors duration-200"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isClient && isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        <div 
          className="p-3 flex flex-col"
          style={{ 
            height: currentDimensions.contentHeight,
            minHeight: currentDimensions.contentHeight,
            maxHeight: currentDimensions.contentHeight,
            overflow: 'hidden'
          }}
        >
          {/* Vendor & Causes - Simplified for smaller screens */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs text-neutral-gray truncate max-w-[120px]">{product.vendor.name}</span>
            {deviceType !== 'mobile' && (
              <div className="flex gap-1">
                {product.vendor.causes.slice(0, deviceType === 'tablet' ? 2 : 3).map((causeId, index) => {
                  const cause = causes.find(c => c.id === causeId);
                  if (!cause) return null;
                  return (
                    <div
                      key={index}
                      className="w-5 h-5 flex items-center justify-center bg-sage/10 text-sage rounded-full"
                      title={cause.name}
                    >
                      <div className="w-3 h-3 flex items-center justify-center">{cause.icon}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Title - Line clamp varies by device */}
          <h3 className={`font-montserrat font-medium text-charcoal text-sm mb-1 ${
            deviceType === 'mobile' ? 'line-clamp-1' : 'line-clamp-2'
          }`}>
            {product.title}
          </h3>

          {/* Rating - Simplified for mobile */}
          {deviceType !== 'mobile' && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isClient && i < Math.floor(combinedRating.average) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                ))}
              </div>
              {isClient && (
                <span className="text-xs text-neutral-gray">
                  ({combinedRating.count})
                </span>
              )}
            </div>
          )}

          {/* Price & Shipping - This is at the bottom of the content area */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className={`font-montserrat font-medium text-charcoal ${
                deviceType === 'mobile' ? 'text-sm' : 'text-base'
              }`}>
                ${product.price.toFixed(2)}
              </span>
              {deviceType !== 'mobile' && (
                <>
                  {product.vendor.shippingInfo.isFree ? (
                    <p className="text-xs text-sage">Free Shipping</p>
                  ) : product.vendor.shippingInfo.minimumForFree ? (
                    <p className="text-xs text-neutral-gray truncate">
                      Free over ${product.vendor.shippingInfo.minimumForFree}
                    </p>
                  ) : null}
                </>
              )}
            </div>
            {!product.inStock && (
              <span className="text-xs text-red-500">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
