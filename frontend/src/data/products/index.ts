import { SectionType } from '@/data/sections';

// Enhanced Product interface to support vertical sections
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  images: string[];
  brand: string;
  category: string;
  subCategory: string;
  attributes: ProductAttributes;
  isNew: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isHandmade?: boolean;
  isSustainable?: boolean;
  isLocal?: boolean;
  isBestseller?: boolean;
  rating: ProductRating;
  vendor: Vendor;
  inStock: boolean;
  tags: string[];
  createdAt: string;
  slug: string;
  categories: string[];
  sectionTypes?: SectionType[];
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
  // Added for easier access
  average?: number;
  count?: number;
}

export interface ShippingInfo {
  isFree: boolean;
  minimumForFree?: number;
  baseRate?: number;
  estimatedDelivery?: string;
}

export interface Vendor {
  id: string;
  name: string;
  causes: string[];
  isLocal: boolean;
  isHandmade?: boolean;
  isSustainable?: boolean;
  shippingInfo: ShippingInfo;
  location?: string;
}

export interface ProductAttributes {
  [key: string]: string | undefined;
  size: string;
  color: string;
  material: string;
  weight: string;
  dimensions?: string;
  madeIn?: string;
  sustainabilityFeatures?: string;
}

const defaultRating: ProductRating = {
  avnuRating: {
    average: 4.5,
    count: 10
  },
  average: 4.5,
  count: 10
};

const defaultVendor: Vendor = {
  id: "default",
  name: "Default Vendor",
  causes: ["sustainability", "local-business"],
  isLocal: true,
  isHandmade: true,
  isSustainable: true,
  shippingInfo: {
    isFree: true,
    minimumForFree: 50,
    estimatedDelivery: "3-5 business days"
  },
  location: "Portland, OR"
};

