import React, { useState, useEffect } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { products } from "@/data/products";
import {
  discoverySections,
  getSectionsInOrder,
  Section,
  SectionType,
} from "@/data/sections";
import { categories, Category } from "@/data/categories";
import VerticalSection from "@/components/common/VerticalSection";
import CategoryPills from "@/components/common/CategoryPills";
import { 
  OptimizedPersonalizedGrid, 
  RecentlyViewedSection 
} from "@/components/discovery";
import useProgressiveLoading from "@/hooks/useProgressiveLoading";
import PriorityContentLoader from "@/components/common/PriorityContentLoader";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { trackCategoryView, useInfiniteRecommendations } from "@/utils/discovery-integration";

interface FinalDiscoveryPageProps {
  initialSections: Section[];
  allCategories: Category[];
}

/**
 * Final discovery page with vertical optimization
 * Inspired by Netflix's personalization and Airbnb's category navigation
 * but focusing on vertical scrolling optimization
 */
const FinalDiscoveryPage: React.FC<FinalDiscoveryPageProps> = ({
  initialSections,
  allCategories,
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side and initialize personalization tracking
  useEffect(() => {
    setMounted(true);
    
    // Track discovery page view for personalization
    trackCategoryView('discovery-page');
  }, []);

  // Populate sections with products
  useEffect(() => {
    if (!mounted) return;

    // Add products to each section
    const sectionsWithProducts = sections.map((section) => {
      // Filter products based on section type
      let sectionProducts = products.filter((product) =>
        product.sectionTypes?.includes(section.type),
      );

      // Apply category filter if selected
      if (selectedCategoryId) {
        sectionProducts = sectionProducts.filter((product) =>
          product.categories?.includes(selectedCategoryId),
        );
      }

      // Limit to the specified product count
      const limitedProducts = sectionProducts.slice(
        0,
        section.productCount || 12,
      );

      // Return section with products
      return {
        ...section,
        items: limitedProducts,
      };
    });

    setSections(sectionsWithProducts);
  }, [sections, selectedCategoryId, mounted]);

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  // Prepare priority content (above the fold)
  const priorityContent = (
    <>
      {/* Hero Section */}
      <section className="mb-12">
        <div className="relative rounded-xl overflow-hidden h-[50vh] min-h-[400px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)",
              filter: "brightness(0.85)",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
            <div className="container mx-auto max-w-6xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                Discover Sustainable Products
              </h1>
              <p className="text-xl md:text-2xl mb-6 max-w-2xl drop-shadow-md">
                Shop from ethical brands that align with your values
              </p>
              <button className="px-6 py-3 bg-sage text-white rounded-md hover:bg-sage/90 transition-colors">
                Explore Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills - Airbnb Style */}
      <section className="mb-12">
        <CategoryPills
          categories={allCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />
      </section>

      {/* Personalized "For You" Section */}
      <section className="mb-16">
        <OptimizedPersonalizedGrid
          title="For You"
          maxItems={12}
          columns={4}
          gap={24}
        />
      </section>

      {/* First Vertical Section */}
      {sections.length > 0 &&
        sections[0].items &&
        sections[0].items.length > 0 && (
          <VerticalSection
            title={sections[0].title}
            subtitle={sections[0].description || ""}
            products={sections[0].items}
            showSeeAll={true}
            seeAllUrl={`/category/${sections[0].type.toLowerCase()}`}
            columns={4}
          />
        )}
    </>
  );

  // Prepare deferred content (below the fold)
  const deferredContent = (
    <>
      {/* Remaining Vertical Sections */}
      {sections
        .slice(1)
        .map((section, index) =>
          section.items && section.items.length > 0 ? (
            <VerticalSection
              key={section.id}
              title={section.title}
              subtitle={section.description || ""}
              products={section.items}
              showSeeAll={true}
              seeAllUrl={`/category/${section.type.toLowerCase()}`}
              columns={4}
            />
          ) : null,
        )}
    </>
  );

  return (
    <>
      <Head>
        <title>Discovery | Avnu Marketplace</title>
        <meta
          name="description"
          content="Discover sustainable and ethical products"
        />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PriorityContentLoader
            priorityContent={priorityContent}
            deferredContent={deferredContent}
            placeholder={
              <div className="space-y-16">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">
                    Featured Products
                  </h2>
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
            style={{ width: "0%" }}
          ></div>
        </div>

        {/* Script to update scroll progress */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
        `,
          }}
        />
        
        {/* Recently Viewed Products */}
        <section className="mt-12 mb-16 max-w-7xl mx-auto px-4">
          <RecentlyViewedSection 
            title="Recently Viewed"
            maxItems={4}
            showWhenEmpty={false}
          />
        </section>
      </main>
    </>
  );
};

// Use getServerSideProps instead of getStaticProps to avoid static generation
// This ensures the page is rendered at runtime when window is available
export const getServerSideProps = async () => {
  // Get sections in priority order
  const orderedSections = getSectionsInOrder();

  return {
    props: {
      initialSections: orderedSections,
      allCategories: categories,
    },
    // No revalidate needed for server-side rendering
  };
};

export default FinalDiscoveryPage;
