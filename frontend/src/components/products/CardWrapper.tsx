import React, { ReactNode } from "react";

interface CardWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that ensures consistent card heights
 * This addresses issues with parent containers and animation wrappers
 * that might be affecting card heights
 */
const CardWrapper: React.FC<CardWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`${className} h-[360px] w-full`}
      style={{
        display: "block",
        height: "360px",
        minHeight: "360px",
        maxHeight: "360px",
        overflow: "hidden",
        // Force a new stacking context to isolate the card
        isolation: "isolate",
        // Prevent any parent flex or grid behavior from affecting this element
        position: "relative",
        // Ensure consistent box sizing
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
