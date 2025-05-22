import React from 'react';
export declare const usePreferenceTracking: () => {
  trackSearch: (query: string, filters?: any, resultCount?: number) => void;
  trackProductView: (productId: string, referrer?: string) => void;
  trackAddToCart: (productId: string, quantity?: number) => void;
  trackCategoryClick: (category: string) => void;
  trackBrandClick: (brand: string) => void;
};
export declare const PersonalizedSearch: React.FC;
export declare const ProductCard: React.FC<{
  product: any;
}>;
export declare const CategoryBadge: React.FC<{
  category: string;
}>;
export declare const BrandFilter: React.FC<{
  brands: string[];
}>;
export default PersonalizedSearch;
