import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { products } from '@/data/products';
import { discoverySections, getSectionsInOrder, Section, SectionType } from '@/data/sections';
import ProgressiveDiscoveryFeed from '@/components/discovery/ProgressiveDiscoveryFeed';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

interface ProgressiveDiscoveryPageProps {
  initialSections: Section[];
}

/**
 * Progressive discovery page that loads content as the user scrolls
 * while maintaining consistent card heights of 360px
 */
const ProgressiveDiscoveryPage: React.FC<ProgressiveDiscoveryPageProps> = ({ 
  initialSections 
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isLoading, setIsLoading] = useState(true);
  
  // Populate sections with products
  useEffect(() => {
    // Add products to each section
    const sectionsWithProducts = sections.map(section => {
      // Filter products based on section type
      const sectionProducts = products.filter(product => 
        product.sectionTypes?.includes(section.type)
      );
      
      // Return section with products
      return {
        ...section,
        items: sectionProducts
      };
    });
    
    setSections(sectionsWithProducts);
    setIsLoading(false);
  }, [sections]);
  
  return (
    <>
      <Head>
        <title>Progressive Discovery | Avnu Marketplace</title>
        <meta name="description" content="Discover products with progressive loading" />
      </Head>
      
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Discover Products</h1>
          
          {/* Hero Section - Prioritized Loading */}
          <section className="mb-12 bg-sage/5 rounded-xl p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">Progressive Loading Demo</h2>
              <p className="text-gray-600 mb-6">
                This page demonstrates progressive loading of content as you scroll.
                Only the sections in your viewport (plus a buffer) are loaded,
                and each section loads products progressively to ensure smooth performance.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-sage rounded-full"></div>
                  <span className="text-sm">Priority Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <span className="text-sm">Progressively Loaded</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Progressive Discovery Feed */}
          {isLoading ? (
            <div className="space-y-16">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
                <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-6">New Arrivals</h2>
                <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
              </div>
            </div>
          ) : (
            <ProgressiveDiscoveryFeed 
              sections={sections} 
              priorityThreshold={2} // First two sections are prioritized
            />
          )}
          
          {/* Scroll Progress Indicator */}
          <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-200">
            <div 
              id="scroll-progress" 
              className="h-full bg-sage transition-all duration-100 ease-out"
              style={{ width: '0%' }}
            ></div>
          </div>
          
          {/* Script to update scroll progress */}
          <script dangerouslySetInnerHTML={{ __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const progressBar = document.getElementById('scroll-progress');
              
              window.addEventListener('scroll', function() {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                
                if (progressBar) {
                  progressBar.style.width = scrollPercent + '%';
                }
              });
            });
          `}} />
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // Get sections in priority order
  const orderedSections = getSectionsInOrder();
  
  return {
    props: {
      initialSections: orderedSections
    },
    revalidate: 60 * 60 // Revalidate every hour
  };
};

export default ProgressiveDiscoveryPage;
