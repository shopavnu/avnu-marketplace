import React from "react";
import { motion } from "framer-motion";

// Define value types and their associated colors
export type ValueType =
  | "sustainable"
  | "handmade"
  | "local"
  | "organic"
  | "ethical"
  | "artisanal"
  | "traditional"
  | "modern"
  | "luxury"
  | "vegan"
  | "fair-trade"
  | "eco-friendly";

interface ValueTagProps {
  value: string;
  size?: "small" | "medium" | "large";
  interactive?: boolean;
  onClick?: () => void;
}

// Color mapping for different value types
const valueColorMap: Record<ValueType, { bg: string; text: string }> = {
  sustainable: { bg: "bg-sage/10", text: "text-sage" },
  handmade: { bg: "bg-amber-500/10", text: "text-amber-600" },
  local: { bg: "bg-blue-500/10", text: "text-blue-600" },
  organic: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  ethical: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  artisanal: { bg: "bg-orange-500/10", text: "text-orange-600" },
  traditional: { bg: "bg-purple-500/10", text: "text-purple-600" },
  modern: { bg: "bg-sky-500/10", text: "text-sky-600" },
  luxury: { bg: "bg-rose-500/10", text: "text-rose-600" },
  vegan: { bg: "bg-green-500/10", text: "text-green-600" },
  "fair-trade": { bg: "bg-teal-500/10", text: "text-teal-600" },
  "eco-friendly": { bg: "bg-lime-500/10", text: "text-lime-600" },
};

// Default to sage if value isn't in our map
const getValueColors = (value: string) => {
  const normalizedValue = value.toLowerCase() as ValueType;
  return (
    valueColorMap[normalizedValue] || { bg: "bg-sage/10", text: "text-sage" }
  );
};

const ValueTag: React.FC<ValueTagProps> = ({
  value,
  size = "medium",
  interactive = false,
  onClick,
}) => {
  const { bg, text } = getValueColors(value);

  // Size classes
  const sizeClasses = {
    small: "text-xs px-2 py-0.5",
    medium: "text-sm px-3 py-1",
    large: "text-base px-4 py-1.5",
  };

  // Interactive props
  const interactiveProps = interactive
    ? {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        onClick,
      }
    : {};

  return (
    <motion.span
      {...{
        className: `${bg} ${text} ${sizeClasses[size]} rounded-full font-medium inline-flex items-center justify-center ${interactive ? "cursor-pointer" : ""}`
      }}
      {...interactiveProps}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </motion.span>
  );
};

export default ValueTag;
