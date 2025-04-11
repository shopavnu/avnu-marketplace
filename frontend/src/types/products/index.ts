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

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  brand: string;
  category: string;
  subCategory: string;
  attributes: Record<string, string>;
  isNew: boolean;
  rating: ProductRating;
  vendor: Vendor;
  inStock: boolean;
  tags: string[];
  createdAt: string;
}

export interface ProductGridProps {
  products: Product[];
}
