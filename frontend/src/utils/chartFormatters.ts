/**
 * Chart Formatting Utilities
 * Helper functions to improve data visualization appearance and readability
 */

/**
 * Formats a camelCase or snake_case string into a readable Title Case format
 * e.g., "orderValue" becomes "Order Value"
 * @param str The string to format
 * @returns Formatted string in Title Case
 */
export const formatKeyToLabel = (str: string): string => {
  if (!str) return "";

  // Handle snake_case
  if (str.includes("_")) {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Handle camelCase
  return str
    .replace(/([A-Z])/g, " $1") // Insert space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

/**
 * Formats a value for display in tooltips based on its type
 * @param value The value to format
 * @param prefix Optional prefix (like '$' for currency)
 * @param suffix Optional suffix (like '%' for percentages)
 * @param decimals Number of decimal places
 * @returns Formatted value as string
 */
export const formatChartValue = (
  value: number,
  prefix: string = "",
  suffix: string = "",
  decimals: number = 1,
): string => {
  if (value === undefined || value === null) return "N/A";

  const formattedNumber =
    typeof value === "number"
      ? value.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : String(value);

  return `${prefix}${formattedNumber}${suffix}`;
};

/**
 * Creates meaningful default names for chart legends based on data keys
 * @param key The data key from the data object
 * @param defaultTitle Optional fallback title if provided
 * @returns A human-readable label for the chart legend
 */
export const generateLegendLabel = (
  key: string,
  defaultTitle?: string,
): string => {
  if (defaultTitle) return defaultTitle;

  // Handle common data keys with special formatting and more specific descriptions
  switch (key) {
    case "value":
      return "Customer LTV ($)";
    case "values":
      return "Data Values";
    case "customerLifetimeValue":
      return "Customer LTV ($)";
    case "count":
      return "Count";
    case "amount":
      return "Amount";
    case "total":
      return "Total";
    case "qty":
    case "quantity":
      return "Quantity";
    case "avg":
    case "average":
      return "Average";
    case "pct":
    case "percentage":
      return "Percentage";
    case "ratio":
      return "Ratio";
    case "volume":
      return "Volume";
    // Add more descriptive names for charts
    case "sales":
      return "Sales Volume";
    case "revenue":
      return "Revenue ($)";
    case "profit":
      return "Profit Margin";
    case "users":
      return "User Count";
    case "sessions":
      return "Session Count";
    case "views":
      return "Page Views";
    case "clicks":
      return "Click Count";
    case "conversions":
      return "Conversions";
    case "conversionRate":
      return "Conversion Rate";
    case "retention":
      return "Retention Rate";
    case "day30":
      return "30-Day Value";
    case "day60":
      return "60-Day Value";
    case "day90":
      return "90-Day Value";
    default:
      return formatKeyToLabel(key);
  }
};

const chartFormatters = {
  formatKeyToLabel,
  formatChartValue,
  generateLegendLabel,
};

export default chartFormatters;
