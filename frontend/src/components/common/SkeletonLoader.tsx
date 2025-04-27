import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loader component for showing loading states
 * Supports different animations and customizable dimensions
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '100%',
  borderRadius = '4px',
  className = '',
  style = {},
  animation = 'pulse'
}) => {
  const animationClass = animation === 'pulse' 
    ? 'animate-pulse' 
    : animation === 'wave' 
      ? 'animate-shimmer' 
      : '';

  return (
    <div
      className={`bg-gray-200 ${animationClass} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

interface ProductCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader specifically designed for product cards
 * Matches the exact dimensions of ConsistentProductCard for seamless transitions
 */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
      style={{
        width: '100%',
        height: '360px',
        minHeight: '360px',
        maxHeight: '360px',
        contain: 'strict',
        position: 'relative'
      }}
    >
      {/* Image placeholder */}
      <Skeleton 
        height="200px" 
        width="100%" 
        borderRadius="0"
      />
      
      {/* Content placeholders */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        <Skeleton height="14px" width="40%" />
        
        {/* Title */}
        <Skeleton height="18px" width="90%" />
        <Skeleton height="18px" width="70%" />
        
        {/* Price */}
        <div className="pt-2">
          <Skeleton height="20px" width="30%" />
        </div>
      </div>
    </div>
  );
};

interface GridSkeletonProps {
  count?: number;
  columns?: number;
  gap?: string;
}

/**
 * Grid of skeleton product cards for loading states
 */
export const ProductGridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 8,
  columns = 4,
  gap = '1.5rem'
}) => {
  return (
    <div 
      className="w-full"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        gridTemplateRows: 'repeat(auto-fill, 360px)',
        contain: 'layout',
        position: 'relative',
        zIndex: 1
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          style={{ 
            height: '360px',
            width: '100%',
            contain: 'strict',
            position: 'relative'
          }}
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

// Add animation for wave effect to globals.css
// This is referenced in the component but needs to be added to the CSS
// @keyframes shimmer {
//   0% {
//     background-position: -1000px 0;
//   }
//   100% {
//     background-position: 1000px 0;
//   }
// }
// .animate-shimmer {
//   background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
//   background-size: 1000px 100%;
//   animation: shimmer 2s infinite linear;
// }

const SkeletonComponents = {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton
};

export default SkeletonComponents;
