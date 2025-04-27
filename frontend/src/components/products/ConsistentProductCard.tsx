import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ConsistentProductCardProps {
  product: any; // Using any to accommodate both Product and discovery product types
  badges?: React.ReactNode;
}

const ConsistentProductCard: React.FC<ConsistentProductCardProps> = ({ product, badges }) => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Only render price on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle quick view and favorite actions
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
      <Link 
        href={`/product/${product.id}`}
        style={{
          display: 'block',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit'
        }}
      >
        {/* Image section - fixed 200px height with hover zoom effect */}
        <div style={{ 
          height: '200px',
          width: '100%',
          position: 'relative',
          backgroundColor: '#f9f9f9',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.7s ease',
            zIndex: 1
          }}>
            <Image 
              src={product.image} 
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
          
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorited ? '#FF385C' : 'none'}
                stroke={isFavorited ? '#FF385C' : '#484848'}
                strokeWidth="2"
                style={{ transition: 'all 0.2s ease' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content section - fixed 160px height */}
        <div style={{ 
          height: '160px',
          width: '100%',
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Trust indicators - Airbnb style */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            height: '16px',
            marginBottom: '4px',
            overflow: 'hidden'
          }}>
            {product.vendor?.isLocal && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginRight: '8px',
                backgroundColor: 'rgba(0, 184, 126, 0.1)',
                borderRadius: '4px',
                padding: '2px 4px'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00B87E" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span style={{ fontSize: '10px', color: '#00B87E', marginLeft: '2px' }}>Verified</span>
              </div>
            )}
            <p style={{ 
              fontSize: '12px',
              color: '#666',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {typeof product.brand === 'string' ? product.brand : (product.brand?.name || '')}
            </p>
          </div>
          
          {/* Title - fixed 40px height */}
          <div style={{ 
            height: '40px',
            marginBottom: '8px',
            overflow: 'hidden'
          }}>
            <h3 style={{ 
              fontSize: '15px',
              fontWeight: 500,
              margin: 0,
              lineHeight: '1.4',
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
        </div>
        
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
      </Link>
    </div>
  );
};

export default ConsistentProductCard;
