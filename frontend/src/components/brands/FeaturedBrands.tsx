import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import BrandCard from "./BrandCard";
import { Brand } from "@/types/brand";
import { ScrollItem } from "@/components/common";

interface FeaturedBrandsProps {
  title?: string;
  description?: string;
  brands: Brand[];
  maxBrands?: number;
  valueFiltered?: boolean;
  className?: string;
}

const FeaturedBrands: React.FC<FeaturedBrandsProps> = ({
  title = "Brands with Similar Values",
  description = "Discover more brands that align with your preferences",
  brands,
  maxBrands = 4,
  valueFiltered = true,
  className = "",
}) => {
  // Limit the number of brands shown
  const displayBrands = maxBrands > 0 ? brands.slice(0, maxBrands) : brands;

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className={`my-12 py-12 bg-warm-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {(title || description) && (
          <ScrollItem>
            <div className="mb-8">
              {title && (
                <motion.h2
                  className="text-2xl font-montserrat font-medium text-charcoal mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {title}
                </motion.h2>
              )}
              {description && (
                <motion.p
                  className="text-neutral-gray"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {description}
                </motion.p>
              )}
            </div>
          </ScrollItem>
        )}

        {/* Brands Grid - No animation wrappers to prevent layout shifts */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          style={{
            display: "grid",
            gridTemplateRows: "repeat(auto-fill, minmax(360px, 1fr))",
            contain: "layout",
            position: "relative",
            zIndex: 1,
          }}
          data-testid="brands-grid"
        >
          {displayBrands.map((brand, index) => (
            <div
              key={brand.id}
              style={{
                height: "100%",
                minHeight: "360px",
                width: "100%",
                contain: "strict",
                position: "relative",
              }}
              data-testid="brand-cell"
            >
              <BrandCard
                brand={brand}
                featured={false}
                showValues={true}
                maxValues={valueFiltered ? 3 : 2}
              />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <ScrollItem>
          <div className="mt-8 text-center">
            <motion.a
              href="/brands"
              className="inline-flex items-center text-sage hover:text-sage-dark transition-colors font-medium"
              whileHover={{ x: 5 }}
              whileTap={{ x: 0 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              View all brands
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.a>
          </div>
        </ScrollItem>
      </div>
    </section>
  );
};

export default FeaturedBrands;
