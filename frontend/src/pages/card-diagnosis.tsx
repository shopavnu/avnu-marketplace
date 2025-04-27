import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/data/products';
import { ConsistentProductCard } from '@/components/products';
import MinimalProductCard from '@/components/products/MinimalProductCard';

/**
 * A diagnostic page that displays different card implementations side by side
 * to help identify the root cause of inconsistent card heights
 */
export default function CardDiagnosis() {
  const [mounted, setMounted] = useState(false);
  const [cardHeights, setCardHeights] = useState<Record<string, number[]>>({});
  
  // Get a subset of products for testing
  const testProducts = products.slice(0, 8);
  
  // Measure card heights after mount
  useEffect(() => {
    setMounted(true);
    
    // Wait for rendering to complete
    setTimeout(() => {
      const heights: Record<string, number[]> = {
        minimal: [],
        consistent: [],
        table: [],
        absolute: [],
        cssOnly: []
      };
      
      // Measure each card type
      ['minimal', 'consistent', 'table', 'absolute', 'cssOnly'].forEach(type => {
        const cards = document.querySelectorAll(`.${type}-card`);
        cards.forEach(card => {
          heights[type].push(card.getBoundingClientRect().height);
        });
      });
      
      setCardHeights(heights);
    }, 1000);
  }, []);
  
  return (
    <>
      <Head>
        <title>Card Diagnosis | Avnu Marketplace</title>
      </Head>
      
      <div className="min-h-screen bg-warm-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-4">Card Height Diagnosis</h1>
            <p className="text-gray-600 mb-2">
              This page displays different card implementations side by side to diagnose height inconsistencies.
            </p>
          </div>
          
          {/* Height measurements */}
          {mounted && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Card Height Measurements</h2>
              
              {Object.entries(cardHeights).map(([type, heights]) => (
                <div key={type} className="mb-4">
                  <h3 className="font-medium mb-2">{type} Cards:</h3>
                  <div className="flex flex-wrap gap-2">
                    {heights.map((height, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1 rounded-full text-sm ${
                          height === 360 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Card {i+1}: {height.toFixed(2)}px
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* MinimalProductCard */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">1. Minimal Card (Client-rendered prices, inline styles)</h2>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                gap: '24px'
              }}
            >
              {testProducts.map(product => (
                <div key={product.id} className="minimal-card">
                  <MinimalProductCard 
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
                </div>
              ))}
            </div>
          </div>
          
          {/* ConsistentProductCard */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">2. Consistent Card (Table-based layout)</h2>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                gap: '24px'
              }}
            >
              {testProducts.map(product => (
                <div key={product.id} className="consistent-card">
                  <ConsistentProductCard 
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
                </div>
              ))}
            </div>
          </div>
          
          {/* Table-based Card */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">3. Pure Table Layout</h2>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                gap: '24px'
              }}
            >
              {testProducts.map(product => (
                <div key={product.id} className="table-card">
                  <div style={{ 
                    width: '100%', 
                    height: '360px',
                    display: 'table',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <Link 
                      href={`/product/${product.id}`}
                      style={{
                        display: 'table-row',
                        height: '200px',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{ display: 'table-cell', height: '200px', verticalAlign: 'top' }}>
                        <div style={{ position: 'relative', height: '200px', backgroundColor: '#f9f9f9' }}>
                          <Image 
                            src={product.image} 
                            alt={product.title}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    </Link>
                    <div style={{ display: 'table-row', height: '160px' }}>
                      <div style={{ display: 'table-cell', padding: '16px', verticalAlign: 'top' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.brand}
                        </p>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', height: '40px', overflow: 'hidden' }}>
                          {product.title}
                        </h3>
                        <div style={{ height: '40px', overflow: 'hidden', marginBottom: '8px' }}>
                          {product.description && (
                            <p style={{ fontSize: '12px', color: '#666' }}>
                              {product.description}
                            </p>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 500 }}>
                          ${mounted ? product.price.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Absolute Positioning Card */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">4. Absolute Positioning</h2>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                gap: '24px'
              }}
            >
              {testProducts.map(product => (
                <div key={product.id} className="absolute-card">
                  <div style={{ 
                    width: '100%', 
                    height: '360px',
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <Link 
                      href={`/product/${product.id}`}
                      style={{
                        display: 'block',
                        height: '100%',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '200px',
                        backgroundColor: '#f9f9f9'
                      }}>
                        <Image 
                          src={product.image} 
                          alt={product.title}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ 
                        position: 'absolute',
                        top: '200px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '16px'
                      }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.brand}
                        </p>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', height: '40px', overflow: 'hidden' }}>
                          {product.title}
                        </h3>
                        <div style={{ height: '40px', overflow: 'hidden', marginBottom: '8px' }}>
                          {product.description && (
                            <p style={{ fontSize: '12px', color: '#666' }}>
                              {product.description}
                            </p>
                          )}
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 500, position: 'absolute', bottom: '16px', left: '16px' }}>
                          ${mounted ? product.price.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CSS-Only Card */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">5. CSS-Only Background Image</h2>
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                gap: '24px'
              }}
            >
              {testProducts.map(product => (
                <div key={product.id} className="cssOnly-card">
                  <div style={{ 
                    width: '100%', 
                    height: '360px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <Link 
                      href={`/product/${product.id}`}
                      style={{
                        display: 'block',
                        height: '100%',
                        textDecoration: 'none',
                        color: 'inherit',
                        backgroundImage: `
                          linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 55%, rgba(255,255,255,1) 55.1%, rgba(255,255,255,1) 100%),
                          url(${product.image})
                        `,
                        backgroundSize: '100% 100%, contain',
                        backgroundPosition: 'center center, center 25%',
                        backgroundRepeat: 'no-repeat',
                        padding: '200px 16px 0 16px'
                      }}
                    >
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.brand}
                        </p>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', height: '40px', overflow: 'hidden' }}>
                          {product.title}
                        </h3>
                        <p style={{ fontSize: '14px', fontWeight: 500, marginTop: '8px' }}>
                          ${mounted ? product.price.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Debug information */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debugging Notes</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>All cards are set to exactly 360px height</li>
              <li>All cards are rendered in a grid with explicit grid-template-rows</li>
              <li>All prices are client-rendered to avoid hydration mismatches</li>
              <li>Each approach uses a different DOM structure and styling technique</li>
              <li>Card heights are measured after component mount and displayed at the top</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
