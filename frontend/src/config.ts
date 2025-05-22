/**
 * Application configuration
 */

// Base URL for API requests
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

// Default pagination limits
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_RECOMMENDATION_LIMIT = 6;

// Image sizes for responsive product cards
export const IMAGE_SIZES = {
  MOBILE: {
    width: 320,
    height: 320,
  },
  TABLET: {
    width: 480,
    height: 480,
  },
  DESKTOP: {
    width: 640,
    height: 640,
  },
};

// Product card dimensions - these ensure consistent card heights
export const PRODUCT_CARD_DIMENSIONS = {
  MOBILE: {
    imageHeight: 160,
    titleLines: 2,
    descriptionLines: 2,
  },
  TABLET: {
    imageHeight: 220,
    titleLines: 2,
    descriptionLines: 3,
  },
  DESKTOP: {
    imageHeight: 280,
    titleLines: 2,
    descriptionLines: 3,
  },
};
