import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressBarProps {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
  showOnlyWhenScrolled?: boolean;
}

const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  color = "bg-sage",
  height = 3,
  position = "top",
  showOnlyWhenScrolled = true,
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className={`fixed left-0 right-0 ${position === "top" ? "top-0" : "bottom-0"} z-50 ${color} origin-left`}
    >
      <motion.div
        style={{
          scaleX,
          height,
          opacity: showOnlyWhenScrolled ? scrollYProgress : 1,
          width: '100%', // Ensure motion.div takes full width of parent
          transformOrigin: 'left' // ensure origin-left is applied to the scaling element
        }}
      />
    </div>
  );
};

// Force re-commit
export default ScrollProgressBar;
