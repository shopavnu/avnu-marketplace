import React, { useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { products } from "@/data/products";
import {
  discoverySections,
  getSectionsInOrder,
  Section,
  SectionType,
} from "@/data/sections";
import OptimizedDiscoveryFeed from "@/components/discovery/OptimizedDiscoveryFeed";
import OptimizedPersonalizedGrid from "@/components/discovery/OptimizedPersonalizedGrid";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";

interface OptimizedDiscoveryPageProps {
  initialSections: Section[];
}

/**
 * Optimized discovery page that uses virtualization and lazy loading
 * for improved performance with long vertical scrolling
 */
const OptimizedDiscoveryPage: React.FC<OptimizedDiscoveryPageProps> = ({
  initialSections,
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isLoading, setIsLoading] = useState(false);

  // Populate sections with products
  useEffect(() => {
    // Add products to each section
    const sectionsWithProducts = sections.map((section) => {
      // Filter products based on section type
      const sectionProducts = products.filter((product) =>
        product.sectionTypes?.includes(section.type),
      );

      // Limit to the specified product count
      const limitedProducts = sectionProducts.slice(0, section.productCount);

      // Return section with products
      return {
        ...section,
        items: limitedProducts,
      };
    });

    setSections(sectionsWithProducts);
  }, [sections]);

  return (
    <>
      <Head>
        <title>Optimized Discovery | Avnu Marketplace</title>
        <meta
          name="description"
          content="Discover products optimized for vertical scrolling"
        />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Discover Products</h1>

          {/* Personalized "For You" Section */}
          <section className="mb-16">
            <OptimizedPersonalizedGrid
              title="For You"
              maxItems={24}
              columns={4}
              gap={24}
            />
          </section>

          {/* Other Discovery Sections */}
          {sections.length > 0 ? (
            <OptimizedDiscoveryFeed sections={sections} />
          ) : (
            <div className="w-full">
              <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
              <ProductGridSkeleton count={8} columns={4} gap="1.5rem" />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

// Use getServerSideProps instead of getStaticProps to avoid static generation
// This ensures the page is rendered at runtime when window is available
export const getServerSideProps = async () => {
  // Get sections in priority order
  const orderedSections = getSectionsInOrder();

  // Filter out the "For You" section since we're handling it separately
  const filteredSections = orderedSections.filter(
    (section) => section.type !== SectionType.FOR_YOU,
  );

  return {
    props: {
      initialSections: filteredSections,
    },
  };
};

export default OptimizedDiscoveryPage;
