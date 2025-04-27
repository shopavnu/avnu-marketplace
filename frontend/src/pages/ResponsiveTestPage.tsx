import React from 'react';
import dynamic from 'next/dynamic';
import { Product } from '../types/product';

// Make the entire page client-side only to avoid window is not defined errors
const ResponsiveTestPageContent = dynamic(
  () => import('../components/product/ResponsiveTestPage').then(mod => mod.default),
  { ssr: false }
);

// Sample products with responsive images
const sampleProducts: Product[] = [
  {
    id: 'product-1',
    title: 'Modern Minimalist Chair',
    description: 'Ergonomic design with premium materials for maximum comfort. Perfect for home office or living room.',
    price: 149.99,
    compareAtPrice: 199.99,
    images: ['https://via.placeholder.com/800x800?text=Chair+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Chair+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Chair+Tablet'],
    categories: ['Furniture', 'Chairs'],
    merchantId: 'merchant-1',
    brandName: 'Modern Living',
    externalId: 'ext-1',
    externalSource: 'manual',
    slug: 'modern-minimalist-chair',
    isOnSale: true,
    discountPercentage: 25
  },
  {
    id: 'product-2',
    title: 'Handcrafted Ceramic Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs. Each piece is unique with subtle variations in glaze and texture.',
    price: 39.99,
    images: ['https://via.placeholder.com/800x800?text=Mugs+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Mugs+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Mugs+Tablet'],
    categories: ['Kitchen', 'Tableware'],
    merchantId: 'merchant-2',
    brandName: 'Artisan Crafts',
    externalId: 'ext-2',
    externalSource: 'manual',
    slug: 'handcrafted-ceramic-mug-set',
    featured: true
  },
  {
    id: 'product-3',
    title: 'Smart Home Security Camera',
    description: 'HD wireless security camera with motion detection, night vision, and two-way audio. Easy to install and connects to your smartphone.',
    price: 79.99,
    compareAtPrice: 99.99,
    images: ['https://via.placeholder.com/800x800?text=Camera+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Camera+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Camera+Tablet'],
    categories: ['Electronics', 'Smart Home'],
    merchantId: 'merchant-3',
    brandName: 'TechSmart',
    externalId: 'ext-3',
    externalSource: 'manual',
    slug: 'smart-home-security-camera',
    isOnSale: true,
    discountPercentage: 20
  },
  {
    id: 'product-4',
    title: 'Organic Cotton Throw Blanket',
    description: 'Soft, cozy throw blanket made from 100% organic cotton. Perfect for snuggling on the couch or adding warmth to your bed.',
    price: 59.99,
    images: ['https://via.placeholder.com/800x800?text=Blanket+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Blanket+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Blanket+Tablet'],
    categories: ['Home Decor', 'Bedding'],
    merchantId: 'merchant-4',
    brandName: 'Eco Home',
    externalId: 'ext-4',
    externalSource: 'manual',
    slug: 'organic-cotton-throw-blanket'
  },
  {
    id: 'product-5',
    title: 'Stainless Steel Water Bottle',
    description: 'Double-walled insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof and eco-friendly.',
    price: 29.99,
    compareAtPrice: 34.99,
    images: ['https://via.placeholder.com/800x800?text=Bottle+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Bottle+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Bottle+Tablet'],
    categories: ['Kitchen', 'Drinkware'],
    merchantId: 'merchant-5',
    brandName: 'EcoVessel',
    externalId: 'ext-5',
    externalSource: 'manual',
    slug: 'stainless-steel-water-bottle',
    isOnSale: true,
    discountPercentage: 14
  },
  {
    id: 'product-6',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life. Comfortable over-ear design with memory foam ear cushions.',
    price: 199.99,
    images: ['https://via.placeholder.com/800x800?text=Headphones+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Headphones+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Headphones+Tablet'],
    categories: ['Electronics', 'Audio'],
    merchantId: 'merchant-6',
    brandName: 'SoundPro',
    externalId: 'ext-6',
    externalSource: 'manual',
    slug: 'wireless-bluetooth-headphones',
    featured: true
  }
];

// Simple wrapper component that renders the client-side only content
const ResponsiveTestPage = () => {
  return <ResponsiveTestPageContent products={sampleProducts} />;
};

export default ResponsiveTestPage;
