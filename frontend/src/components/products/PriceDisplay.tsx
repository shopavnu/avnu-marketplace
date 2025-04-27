import React, { useState, useEffect } from 'react';

interface PriceDisplayProps {
  price: number;
  className?: string;
}

/**
 * A client-only price display component that prevents hydration mismatches
 * by only rendering the formatted price on the client side
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, className = '' }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <p className={className}>
      {isClient ? (
        // Only show the formatted price on the client side
        `$${price.toFixed(2)}`
      ) : (
        // Show a non-breaking space during server-side rendering
        <span className="opacity-0">$0.00</span>
      )}
    </p>
  );
};

export default PriceDisplay;
