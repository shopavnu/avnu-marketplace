import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { products } from '@/data/products';
import { discoverySections, getSectionsInOrder, Section, SectionType } from '@/data/sections';
import { categories, Category } from '@/data/categories';
import VerticalSection from '@/components/common/VerticalSection';
import CategoryPills from '@/components/common/CategoryPills';
import OptimizedPersonalizedGrid from '@/components/discovery/OptimizedPersonalizedGrid';
import useProgressiveLoading from '@/hooks/useProgressiveLoading';
import PriorityContentLoader from '@/components/common/PriorityContentLoader';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import SkipLinks from '@/components/accessibility/SkipLinks';
import SectionLandmark from '@/components/accessibility/SectionLandmark';
import SectionNavigation from '@/components/accessibility/SectionNavigation';
import useKeyboardNavigation from '@/hooks/useKeyboardNavigation';

interface AccessibleDiscoveryPageProps {
  initialSections: Section[];
  allCategories: Category[];
}

/**
 * Accessible discovery page with enhanced vertical navigation
 * Includes skip links, section landmarks, and keyboard navigation
 */
const AccessibleDiscoveryPage: React.FC<AccessibleDiscoveryPageProps> = ({ 
  initialSections,
  allCategories
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Populate sections with products
  useEffect(() => {
    if (!mounted) return;
    
    // Add products to each section
    const sectionsWithProducts = sections.map(section => {
      // Filter products based on section type
      let sectionProducts = products.filter(product => 
        product.sectionTypes?.includes(section.type)
      );
      
      // Apply category filter if selected
      if (selectedCategoryId) {
        sectionProducts = sectionProducts.filter(product => 
          product.categories?.includes(selectedCategoryId)
        );
      }
      
      // Limit to the specified product count
      const limitedProducts = sectionProducts.slice(0, section.productCount || 12);
      
      // Return section with products
      return {
        ...section,
        items: limitedProducts
      };
    });
    
    setSections(sectionsWithProducts);
  }, [sections, selectedCategoryId, mounted]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };
  
  // Create ref for main content
  const mainRef = useRef<HTMLElement>(null);
  
  // Set up keyboard navigation
  useKeyboardNavigation({
    rootElement: mainRef,
    enableVertical: true,
    wrapAround: false
  });
  
  // Prepare section navigation data
  const navigationSections = [
    { id: 'hero', title: 'Hero' },
    { id: 'categories', title: 'Categories' },
    { id: 'for-you', title: 'For You' },
    ...sections.map(section => ({
      id: `section-${section.id}`,
      title: section.title
    }))
  ];
  
  // Prepare skip links
  const skipLinks = [
    { targetId: 'main-content', text: 'Skip to main content' },
    { targetId: 'categories', text: 'Skip to categories' },
    { targetId: 'for-you', text: 'Skip to personalized content' }
  ];
  
  // Prepare priority content (above the fold)
  const priorityContent = (
    <>
      {/* Hero Section */}
      <SectionLandmark
        id="hero"
        title="Discover Sustainable Products"
        subtitle="Shop from ethical brands that align with your values"
        className="mb-12"
      >
        <div className="relative rounded-xl overflow-hidden h-[50vh] min-h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
              filter: 'brightness(0.85)'
            }}
            aria-hidden="true"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" aria-hidden="true" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Discover Sustainable Products</h1>
              <p className="text-xl md:text-2xl mb-6 max-w-2xl drop-shadow-md">
                Shop from ethical brands that align with your values
              </p>
              <button 
                className="px-6 py-3 bg-sage text-white rounded-md hover:bg-sage/90 transition-colors"
                aria-label="Explore sustainable products"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </SectionLandmark>
      
      {/* Category Pills - Airbnb Style */}
      <SectionLandmark
        id="categories"
        title="Categories"
        subtitle="Browse products by category"
        className="mb-12"
        ariaLabel="Product categories"
      >
        <CategoryPills 
          categories={allCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />
      </SectionLandmark>
      
      {/* Personalized "For You" Section */}
      <SectionLandmark
        id="for-you"
        title="For You"
        subtitle="Personalized recommendations based on your preferences"
        className="mb-16"
      >
        <OptimizedPersonalizedGrid 
          title="For You"
          maxItems={12}
          columns={4}
          gap={24}
        />
      </SectionLandmark>
      
      {/* First Vertical Section */}
      {sections.length > 0 && sections[0].items && sections[0].items.length > 0 && (
        <SectionLandmark
          id={`section-${sections[0].id}`}
          title={sections[0].title}
          subtitle={sections[0].description || ''}
          seeAllUrl={`/category/${sections[0].type.toLowerCase()}`}
        >
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            style={{ 
              display: 'grid',
              gridTemplateRows: 'repeat(auto-fill, 360px)',
              contain: 'layout',
              position: 'relative',
              zIndex: 1
            }}
          >
            {sections[0].items.map((product, index) => (
              <div
                key={product.id}
                style={{ 
                  height: '360px',
                  width: '100%',
                  contain: 'strict',
                  position: 'relative'
                }}
              >
                <a 
                  href={`/product/${product.id}`}
                  className="block h-full w-full"
                  aria-label={`View ${product.title} details`}
                >
                  <div className="h-full w-full">
                    {/* Use ConsistentProductCard but make sure it's wrapped in a focusable element */}
                    <div className="h-full w-full">
                      {/* Product card content */}
                      <div 
                        style={{
                          width: '100%',
                          height: '360px',
                          minHeight: '360px',
                          maxHeight: '360px',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          contain: 'strict',
                          position: 'relative',
                          display: 'block'
                        }}
                      >
                        {/* Product image */}
                        <div style={{ height: '65%', position: 'relative' }}>
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }} 
                          />
                          
                          {/* Badges */}
                          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                            {product.isNew && (
                              <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Product info */}
                        <div style={{ padding: '12px', height: '35%' }}>
                          <div style={{ marginBottom: '4px' }}>
                            <span className="text-sm text-gray-500">{product.brand}</span>
                          </div>
                          <h3 className="text-base font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                          <div className="mt-1">
                            <span className="text-base font-semibold">${product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </SectionLandmark>
      )}
    </>
  );
  
  // Prepare deferred content (below the fold)
  const deferredContent = (
    <>
      {/* Remaining Vertical Sections */}
      {sections.slice(1).map((section, index) => (
        section.items && section.items.length > 0 ? (
          <SectionLandmark
            key={section.id}
            id={`section-${section.id}`}
            title={section.title}
            subtitle={section.description || ''}
            seeAllUrl={`/category/${section.type.toLowerCase()}`}
          >
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              style={{ 
                display: 'grid',
                gridTemplateRows: 'repeat(auto-fill, 360px)',
                contain: 'layout',
                position: 'relative',
                zIndex: 1
              }}
            >
              {section.items.map((product, index) => (
                <div
                  key={product.id}
                  style={{ 
                    height: '360px',
                    width: '100%',
                    contain: 'strict',
                    position: 'relative'
                  }}
                >
                  <a 
                    href={`/product/${product.id}`}
                    className="block h-full w-full"
                    aria-label={`View ${product.title} details`}
                  >
                    <div className="h-full w-full">
                      {/* Use ConsistentProductCard but make sure it's wrapped in a focusable element */}
                      <div className="h-full w-full">
                        {/* Product card content */}
                        <div 
                          style={{
                            width: '100%',
                            height: '360px',
                            minHeight: '360px',
                            maxHeight: '360px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            contain: 'strict',
                            position: 'relative',
                            display: 'block'
                          }}
                        >
                          {/* Product image */}
                          <div style={{ height: '65%', position: 'relative' }}>
                            <img 
                              src={product.image} 
                              alt={product.title} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }} 
                            />
                            
                            {/* Badges */}
                            <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                              {product.isNew && (
                                <span className="px-3 py-1 bg-sage text-white text-xs font-medium rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Product info */}
                          <div style={{ padding: '12px', height: '35%' }}>
                            <div style={{ marginBottom: '4px' }}>
                              <span className="text-sm text-gray-500">{product.brand}</span>
                            </div>
                            <h3 className="text-base font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                            <div className="mt-1">
                              <span className="text-base font-semibold">${product.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </SectionLandmark>
        ) : null
      ))}
    </>
  );
  
  return (
    <>
      <Head>
        <title>Accessible Discovery | Avnu Marketplace</title>
        <meta name="description" content="Discover sustainable and ethical products" />
      </Head>
      
      {/* Skip Links */}
      <SkipLinks links={skipLinks} />
      
      {/* Section Navigation */}
      <SectionNavigation 
        sections={navigationSections}
        showOn="hover"
        position="right"
      />
      
      <main id="main-content" className="min-h-screen bg-white" tabIndex={-1} ref={mainRef}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PriorityContentLoader
            priorityContent={priorityContent}
            deferredContent={deferredContent}
            placeholder={
              <div className="space-y-16">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
                  <ProductGridSkeleton count={4} columns={4} gap="1.5rem" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-6">New Arrivals</h2>
                  <ProductGridSkeleton count={4} columns={4} gap="1.5rem" />
                </div>
              </div>
            }
            threshold={400}
          />
        </div>
        
        {/* Scroll Progress Indicator */}
        <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            id="scroll-progress" 
            className="h-full bg-sage transition-all duration-100 ease-out"
            style={{ width: '0%' }}
            aria-hidden="true"
          ></div>
        </div>
        
        {/* Script to update scroll progress */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.getElementById('scroll-progress');
            
            if (typeof window !== 'undefined') {
              window.addEventListener('scroll', function() {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                
                if (progressBar) {
                  progressBar.style.width = scrollPercent + '%';
                }
              });
            }
          });
        `}} />
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // Get sections in priority order
  const orderedSections = getSectionsInOrder();
  
  return {
    props: {
      initialSections: orderedSections,
      allCategories: categories
    },
    revalidate: 60 * 60 // Revalidate every hour
  };
};

export default AccessibleDiscoveryPage;
