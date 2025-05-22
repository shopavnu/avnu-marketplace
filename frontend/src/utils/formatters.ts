/**
 * Utility functions for formatting values in the Avnu Marketplace
 */

/**
 * Format a number as currency
 * @param price - The price to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  price: number,
  locale = "en-US",
  currency = "USD",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format a percentage value
 * @param value - The percentage value to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
};

/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
