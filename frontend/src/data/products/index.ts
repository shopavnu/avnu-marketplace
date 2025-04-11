import { Product, ProductRating, Vendor } from '@/types/products';

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
    attributes: { material: "ceramic", height: "12 inches", color: "white" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["ceramics", "handmade", "decor"],
    createdAt: new Date().toISOString()
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
    attributes: { material: "linen", size: "50x60 inches", color: "natural" },
    isNew: true,
    rating: defaultRating,
    vendor: defaultVendor,
    inStock: true,
    tags: ["textiles", "sustainable", "comfort"],
    createdAt: new Date().toISOString()
  }
];

export const products: Product[] = [
  ...baseProducts,
  ...generateMoreProducts(baseProducts)
];
