import { Brand } from '@/types/brand';
import { Product } from '@/types/products';
import { productImages } from '@/data/productImages';

// Brand image URLs from Unsplash
const brandImages = [
  'photo-1441986300917-64674bd600d8', // Store 1
  'photo-1441984904996-e0b6ba687e04', // Store 2
  'photo-1543007630-9710e4a00a20', // Store 3
  'photo-1534452203293-494d7ddbf7e0', // Store 4
  'photo-1472851294608-062f824d29cc', // Store 5
  'photo-1606293459209-958d5c67c84b', // Store 6
  'photo-1604719312566-8912e9227c6a', // Store 7
  'photo-1604014237800-1c9102c219da', // Store 8
];

// Helper function to generate mock brands
export const generateMockBrands = (seed = 1) => Array.from({ length: 8 }, (_, i) => {
  const brandIndex = i + 1;
  const categories = ['Apparel', 'Accessories', 'Home Goods', 'Beauty', 'Electronics'];
  const locations = ['Portland, OR', 'Seattle, WA', 'San Francisco, CA', 'Austin, TX'];
  const values = [
    ['sustainable', 'eco-friendly', 'ethical-production'],
    ['local-made', 'artisan', 'fair-trade'],
    ['sustainable', 'eco-friendly', 'ethical-production'],
    ['organic', 'cruelty-free', 'vegan'],
    ['innovative', 'eco-friendly', 'tech-forward'],
    ['artisan', 'handmade', 'local-made'],
    ['sustainable', 'fair-trade', 'ethical-production'],
    ['innovative', 'tech-forward', 'eco-friendly'],
  ];

  return {
    id: `brand-${brandIndex}`,
    name: `Brand ${brandIndex}`,
    description: `Specializing in ${categories[i % categories.length]} with a focus on sustainable and ethical production.`,
    coverImage: `https://images.unsplash.com/${brandImages[i]}?auto=format&fit=crop&w=1200&q=80`,
    logo: `https://images.unsplash.com/${brandImages[(i + 3) % 8]}?auto=format&fit=crop&w=200&q=80`,
    location: locations[i % locations.length],
    categories: [categories[i % categories.length]],
    primaryCategory: categories[i % categories.length] as Brand['primaryCategory'],
    secondaryCategories: [
      // Add relevant secondary categories based on primary category
      ...(categories[i % categories.length] === 'Apparel' ? ['Baby', 'Sports'] as const : []),
      ...(categories[i % categories.length] === 'Accessories' ? ['Pet Products', 'Sports'] as const : []),
      ...(categories[i % categories.length] === 'Home Goods' ? ['Baby', 'Pet Products'] as const : []),
      ...(categories[i % categories.length] === 'Beauty' ? ['Wellness'] as const : []),
      ...(categories[i % categories.length] === 'Electronics' ? ['Sports', 'Wellness'] as const : [])
    ],
    values: values[i],
    productCount: 10 + (brandIndex * 5),
    rating: 4 + (brandIndex % 2) * 0.5,
    isVerified: true,
    joinedDate: new Date(2024, 0, brandIndex).toISOString()
  };
});

// Generate mock products for a specific brand and category
export const generateBrandProducts = (brand: Brand & { values: string[] }, category: string) => {
  const images = productImages[category as keyof typeof productImages];
  
  return Array.from({ length: 8 }, (_, i) => {
    const productIndex = i + 1;
    let subCategories: string[] = [];
    let attributes: Record<string, string[]> = {};
    
    // Category-specific subcategories and attributes
    switch(category) {
      case 'Apparel':
        subCategories = ['Tops', 'Bottoms', 'Outerwear', 'Dresses'];
        attributes = {
          material: ['Organic Cotton', 'Recycled Polyester', 'Hemp', 'Bamboo'],
          fit: ['Regular', 'Slim', 'Relaxed', 'Oversized']
        };
        break;
      case 'Accessories':
        subCategories = ['Jewelry', 'Bags', 'Watches', 'Eyewear'];
        attributes = {
          material: ['Recycled Metal', 'Vegan Leather', 'Sustainable Wood', 'Organic Cotton'],
          style: ['Classic', 'Modern', 'Minimalist', 'Statement']
        };
        break;
      case 'Home Goods':
        subCategories = ['Decor', 'Furniture', 'Textiles', 'Lighting'];
        attributes = {
          material: ['Bamboo', 'Recycled Materials', 'Organic Cotton', 'Sustainable Wood'],
          style: ['Modern', 'Minimalist', 'Scandinavian', 'Bohemian']
        };
        break;
      case 'Beauty':
        subCategories = ['Skincare', 'Makeup', 'Hair Care', 'Bath & Body'];
        attributes = {
          type: ['Natural', 'Organic', 'Vegan', 'Cruelty-free'],
          concern: ['Anti-aging', 'Hydrating', 'Brightening', 'Clarifying']
        };
        break;
      case 'Electronics':
        subCategories = ['Audio', 'Computing', 'Mobile', 'Accessories'];
        attributes = {
          features: ['Eco-friendly', 'Energy Efficient', 'Recyclable', 'Long-lasting'],
          usage: ['Personal', 'Professional', 'Gaming', 'Creative']
        };
        break;
    }

    return {
      id: `${brand.id}-product-${productIndex}`,
      title: `${subCategories[i % subCategories.length]} Item ${productIndex}`,
      description: `Premium ${category.toLowerCase()} item crafted with sustainability in mind.`,
      price: 45 + (productIndex * 15),
      image: `https://images.unsplash.com/${images[i]}?auto=format&fit=crop&w=800&q=80`,
      images: [`https://images.unsplash.com/${images[i]}?auto=format&fit=crop&w=800&q=80`],
      brand: brand.name,
      category: category,
      subCategory: subCategories[i % subCategories.length],
      attributes: {
        [Object.keys(attributes)[0]]: attributes[Object.keys(attributes)[0]][i % 4],
        [Object.keys(attributes)[1]]: attributes[Object.keys(attributes)[1]][i % 4]
      },
      isNew: i < 2,
      rating: {
        shopifyRating: {
          average: 4.5,
          count: 30 + i
        },
        avnuRating: {
          average: 4.5,
          count: 15 + i
        }
      },
      vendor: {
        id: brand.id,
        name: brand.name,
        causes: brand.values,
        isLocal: true,
        shippingInfo: {
          isFree: true,
          minimumForFree: 75,
          baseRate: 7.99
        }
      },
      inStock: true,
      tags: brand.values,
      createdAt: new Date(2024, 0, i + 1).toISOString()
    };
  });
};
