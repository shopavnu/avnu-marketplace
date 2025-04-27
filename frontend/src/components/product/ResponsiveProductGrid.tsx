import React from 'react';
import { Product } from '../../types/product';
import ResponsiveProductCard from './ResponsiveProductCard';

interface ResponsiveProductGridProps {
  products: Product[];
  title?: string;
  emptyMessage?: string;
  testId?: string;
}

/**
 * Responsive product grid that maintains consistent card heights
 * across different device sizes while optimizing for mobile
 */
export const ResponsiveProductGrid: React.FC<ResponsiveProductGridProps> = ({
  products,
  title,
  emptyMessage = 'No products found',
  testId = 'product-grid',
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state" data-testid={`${testId}-empty`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      {title && (
        <h2 className="section-title" data-testid={`${testId}-title`}>
          {title}
        </h2>
      )}
      
      <div 
        className="product-grid"
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(8px, 2vw, 24px)',
          width: '100%',
          contain: 'layout',
        }}
        data-testid={testId}
      >
        {products.map((product) => (
          <div 
            key={product.id}
            style={{ 
              height: 'clamp(280px, 50vw, 360px)', // Responsive height
              width: '100%',
              contain: 'strict',
              position: 'relative'
            }}
            data-testid={`${testId}-item`}
          >
            <ResponsiveProductCard 
              product={product}
              badges={
                product.isOnSale ? (
                  <span 
                    style={{ 
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: 'clamp(0.625rem, 1.2vw, 0.75rem)',
                      fontWeight: 600
                    }}
                  >
                    SALE
                  </span>
                ) : product.featured ? (
                  <span 
                    style={{ 
                      backgroundColor: '#4caf50',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: 'clamp(0.625rem, 1.2vw, 0.75rem)',
                      fontWeight: 600
                    }}
                  >
                    FEATURED
                  </span>
                ) : null
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveProductGrid;
