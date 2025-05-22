/**
 * Avnu Brand Color Theme for Charts
 * Provides consistent styling for all data visualizations
 */

// Brand Colors
export const brandColors = {
  cream: "#F6E6D2",
  teal: "#536E7A",
  sand: "#DDD7CE",
  olive: "#B3B29C",
  sage: "#C2D4CF",
  terracotta: "#C78164",
  charcoal: "#6E756D",
};

// Chart color palette (ordered for best contrast in data visualization)
export const chartColors = [
  brandColors.teal,
  brandColors.terracotta,
  brandColors.sage,
  brandColors.olive,
  brandColors.charcoal,
  brandColors.cream,
  brandColors.sand,
];

// Gradient definitions for area charts
export const gradients = {
  teal: {
    from: "#536E7A",
    to: "#536E7A33", // 20% opacity
  },
  terracotta: {
    from: "#C78164",
    to: "#C7816433", // 20% opacity
  },
  sage: {
    from: "#C2D4CF",
    to: "#C2D4CF33", // 20% opacity
  },
};

// Enhanced chart theme settings
export const chartTheme = {
  // Basic colors
  colors: chartColors,

  // Typography
  fontFamily: '"Inter", sans-serif',
  fontSize: 12,

  // Axis styling
  axis: {
    tickColor: brandColors.charcoal,
    tickLabelColor: brandColors.charcoal,
    gridColor: "#DDD7CE55", // Light sand color with opacity
  },

  // Tooltips
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderColor: brandColors.sand,
    textColor: brandColors.charcoal,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    borderRadius: 4,
  },

  // Legend
  legend: {
    textColor: brandColors.charcoal,
    iconSize: 10,
    padding: 15,
  },

  // Animation settings
  animation: {
    duration: 800,
    easing: "ease-out",
  },
};

export default chartTheme;
