import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { products } from '@/data/products';
import FlexProductCard from '@/components/products/FlexProductCard';
import CardWrapper from '@/components/products/CardWrapper';

/**
 * A completely static test page with no animations or framer-motion
 * This will help us determine if the animation system is causing our card height issues
 */
export default function StaticTest() {
  // Get a subset of products for testing
  const testProducts = products.slice(0, 12);
  
  return (
    <>
      <Head>
        <title>Static Card Test | Avnu Marketplace</title>
      </Head>
      
      <div className="min-h-screen bg-warm-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-4">Static Card Test</h1>
            <p className="text-gray-600 mb-2">
              This page renders product cards without any animations or framer-motion wrappers.
            </p>
            <p className="text-gray-600 font-bold">
              If cards have consistent heights here but not on the homepage, the issue is with the animation system.
            </p>
          </div>
          
          {/* Static grid with fixed height rows */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Static Grid (No Animation)</h2>
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              style={{ gridAutoRows: '360px' }}
            >
              {testProducts.map(product => (
                <div 
                  key={product.id}
                  className="h-[360px] w-full"
                  style={{ 
                    height: '360px',
                    minHeight: '360px',
                    maxHeight: '360px',
                    border: '1px solid transparent'
                  }}
                >
                  <CardWrapper>
                    <FlexProductCard 
                      product={product}
                      badges={
                        <>
                          {product.isNew && (
                            <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </>
                      }
                    />
                  </CardWrapper>
                </div>
              ))}
            </div>
          </div>
          
          {/* Debug information */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
            <p className="text-sm text-gray-700 mb-2">
              This page intentionally avoids using:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Framer Motion animations</li>
              <li>ScrollItem components</li>
              <li>AnimatePresence</li>
              <li>motion.div wrappers</li>
              <li>Any animation or transition effects</li>
            </ul>
            <p className="mt-4 text-sm text-gray-700">
              Each card is wrapped in a div with explicit height: 360px, minHeight: 360px, maxHeight: 360px
            </p>
          </div>
          
          {/* Client-side only diagnostic component */}
          <CardHeightDiagnostic />
        </div>
      </div>
    </>
  );
}

// Separate component for client-side diagnostics to avoid hydration errors
function CardHeightDiagnostic() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Run diagnostics after component mounts (client-side only)
    const timer = setTimeout(() => {
      console.log('Static Test Diagnostic Running...');
      const cards = document.querySelectorAll('.grid > div');
      
      cards.forEach((card, index) => {
        const height = card.getBoundingClientRect().height;
        console.log(`Card ${index}: ${height}px`);
        
        // Add visual height indicator
        const indicator = document.createElement('div');
        indicator.style.position = 'absolute';
        indicator.style.top = '0';
        indicator.style.right = '0';
        indicator.style.background = 'rgba(0,0,0,0.7)';
        indicator.style.color = 'white';
        indicator.style.padding = '2px 6px';
        indicator.style.fontSize = '10px';
        indicator.style.zIndex = '100';
        indicator.textContent = `${Math.round(height)}px`;
        
        // Need to cast to HTMLElement to access style property
        const cardElement = card as HTMLElement;
        cardElement.style.position = 'relative';
        cardElement.appendChild(indicator);
        
        // Add colored border based on height
        if (Math.abs(height - 360) > 1) {
          cardElement.style.border = '3px solid red';
        } else {
          cardElement.style.border = '3px solid green';
        }
      });
      
      // Log any height differences
      const heights = Array.from(cards).map(card => 
        card.getBoundingClientRect().height
      );
      
      const allSame = heights.every(h => Math.abs(h - heights[0]) < 1);
      console.log('All cards same height?', allSame);
      
      if (!allSame) {
        console.log('Height differences detected:');
        heights.forEach((h, i) => {
          console.log(`Card ${i}: ${h}px (diff from first: ${h - heights[0]}px)`);
        });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null; // This component doesn't render anything
}
