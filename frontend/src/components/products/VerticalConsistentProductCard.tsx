import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';
import useLazyImage from '@/hooks/useLazyImage';

interface VerticalConsistentProductCardProps {
  product: any; // Using any to accommodate both Product and discovery product types
  badges?: React.ReactNode;
  priority?: boolean; // Whether to prioritize image loading
}

/**
 * VerticalConsistentProductCard - A product card component that ensures consistent heights
 * regardless of content length, image size, or description length.
 * 
 * Key features:
 * - Fixed height container (360px total)
 * - Fixed height image section (200px)
 * - Fixed height content sections with text truncation
 * - Responsive design that maintains vertical consistency
 */
const VerticalConsistentProductCard: React.FC<VerticalConsistentProductCardProps> = ({ 
  product, 
  badges, 
  priority = false 
}) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use lazy loading for images unless priority is true
  const { isLoaded, currentSrc, ref } = useLazyImage({
    src: product.image,
    placeholderSrc: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=',
    rootMargin: '200px 0px',
    threshold: 0.1
  });
  
  // Only render interactive elements on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle favorite action
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Truncate text to fit in fixed height containers
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card"
      style={{
        width: '100%',
        height: '360px', // Fixed height for all cards
        minHeight: '360px',
        maxHeight: '360px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        contain: 'strict', // CSS containment for performance
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      <Link href={`/product/${product.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image section - fixed 200px height with consistent aspect ratio */}
        <div 
          ref={ref as React.RefObject<HTMLDivElement>}
          className="product-image-container"
          style={{ 
            position: 'relative', 
            height: '200px', // Fixed height for all images
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            flexShrink: 0 // Prevent image from shrinking
          }}
        >
          <Image
            src={priority ? product.image : currentSrc}
            alt={product.title || 'Product image'}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              opacity: (priority || isLoaded) ? 1 : 0.5,
              filter: (priority || isLoaded) ? 'none' : 'blur(10px)'
            }}
          />
        </div>
        
        {/* Content section - fixed 160px height with internal fixed heights */}
        <div 
          className="product-content"
          style={{ 
            padding: '16px',
            height: '160px', // Fixed height for content
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden' // Hide any overflow
          }}
        >
          {/* Brand name - fixed 20px height */}
          <div 
            className="product-brand"
            style={{ 
              height: '20px',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ 
              fontSize: '14px',
              color: '#666',
              fontWeight: 500
            }}>
              {product.brand || product.brandName || ''}
            </span>
          </div>
          
          {/* Title - fixed 48px height (2 lines) */}
          <div 
            className="product-title"
            style={{ 
              height: '48px',
              marginBottom: '8px',
              overflow: 'hidden'
            }}
          >
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s ease',
              color: isHovered ? '#FF385C' : '#333'
            }}>
              {product.title || 'Product title'}
            </h3>
          </div>
          
          {/* Description - fixed 40px height (2 lines) */}
          <div 
            className="product-description"
            style={{ 
              height: '40px',
              marginBottom: '8px',
              overflow: 'hidden'
            }}
          >
            <p style={{ 
              fontSize: '14px',
              lineHeight: '1.4',
              margin: 0,
              color: '#666',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {truncateText(product.description || '', 100)}
            </p>
          </div>
          
          {/* Price and rating - fixed 24px height */}
          <div 
            className="product-price-rating"
            style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '24px',
              marginTop: 'auto'
            }}
          >
            {/* Price - client-rendered */}
            {mounted ? (
              <p style={{ 
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                color: '#333'
              }}>
                {formatPrice(product.price || 0)}
              </p>
            ) : (
              <p style={{ 
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                opacity: 0
              }}>
                $0.00
              </p>
            )}
            
            {/* Rating */}
            {mounted && product.rating && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF385C" stroke="none">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '2px' }}>
                  {product.rating.avnuRating?.average.toFixed(1) || '4.5'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Favorite button */}
      {mounted && (
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isFavorited ? '#FF385C' : 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            transform: isHovered ? 'scale(1)' : 'scale(0.9)',
            opacity: isHovered ? 1 : 0.8
          }}
        >
          <HeartIcon 
            style={{ 
              width: '18px', 
              height: '18px',
              color: isFavorited ? 'white' : '#FF385C',
              transition: 'color 0.2s ease'
            }} 
          />
        </button>
      )}
      
      {/* Badges */}
      {badges && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10
        }}>
          {badges}
        </div>
      )}
    </div>
  );
};

export default VerticalConsistentProductCard;
