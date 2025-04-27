export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  images: string[];
  slug: string;
  categories: string[];
  category: string; // Primary category
  subCategory: string;
  inStock: boolean;
  isNew: boolean;
  brand: string; // Brand name as string
  attributes: {
    size: string;
    color: string;
    material: string;
    weight: string;
    dimensions?: string;
    [key: string]: string | undefined;
  };
  rating: {
    avnuRating: {
      average: number;
      count: number;
    };
    shopifyRating?: {
      average: number;
      count: number;
    };
    wooCommerceRating?: {
      average: number;
      count: number;
    };
  };
  vendor: {
    id: string;
    name: string;
    isLocal: boolean;
    causes: string[];
    shippingInfo: {
      isFree: boolean;
      minimumForFree?: number;
      baseRate?: number;
    };
  };
  brandObj?: {
    id: string;
    name: string;
  };
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
  // Added for backward compatibility with existing code
  tags: string[];
}

export interface DiscoverySection {
  id: string;
  title: string;
  description: string;
  type: string;
  items: DiscoveryProduct[];
}

export interface DiscoveryProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  slug: string;
  brand?: {
    id: string;
    name: string;
  };
  categories: string[];
  rating?: number;
  reviewCount?: number;
}

export interface DiscoveryHomepageResponse {
  sections: DiscoverySection[];
  metadata: {
    personalizedCount: number;
    trendingCount: number;
    newArrivalsCount: number;
    emergingBrandsCount: number;
    sponsoredCount: number;
  };
}