// Enhanced product generator with more variation and section assignments
const generateMoreProducts = (baseProducts: Product[]): Product[] => {
  const moreProducts: Product[] = [];
  
  // Section type distribution
  const sectionTypes = Object.values(SectionType);
  
  for (let i = 0; i < 5; i++) { // Increased from 3 to 5 for more products
    baseProducts.forEach((product, index) => {
      // Randomly assign product attributes
      const isNew = Math.random() > 0.7;
      const isFeatured = Math.random() > 0.8;
      const isTrending = Math.random() > 0.8;
      const isHandmade = product.vendor?.isHandmade || Math.random() > 0.7;
      const isSustainable = product.vendor?.isSustainable || Math.random() > 0.7;
      const isLocal = product.vendor?.isLocal || Math.random() > 0.7;
      const isBestseller = Math.random() > 0.85;
      
      // Assign to sections based on attributes
      const productSectionTypes: SectionType[] = [];
      if (isNew) productSectionTypes.push(SectionType.NEW_ARRIVALS);
      if (isFeatured) productSectionTypes.push(SectionType.FEATURED);
      if (isTrending) productSectionTypes.push(SectionType.TRENDING);
      if (isHandmade) productSectionTypes.push(SectionType.HANDMADE);
      if (isSustainable) productSectionTypes.push(SectionType.SUSTAINABLE);
      if (isLocal) productSectionTypes.push(SectionType.LOCAL);
      if (isBestseller) productSectionTypes.push(SectionType.BESTSELLERS);
      
      // Always add to FOR_YOU with some probability
      if (Math.random() > 0.7) productSectionTypes.push(SectionType.FOR_YOU);
      
      // Add to category spotlight if matches
      if (product.category === 'Home' || product.category === 'Decor') {
        productSectionTypes.push(SectionType.CATEGORY_SPOTLIGHT);
      }
      
      // Calculate sale price for some products
      const hasSale = Math.random() > 0.8;
      const salePrice = hasSale ? Math.round(product.price * 0.8 * 100) / 100 : undefined;
      
      // Create variation of the product
      moreProducts.push({
        ...product,
        id: `${product.id}-${i}-${index}`,
        price: Math.round((product.price * (0.9 + Math.random() * 0.3)) * 100) / 100,
        salePrice,
        image: product.image.replace('w=800', `w=800&random=${i}${index}`),
        images: [product.image.replace('w=800', `w=800&random=${i}${index}`)],
        isNew,
        isFeatured,
        isTrending,
        isHandmade,
        isSustainable,
        isLocal,
        isBestseller,
        sectionTypes: productSectionTypes,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
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
    description: "Minimalist ceramic vase with organic textures, handcrafted by artisans using traditional techniques. Each piece is unique with subtle variations in glaze and form.",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Home",
    subCategory: "Decor",
    attributes: { 
      material: "ceramic", 
      height: "12 inches", 
      color: "white", 
      size: "Medium", 
      weight: "2.5 lbs", 
      dimensions: "12 x 6 x 6 inches",
      madeIn: "United States",
      sustainabilityFeatures: "Lead-free glazes, locally sourced clay"
    },
    isNew: true,
    isFeatured: true,
    isHandmade: true,
    isSustainable: true,
    isLocal: true,
    rating: {
      ...defaultRating,
      average: 4.8,
      count: 32
    },
    vendor: {
      id: "terra-clay",
      name: "Terra & Clay",
      causes: ["sustainability", "handmade", "local-business"],
      isLocal: true,
      isHandmade: true,
      isSustainable: true,
      shippingInfo: {
        isFree: true,
        minimumForFree: 75,
        estimatedDelivery: "5-7 business days"
      },
      location: "Portland, OR"
    },
    inStock: true,
    tags: ["ceramics", "handmade", "decor", "sustainable", "local"],
    createdAt: new Date().toISOString(),
    slug: "handcrafted-ceramic-vase",
    categories: ["Home", "Decor", "Ceramics"],
    sectionTypes: [SectionType.FEATURED, SectionType.HANDMADE, SectionType.SUSTAINABLE, SectionType.LOCAL, SectionType.CATEGORY_SPOTLIGHT]
  },
  {
    id: "2",
    title: "Natural Linen Throw",
    brand: "Pure Living",
    description: "100% organic linen throw blanket, GOTS certified and ethically made. Perfect for all seasons with its breathable, temperature-regulating properties.",
    price: 129.00,
    salePrice: 109.00,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Home",
    subCategory: "Textiles",
    attributes: { 
      material: "organic linen", 
      size: "50x60 inches", 
      color: "natural", 
      weight: "1.2 lbs", 
      dimensions: "50 x 60 inches",
      madeIn: "Portugal",
      sustainabilityFeatures: "GOTS certified organic, plastic-free packaging"
    },
    isNew: false,
    isFeatured: true,
    isTrending: true,
    isHandmade: false,
    isSustainable: true,
    isLocal: false,
    isBestseller: true,
    rating: {
      ...defaultRating,
      average: 4.9,
      count: 87
    },
    vendor: {
      id: "pure-living",
      name: "Pure Living",
      causes: ["sustainability", "ethical-labor", "organic"],
      isLocal: false,
      isHandmade: false,
      isSustainable: true,
      shippingInfo: {
        isFree: true,
        minimumForFree: 100,
        estimatedDelivery: "3-5 business days"
      },
      location: "Austin, TX"
    },
    inStock: true,
    tags: ["textiles", "sustainable", "comfort", "organic", "bestseller"],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "natural-linen-throw",
    categories: ["Home", "Textiles", "Bedding"],
    sectionTypes: [SectionType.FEATURED, SectionType.SUSTAINABLE, SectionType.BESTSELLERS, SectionType.TRENDING, SectionType.CATEGORY_SPOTLIGHT]
  },
  {
    id: "3",
    title: "Handwoven Wall Hanging",
    brand: "Fiber & Folk",
    description: "Contemporary macrame wall art handcrafted by skilled artisans. Each piece is individually made using traditional knotting techniques with a modern design aesthetic.",
    price: 245.00,
    image: "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1617142108319-66c7ab45c711?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1594125674956-61a9b49c8ecc?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Art",
    subCategory: "Wall Art",
    attributes: { 
      material: "organic cotton", 
      size: "24x36 inches", 
      color: "natural", 
      weight: "1.8 lbs", 
      dimensions: "24 x 36 inches",
      madeIn: "United States",
      sustainabilityFeatures: "Organic cotton, natural dyes"
    },
    isNew: true,
    isFeatured: false,
    isTrending: true,
    isHandmade: true,
    isSustainable: true,
    isLocal: true,
    rating: {
      ...defaultRating,
      average: 4.7,
      count: 23
    },
    vendor: {
      id: "fiber-folk",
      name: "Fiber & Folk",
      causes: ["handmade", "traditional-crafts", "women-owned"],
      isLocal: true,
      isHandmade: true,
      isSustainable: true,
      shippingInfo: {
        isFree: false,
        baseRate: 12.99,
        estimatedDelivery: "7-10 business days"
      },
      location: "Santa Fe, NM"
    },
    inStock: true,
    tags: ["wall-art", "handwoven", "decor", "macrame", "artisanal"],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "handwoven-wall-hanging",
    categories: ["Art", "Wall Art", "Decor"],
    sectionTypes: [SectionType.NEW_ARRIVALS, SectionType.HANDMADE, SectionType.SUSTAINABLE, SectionType.LOCAL, SectionType.TRENDING]
  },
  {
    id: "4",
    title: "Brass Table Lamp",
    brand: "Lumière",
    description: "Modern brass table lamp with hand-blown glass shade. Features energy-efficient LED technology and dimming capabilities for customizable lighting ambiance.",
    price: 329.00,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Lighting",
    subCategory: "Table Lamps",
    attributes: { 
      material: "brass and glass", 
      height: "24 inches", 
      color: "brass", 
      size: "Medium", 
      weight: "4.5 lbs", 
      dimensions: "12 x 12 x 24 inches",
      madeIn: "France",
      sustainabilityFeatures: "Energy-efficient LED, recyclable materials"
    },
    isNew: false,
    isFeatured: true,
    isTrending: false,
    isHandmade: true,
    isSustainable: true,
    isLocal: false,
    isBestseller: true,
    rating: {
      ...defaultRating,
      average: 4.6,
      count: 54
    },
    vendor: {
      id: "lumiere",
      name: "Lumière",
      causes: ["sustainability", "craftsmanship", "heritage"],
      isLocal: false,
      isHandmade: true,
      isSustainable: true,
      shippingInfo: {
        isFree: true,
        minimumForFree: 250,
        estimatedDelivery: "10-14 business days"
      },
      location: "Brooklyn, NY"
    },
    inStock: true,
    tags: ["lighting", "modern", "brass", "luxury", "energy-efficient"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "brass-table-lamp",
    categories: ["Lighting", "Table Lamps", "Home"],
    sectionTypes: [SectionType.FEATURED, SectionType.HANDMADE, SectionType.SUSTAINABLE, SectionType.BESTSELLERS]
  },
  {
    id: "5",
    title: "Organic Cotton Pillowcase Set",
    brand: "Pure Living",
    description: "GOTS certified organic cotton pillowcases with a 400 thread count for luxurious comfort. Naturally hypoallergenic and free from harmful chemicals for a healthier sleep environment.",
    price: 79.00,
    salePrice: 59.00,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Bedding",
    subCategory: "Pillowcases",
    attributes: { 
      material: "organic cotton", 
      size: "Standard", 
      color: "white", 
      weight: "0.8 lbs", 
      dimensions: "20 x 30 inches",
      madeIn: "India",
      sustainabilityFeatures: "GOTS certified, plastic-free packaging, fair trade"
    },
    isNew: false,
    isFeatured: false,
    isTrending: true,
    isHandmade: false,
    isSustainable: true,
    isLocal: false,
    isBestseller: true,
    rating: {
      ...defaultRating,
      average: 4.9,
      count: 112
    },
    vendor: {
      id: "pure-living",
      name: "Pure Living",
      causes: ["sustainability", "ethical-labor", "organic"],
      isLocal: false,
      isHandmade: false,
      isSustainable: true,
      shippingInfo: {
        isFree: true,
        minimumForFree: 50,
        estimatedDelivery: "3-5 business days"
      },
      location: "Austin, TX"
    },
    inStock: true,
    tags: ["bedding", "organic", "comfort", "sustainable", "sale"],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "organic-cotton-pillowcase-set",
    categories: ["Bedding", "Pillowcases", "Home"],
    sectionTypes: [SectionType.SUSTAINABLE, SectionType.BESTSELLERS, SectionType.TRENDING, SectionType.FOR_YOU]
  },
  {
    id: "6",
    title: "Wooden Serving Board",
    brand: "Forest & Table",
    description: "Handcrafted walnut serving board made from sustainably harvested American black walnut. Each board is finished with food-safe oils and features unique grain patterns.",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1606906709954-2536963b5687?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1541188495627-4b4e1e979a84?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Kitchen",
    subCategory: "Serving Boards",
    attributes: { 
      material: "walnut", 
      size: "18x12 inches", 
      color: "brown", 
      weight: "2.2 lbs", 
      dimensions: "18 x 12 x 1 inches",
      madeIn: "United States",
      sustainabilityFeatures: "Sustainably harvested wood, plant-based finishes"
    },
    isNew: true,
    isFeatured: false,
    isTrending: false,
    isHandmade: true,
    isSustainable: true,
    isLocal: true,
    rating: {
      ...defaultRating,
      average: 4.7,
      count: 42
    },
    vendor: {
      id: "forest-table",
      name: "Forest & Table",
      causes: ["sustainability", "handmade", "forest-conservation"],
      isLocal: true,
      isHandmade: true,
      isSustainable: true,
      shippingInfo: {
        isFree: false,
        baseRate: 8.99,
        minimumForFree: 100,
        estimatedDelivery: "5-7 business days"
      },
      location: "Seattle, WA"
    },
    inStock: true,
    tags: ["kitchen", "wood", "handcrafted", "sustainable", "food-safe"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "wooden-serving-board",
    categories: ["Kitchen", "Serving Boards", "Home"],
    sectionTypes: [SectionType.NEW_ARRIVALS, SectionType.HANDMADE, SectionType.SUSTAINABLE, SectionType.LOCAL, SectionType.FOR_YOU]
  },
  {
    id: "7",
    title: "Handwoven Wool Rug",
    brand: "Fiber & Folk",
    description: "Artisanal wool rug with geometric patterns, handwoven using traditional techniques. Made with naturally dyed wool from ethically raised sheep.",
    price: 495.00,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&q=80&fit=crop&w=800",
    images: [
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&q=80&fit=crop&w=800",
      "https://images.unsplash.com/photo-1588362951121-9c584eccbde3?auto=format&q=80&fit=crop&w=800"
    ],
    category: "Home",
    subCategory: "Rugs",
    attributes: { 
      material: "wool", 
      size: "5x7 feet", 
      color: "multicolor", 
      weight: "12 lbs", 
      dimensions: "60 x 84 inches",
      madeIn: "Morocco",
      sustainabilityFeatures: "Natural dyes, ethically sourced wool"
    },
    isNew: true,
    isFeatured: true,
    isTrending: true,
    isHandmade: true,
    isSustainable: true,
    isLocal: false,
    rating: {
      ...defaultRating,
      average: 4.9,
      count: 18
    },
    vendor: {
      id: "fiber-folk",
      name: "Fiber & Folk",
      causes: ["handmade", "traditional-crafts", "women-owned"],
      isLocal: false,
      isHandmade: true,
      isSustainable: true,
      shippingInfo: {
        isFree: true,
        minimumForFree: 300,
        estimatedDelivery: "14-21 business days"
      },
      location: "Santa Fe, NM"
    },
    inStock: true,
    tags: ["rug", "wool", "handwoven", "artisanal", "home-decor"],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    slug: "handwoven-wool-rug",
    categories: ["Home", "Rugs", "Textiles"],
    sectionTypes: [SectionType.NEW_ARRIVALS, SectionType.FEATURED, SectionType.HANDMADE, SectionType.SUSTAINABLE, SectionType.TRENDING]
  }
];

export const products: Product[] = [
  ...baseProducts,
  ...generateMoreProducts(baseProducts)
];
