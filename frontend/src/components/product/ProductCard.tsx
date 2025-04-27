import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import ResponsiveProductCard from './ResponsiveProductCard';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  trackImpression?: (product: Product) => void;
  showBadges?: boolean;
  className?: string;
  testId?: string;
  isMerchantView?: boolean; // Flag to indicate if the merchant is viewing their own products
}

/**
 * ProductCard component that wraps ResponsiveProductCard with additional functionality
 * such as tracking, badges, and click handling
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  trackImpression,
  showBadges = true,
  className = '',
  testId,
  isMerchantView = false
}) => {
  // Track impression when component mounts
  React.useEffect(() => {
    if (trackImpression) {
      trackImpression(product);
    }
  }, [product, trackImpression]);

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      // Don't prevent default - let the link navigation happen
      onClick(product);
    }
  };

  // Generate badges based on product properties
  const renderBadges = () => {
    if (!showBadges) return null;

    const badges = [];

    if (product.isOnSale && product.discountPercentage) {
      badges.push(
        <div 
          key="sale" 
          className="product-badge sale-badge"
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginRight: '4px'
          }}
        >
          {product.discountPercentage}% OFF
        </div>
      );
    }

    if (product.featured) {
      badges.push(
        <div 
          key="featured" 
          className="product-badge featured-badge"
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginRight: '4px'
          }}
        >
          Featured
        </div>
      );
    }

    if (!product.inStock) {
      badges.push(
        <div 
          key="out-of-stock" 
          className="product-badge out-of-stock-badge"
          style={{
            backgroundColor: '#9e9e9e',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginRight: '4px'
          }}
        >
          Out of Stock
        </div>
      );
    }

    return badges.length > 0 ? (
      <div className="product-badges" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1, display: 'flex' }}>
        {badges}
      </div>
    ) : null;
  };

  return (
    <div 
      className={`product-card-wrapper ${className}`}
      onClick={handleClick}
      data-testid={testId || `product-card-${product.id}`}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      <ResponsiveProductCard 
        product={product} 
        badges={renderBadges()}
        isMerchantView={isMerchantView}
      />
    </div>
  );
};

export default ProductCard;
