import React from 'react';

interface ProductCardSkeletonProps {
  height?: string;
  imageHeight?: string;
}

/**
 * Skeleton loader for product cards that maintains consistent dimensions
 * to prevent layout shifts when actual content loads
 */
const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
  height = '360px',
  imageHeight = '200px'
}) => {
  return (
    <div 
      className="product-card-skeleton"
      style={{
        width: '100%',
        height: height,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
      data-testid="product-card-skeleton"
    >
      {/* Image Skeleton */}
      <div 
        className="skeleton-image"
        style={{ 
          height: imageHeight,
          backgroundColor: '#f0f0f0',
          backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          width: '100%'
        }}
      />
      
      {/* Content Skeleton */}
      <div style={{ padding: '12px', flex: '1' }}>
        {/* Brand Skeleton */}
        <div 
          className="skeleton-brand"
          style={{ 
            height: '12px',
            width: '40%',
            backgroundColor: '#f0f0f0',
            marginBottom: '8px',
            borderRadius: '4px',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
          }}
        />
        
        {/* Title Skeleton */}
        <div 
          className="skeleton-title"
          style={{ 
            height: '20px',
            width: '90%',
            backgroundColor: '#f0f0f0',
            marginBottom: '8px',
            borderRadius: '4px',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
          }}
        />
        
        {/* Description Skeleton */}
        <div 
          className="skeleton-description"
          style={{ 
            height: '16px',
            width: '80%',
            backgroundColor: '#f0f0f0',
            marginBottom: '4px',
            borderRadius: '4px',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
          }}
        />
        <div 
          className="skeleton-description"
          style={{ 
            height: '16px',
            width: '60%',
            backgroundColor: '#f0f0f0',
            marginBottom: '16px',
            borderRadius: '4px',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
          }}
        />
        
        {/* Price Skeleton */}
        <div 
          className="skeleton-price"
          style={{ 
            height: '20px',
            width: '30%',
            backgroundColor: '#f0f0f0',
            marginTop: 'auto',
            borderRadius: '4px',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
          }}
        />
      </div>
      
      {/* Animation */}
      <style jsx>{`
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCardSkeleton;
