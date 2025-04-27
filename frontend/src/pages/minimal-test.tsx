import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/data/products';

/**
 * A minimal test page that demonstrates the principles of consistent card heights
 * with no animation, minimal DOM, and strict height constraints
 */
export default function MinimalTest() {
  const [mounted, setMounted] = useState(false);
  
  // Only render on client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get a subset of products for testing
  const testProducts = products.slice(0, 12);
  
  return (
    <>
      <Head>
        <title>Minimal Test | Avnu Marketplace</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Minimal Card Test</h1>
            <p className="text-gray-600 mb-2">
              This page demonstrates a minimal implementation with consistent card heights.
            </p>
          </div>
          
          {/* Product Grid */}
          <div 
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gridAutoRows: '360px',
              gap: '24px'
            }}
          >
            {testProducts.map(product => (
              <div 
                key={product.id}
                style={{ 
                  width: '100%', 
                  height: '360px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  contain: 'strict', /* CSS containment to isolate layout */
                }}
              >
                <Link 
                  href={`/product/${product.id}`}
                  style={{
                    display: 'block',
                    height: '100%',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {/* Image section - fixed 200px height */}
                  <div style={{ 
                    height: '200px',
                    position: 'relative',
                    backgroundColor: '#f9f9f9',
                  }}>
                    <Image 
                      src={product.image} 
                      alt={product.title}
                      fill
                      style={{ 
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                    />
                  </div>
                  
                  {/* Content section - fixed 160px height */}
                  <div style={{ 
                    height: '160px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {/* Brand - fixed height */}
                    <div style={{ 
                      height: '16px',
                      marginBottom: '4px',
                      overflow: 'hidden',
                    }}>
                      <p style={{ 
                        fontSize: '12px',
                        color: '#666',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {product.brand}
                      </p>
                    </div>
                    
                    {/* Title - fixed height */}
                    <div style={{ 
                      height: '40px',
                      marginBottom: '8px',
                      overflow: 'hidden',
                    }}>
                      <h3 style={{ 
                        fontSize: '14px',
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {product.title}
                      </h3>
                    </div>
                    
                    {/* Description - fixed height */}
                    <div style={{ 
                      height: '40px',
                      marginBottom: '8px',
                      overflow: 'hidden',
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
                          overflow: 'hidden',
                        }}>
                          {product.description}
                        </p>
                      ) : (
                        <div style={{ height: '40px' }}></div>
                      )}
                    </div>
                    
                    {/* Price - fixed height, client-rendered */}
                    <div style={{ 
                      marginTop: 'auto',
                    }}>
                      <p style={{ 
                        fontSize: '14px',
                        fontWeight: 500,
                        margin: 0,
                      }}>
                        {mounted ? (
                          `$${product.price.toFixed(2)}`
                        ) : (
                          <span style={{ opacity: 0 }}>$0.00</span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Debug information */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>All cards are exactly 360px tall with CSS containment</li>
              <li>No animation components or framer-motion</li>
              <li>Client-side price rendering to avoid hydration mismatches</li>
              <li>Minimal DOM structure with strict height constraints</li>
              <li>Fixed heights for all sections (image: 200px, content: 160px)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
