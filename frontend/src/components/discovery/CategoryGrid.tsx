import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CategoryCard from "./CategoryCard";
import { Category, categories as allCategories } from "@/data/categories";
import { ScrollItem } from "@/components/common";

interface CategoryGridProps {
  title?: string;
  description?: string;
  categories?: Category[];
  showFeaturedOnly?: boolean;
  maxCategories?: number;
  className?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  title = "Browse Categories",
  description,
  categories = allCategories,
  showFeaturedOnly = false,
  maxCategories,
  className = "",
}) => {
  // Filter categories if needed
  let displayCategories = categories;

  if (showFeaturedOnly) {
    displayCategories = categories.filter((category) => category.featured);
  }

  if (maxCategories && maxCategories > 0) {
    displayCategories = displayCategories.slice(0, maxCategories);
  }

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
    <section className={`my-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {(title || description) && (
          <ScrollItem>
            <div className="mb-6">
              {title && (
                <motion.h2
                  className="text-2xl font-montserrat font-medium text-charcoal"
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
                  className="text-neutral-gray mt-2"
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

        {/* Category Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {displayCategories.map((category, index) => (
            <motion.div key={category.id} variants={itemVariants}>
              <ScrollItem delay={index * 0.05}>
                <CategoryCard category={category} size="medium" />
              </ScrollItem>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
