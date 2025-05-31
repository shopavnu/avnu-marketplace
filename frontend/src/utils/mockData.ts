import { ProductSummary } from '@/types/cart';

// Mock product data for testing the cart
export const mockProducts: ProductSummary[] = [
  {
    id: 'prod-001',
    title: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'EcoWear',
    slug: 'organic-cotton-tshirt',
    inStock: true,
  },
  {
    id: 'prod-002',
    title: 'Recycled Denim Jeans',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'EcoWear',
    slug: 'recycled-denim-jeans',
    inStock: true,
  },
  {
    id: 'prod-003',
    title: 'Handmade Leather Wallet',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1517254797898-6532a461b690?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'LocalCraft',
    slug: 'handmade-leather-wallet',
    inStock: true,
  },
  {
    id: 'prod-004',
    title: 'Sustainable Bamboo Toothbrush',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1559674309-3aab33af9061?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'EcoHome',
    slug: 'sustainable-bamboo-toothbrush',
    inStock: true,
  },
  {
    id: 'prod-005',
    title: 'Organic Hemp Face Mask',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1598887142487-3c854d2171b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'WellBeing',
    slug: 'organic-hemp-face-mask',
    inStock: true,
  },
  {
    id: 'prod-006',
    title: 'Recycled Plastic Backpack',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    brand: 'LocalCraft',
    slug: 'recycled-plastic-backpack',
    inStock: true,
  }
];

// Function to get brand ID from name for test purposes
export const getBrandIdFromName = (brandName: string): string => {
  const brandMap: Record<string, string> = {
    'EcoWear': 'brand-001',
    'LocalCraft': 'brand-002',
    'EcoHome': 'brand-003',
    'WellBeing': 'brand-004',
  };
  
  return brandMap[brandName] || 'brand-unknown';
};

// Mock shipping information by brand
export const mockShippingInfo: Record<string, { freeShipping: boolean, minimumForFree: number, baseRate: number }> = {
  'EcoWear': { freeShipping: false, minimumForFree: 75, baseRate: 5.99 },
  'LocalCraft': { freeShipping: true, minimumForFree: 0, baseRate: 0 },
  'EcoHome': { freeShipping: false, minimumForFree: 50, baseRate: 4.99 },
  'WellBeing': { freeShipping: false, minimumForFree: 35, baseRate: 3.99 },
};
