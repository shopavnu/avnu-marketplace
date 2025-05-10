/**
 * Session interaction types for tracking user behavior within a session
 * Combines all interaction types used across the application
 */
export enum SessionInteractionType {
  // Original values (uppercase)
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  SEARCH = 'SEARCH',
  FILTER = 'FILTER',
  ADD_TO_CART = 'ADD_TO_CART',
  CHECKOUT_START = 'CHECKOUT_START',
  PURCHASE = 'PURCHASE',
  CLICK = 'CLICK',
  SCROLL = 'SCROLL',
  WISHLIST_ADD = 'WISHLIST_ADD',
  CATEGORY_VIEW = 'CATEGORY_VIEW',
  MERCHANT_VIEW = 'MERCHANT_VIEW',
  REVIEW_VIEW = 'REVIEW_VIEW',
  REVIEW_SUBMIT = 'REVIEW_SUBMIT',

  // Additional values from session.service.ts (lowercase)
  VIEW = 'view',
  SORT = 'sort',
  IMPRESSION = 'impression',
  DWELL = 'dwell',
  SCROLL_DEPTH = 'scroll_depth',
}
