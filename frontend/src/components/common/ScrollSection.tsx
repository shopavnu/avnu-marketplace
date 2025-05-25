import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "@/hooks/useScrollAnimation";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
  fadeIn?: boolean;
  slideUp?: boolean;
  staggerChildren?: boolean;
  delay?: number;
  threshold?: number;
  id?: string;
}

const ScrollSection: React.FC<ScrollSectionProps> = ({
  children,
  className = "",
  bgColor = "bg-warm-white",
  fadeIn = true,
  slideUp = true,
  staggerChildren = false,
  delay = 0,
  threshold = 0.1,
  id,
}) => {
  const sectionRef: React.RefObject<HTMLElement> = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as React.RefObject<HTMLElement>, { threshold, triggerOnce: true });
  const { scrollYProgress } = useScroll({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });

  // Transform values based on scroll progress
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.9, 1],
    [0.6, 1, 1, 0.6],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.9, 1],
    [0.98, 1, 1, 0.98],
  );

  // Animation variants for the section
  const sectionVariants = {
    hidden: {
      opacity: fadeIn ? 0 : 1,
      y: slideUp ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: staggerChildren ? 0.1 : 0,
      },
    },
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`py-12 md:py-16 ${bgColor} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          style={{ opacity, scale }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
};

// Child component for staggered animations within a ScrollSection
export const ScrollItem: React.FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  preserveHeight?: boolean; // New prop to preserve child height
}> = ({ children, className = "", delay = 0, preserveHeight = false }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
  };

  // If preserveHeight is true, we need to ensure the motion.div doesn't affect the height
  // This is crucial for consistent card heights in grids
  return (
    <div className={`${className} ${preserveHeight ? "h-full" : ""}`}>
      <motion.div
        variants={itemVariants}
        style={preserveHeight ? { height: "100%", display: "block" } : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollSection;
