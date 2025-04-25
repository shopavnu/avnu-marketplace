// Using a local Product interface to avoid type errors with the mock data
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  brand: string;
  category: string;
  subCategory: string;
  attributes: ProductAttributes;
  isNew: boolean;
  rating: ProductRating;
  vendor: Vendor;
  inStock: boolean;
  tags: string[];
  createdAt: string;
  slug: string;
  categories: string[];
}

interface ProductRating {
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

interface ShippingInfo {
  isFree: boolean;
  minimumForFree?: number;
  baseRate?: number;
}

interface Vendor {
  id: string;
  name: string;
  causes: string[];
  isLocal: boolean;
  shippingInfo: ShippingInfo;
}

interface ProductAttributes {
  [key: string]: string | undefined;
  size: string;
  color: string;
  material: string;
  weight: string;
  dimensions?: string;
}

const defaultRating: ProductRating = {
  avnuRating: {
    average: 4.5,
    count: 10
  }
};

const defaultVendor: Vendor = {
  id: "default",
  name: "Default Vendor",
  causes: ["sustainability", "local-business"],
  isLocal: true,
  shippingInfo: {
    isFree: true,
    minimumForFree: 50
  }
};

const generateMoreProducts = (baseProducts: Product[]): Product[] => {
  const moreProducts: Product[] = [];
  for (let i = 0; i < 3; i++) {
    baseProducts.forEach((product, index) => {
      moreProducts.push({
        ...product,
        id: `${product.id}-${i}`,
        price: Math.round((product.price * (0.9 + Math.random() * 0.2)) * 100) / 100,
        image: product.image.replace('w=800', `w=800&random=${i}${index}`)
      });
    });
  }
  return moreProducts;
};

const baseProducts: Product[] = [
  {
    id: "1",
    title: "Handcrafted Ceramic Vase",
    brand: "Terra & Clay",
    description: "Minimalist ceramic vase with organic textures",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&q=80&fit=crop&w=800"],
    category: "Home",
    subCategory: "Decor",
    attributes: { material: "ceramic", height: "12 inches", color: "white", size: "Medium", weight: "2.5 lbs", dimensions: "12 x 6 x 6 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["ceramics", "handmade", "decor"],
    createdAt: new Date().toISOString(),
    slug: "handcrafted-ceramic-vase",
    categories: ["Home", "Decor", "Ceramics"]
  },
  {
    id: "2",
    title: "Natural Linen Throw",
    brand: "Pure Living",
    description: "100% organic linen throw blanket",
    price: 129.00,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=800"],
    category: "Home",
    subCategory: "Textiles",
    attributes: { material: "linen", size: "50x60 inches", color: "natural", weight: "1.2 lbs", dimensions: "50 x 60 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["textiles", "sustainable", "comfort"],
    createdAt: new Date().toISOString(),
    slug: "natural-linen-throw",
    categories: ["Home", "Textiles", "Bedding"]
  },
  {
    id: "3",
    title: "Handwoven Wall Hanging",
    brand: "Fiber & Folk",
    description: "Contemporary macrame wall art",
    price: 245.00,
    image: "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&q=80&fit=crop&w=800"],
    category: "Art",
    subCategory: "Wall Art",
    attributes: { material: "cotton", size: "24x36 inches", color: "natural", weight: "1.8 lbs", dimensions: "24 x 36 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["wall-art", "handwoven", "decor"],
    createdAt: new Date().toISOString(),
    slug: "handwoven-wall-hanging",
    categories: ["Art", "Wall Art", "Decor"]
  },
  {
    id: "4",
    title: "Brass Table Lamp",
    brand: "Lumière",
    description: "Modern brass table lamp with glass shade",
    price: 329.00,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=800"],
    category: "Lighting",
    subCategory: "Table Lamps",
    attributes: { material: "brass", height: "24 inches", color: "brass", size: "Medium", weight: "4.5 lbs", dimensions: "12 x 12 x 24 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["lighting", "modern", "brass"],
    createdAt: new Date().toISOString(),
    slug: "brass-table-lamp",
    categories: ["Lighting", "Table Lamps", "Home"]
  },
  {
    id: "5",
    title: "Organic Cotton Pillowcase Set",
    brand: "Pure Living",
    description: "GOTS certified organic cotton pillowcases",
    price: 79.00,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&q=80&fit=crop&w=800"],
    category: "Bedding",
    subCategory: "Pillowcases",
    attributes: { material: "organic cotton", size: "Standard", color: "white", weight: "0.8 lbs", dimensions: "20 x 30 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["bedding", "organic", "comfort"],
    createdAt: new Date().toISOString(),
    slug: "organic-cotton-pillowcase-set",
    categories: ["Bedding", "Pillowcases", "Home"]
  },
  {
    id: "6",
    title: "Wooden Serving Board",
    brand: "Forest & Table",
    description: "Handcrafted walnut serving board",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=800",
    images: ["https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=800"],
    category: "Kitchen",
    subCategory: "Serving Boards",
    attributes: { material: "walnut", size: "18x12 inches", color: "brown", weight: "2.2 lbs", dimensions: "18 x 12 x 1 inches" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["kitchen", "wood", "handcrafted"],
    createdAt: new Date().toISOString(),
    slug: "wooden-serving-board",
    categories: ["Kitchen", "Serving Boards", "Home"]
  }
];

export const products: Product[] = [
  ...baseProducts,
  ...generateMoreProducts(baseProducts)
];
