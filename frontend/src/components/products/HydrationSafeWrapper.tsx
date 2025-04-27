import React, { ReactNode } from 'react';

interface HydrationSafeWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that ensures consistent card heights
 * even when used with animation components
 */
const HydrationSafeWrapper: React.FC<HydrationSafeWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`${className} h-[360px] w-full`}
      style={{
        display: 'block',
        height: '360px',
        minHeight: '360px',
        maxHeight: '360px',
        overflow: 'hidden',
        // Force a new stacking context to isolate the card
        isolation: 'isolate',
        // Prevent any parent flex or grid behavior from affecting this element
        position: 'relative',
        // Ensure consistent box sizing
        boxSizing: 'border-box',
        // Prevent any animation effects from changing the height
        contain: 'size layout'
      }}
    >
      {children}
    </div>
  );
};

export default HydrationSafeWrapper;
