import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';
import useLazyImage from '@/hooks/useLazyImage';

interface ConsistentProductCardProps {
  product: any; // Using any to accommodate both Product and discovery product types
  badges?: React.ReactNode;
  priority?: boolean; // Whether to prioritize image loading
}

const ConsistentProductCard: React.FC<ConsistentProductCardProps> = ({ product, badges, priority = false }) => {
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

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '360px',
        minHeight: '360px',
        maxHeight: '360px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        contain: 'strict', // CSS containment to isolate layout
        position: 'relative',
        display: 'block',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      <Link href={`/product/${product.id}`}>
        {/* Image section - fixed 200px height with hover zoom effect */}
        <div 
          ref={ref as React.RefObject<HTMLDivElement>}
          style={{ 
            position: 'relative', 
            height: '200px', 
            overflow: 'hidden',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Image
            src={priority ? product.image : currentSrc}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              opacity: (priority || isLoaded) ? 1 : 0.5,
              filter: (priority || isLoaded) ? 'none' : 'blur(10px)'
            }}
          />
        </div>
        
        {/* Content section - fixed 160px height */}
        <div style={{ 
          padding: '16px',
          height: '160px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Title - fixed 32px height */}
          <div style={{ 
            height: '32px',
            marginBottom: '8px'
          }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              lineHeight: '1.2',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s ease',
              color: isHovered ? '#FF385C' : '#333'
            }}>
              {product.title}
            </h3>
          </div>
          
          {/* Description - fixed 40px height */}
          <div style={{ 
            height: '40px',
            marginBottom: '8px',
            overflow: 'hidden'
          }}>
            {product.description ? (
              <p style={{ 
                fontSize: '12px',
                color: '#666',
                margin: 0,
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.description}
              </p>
            ) : (
              <div style={{ height: '40px' }}></div>
            )}
          </div>
          
          {/* Price and Rating - Netflix/Airbnb style */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '24px',
            marginTop: 'auto'
          }}>
            {/* Price - client-rendered */}
            {mounted ? (
              <p style={{ 
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                color: '#333'
              }}>
                ${product.price.toFixed(2)}
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
            
            {/* Rating - Airbnb style */}
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
      
      {/* Favorite button - Netflix/Airbnb style */}
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
      
      {/* Quick view button - Netflix style */}
      {isHovered && mounted && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          zIndex: 5
        }}>
          <button 
            style={{
              backgroundColor: '#FF385C',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Quick view functionality would go here
            }}
          >
            Quick View
          </button>
        </div>
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

export default ConsistentProductCard;
