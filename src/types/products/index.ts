export interface ShippingInfo {
  isFree: boolean;
  minimumForFree?: number;
  baseRate?: number;
}

export interface ProductRating {
  shopifyRating?: {
    average: number;
    count: number;
  };
  wooCommerceRating?: {
    average: number;
    count: number;
  };
  avnuRating: {
    average: number;
    count: number;
  };
}

export interface Vendor {
  id: string;
  name: string;
  causes: string[];
  isLocal: boolean;
  shippingInfo: ShippingInfo;
}

/**
 * Represents a product in the marketplace
 * @interface Product
 */
export interface Product {
  id: string;
  /** Product title/name */
  title: string;
  /** Detailed product description */
  description: string;
  /** Product price in USD */
  price: number;
  /** URL to the product's primary image */
  image: string;
  images: string[];
  brand: string;
  /** Product category identifier */
  category: string;
  subCategory: string;
  attributes: Record<string, string>;
  /** Whether the product is marked as new */
  isNew: boolean;
  rating: ProductRating;
  vendor: Vendor;
  /** Whether the product is currently in stock */
  inStock: boolean;
  tags: string[];
  createdAt: string;
}

export interface ProductGridProps {
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
}

/**
 * Represents a brand in the marketplace
 */
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  values: string[];
  location: string;
  categories: Category[];
  primaryCategory: Category;
  rating: ProductRating;
  isVerified: boolean;
  foundedYear: number;
  productCount: number;
}
