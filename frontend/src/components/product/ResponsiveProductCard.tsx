import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import { formatCurrency, truncateText } from '../../utils/formatters';

interface ResponsiveProductCardProps {
  product: Product;
  badges?: React.ReactNode;
}

/**
 * ResponsiveProductCard component that maintains consistent height
 * across different device sizes while optimizing for mobile
 */
export const ResponsiveProductCard: React.FC<ResponsiveProductCardProps> = ({ 
  product, 
  badges 
}) => {
  // State to track device size
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Set up device detection on client-side only
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDeviceType('mobile');
      } else if (window.innerWidth < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Initial detection
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get appropriate image based on screen size
  const getResponsiveImage = () => {
    // Use mobile image on small screens, tablet on medium, and desktop on large
    if (deviceType === 'mobile' && product.mobileImages?.[0]) {
      return product.mobileImages[0];
    } else if (deviceType === 'tablet' && product.tabletImages?.[0]) {
      return product.tabletImages[0];
    }
    return product.images[0];
  };

  // Using imported truncateText function from formatters.ts

  // Get appropriate text length based on screen size
  const getResponsiveDescription = () => {
    const maxLength = deviceType === 'mobile' ? 60 : deviceType === 'tablet' ? 100 : 150;
    return truncateText(product.description, maxLength);
  };

  return (
    <div 
      className="product-card"
      style={{
        width: '100%',
        height: 'clamp(280px, 50vw, 360px)', // Responsive height
        minHeight: 'min(280px, 90vh)',
        maxHeight: 'max(360px, 50vh)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        contain: 'strict',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      data-testid="product-card"
    >
      {/* Product Image */}
      <div 
        style={{ 
          position: 'relative',
          flex: '0 0 auto',
          height: 'clamp(160px, 30vw, 220px)', // Responsive image height
          overflow: 'hidden'
        }}
      >
        <Link to={`/product/${product.slug || product.id}`}>
          <img 
            src={getResponsiveImage()}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            loading="lazy"
          />
        </Link>
        
        {/* Badges (Sale, New, etc) */}
        {badges && (
          <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
            {badges}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div 
        style={{ 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          overflow: 'hidden'
        }}
      >
        {/* Brand */}
        <div 
          style={{ 
            fontSize: '0.75rem',
            color: '#666',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.brandName}
        </div>
        
        {/* Title */}
        <Link 
          to={`/product/${product.slug || product.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3 
            style={{ 
              margin: '0 0 4px 0',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              height: 'calc(1.2em * 2)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis'
            }}
          >
            {product.title}
          </h3>
        </Link>
        
        {/* Description - truncated and responsive */}
        <p 
          style={{ 
            margin: '0 0 8px 0',
            fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
            color: '#666',
            lineHeight: 1.4,
            height: 'calc(1.4em * 2)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}
        >
          {getResponsiveDescription()}
        </p>
        
        {/* Price */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{ 
                fontWeight: 600,
                fontSize: 'clamp(0.875rem, 2vw, 1rem)'
              }}
            >
              {formatCurrency(product.price)}
            </span>
            
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span 
                style={{ 
                  textDecoration: 'line-through',
                  color: '#999',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)'
                }}
              >
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span 
                style={{ 
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: 'clamp(0.625rem, 1.2vw, 0.75rem)',
                  fontWeight: 600
                }}
              >
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveProductCard;
