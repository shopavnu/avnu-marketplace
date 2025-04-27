export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
  slug: string;
  featured?: boolean;
}

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Home',
    image: '/images/categories/home.jpg',
    description: 'Sustainable home goods and decor',
    slug: 'home',
    featured: true
  },
  {
    id: 'cat-2',
    name: 'Art',
    image: '/images/categories/art.jpg',
    description: 'Unique pieces from independent artists',
    slug: 'art',
    featured: true
  },
  {
    id: 'cat-3',
    name: 'Lighting',
    image: '/images/categories/lighting.jpg',
    description: 'Handcrafted and sustainable lighting',
    slug: 'lighting',
    featured: true
  },
  {
    id: 'cat-4',
    name: 'Bedding',
    image: '/images/categories/bedding.jpg',
    description: 'Organic and fair trade textiles',
    slug: 'bedding',
    featured: true
  },
  {
    id: 'cat-5',
    name: 'Kitchen',
    image: '/images/categories/kitchen.jpg',
    description: 'Eco-friendly kitchen essentials',
    slug: 'kitchen',
    featured: true
  },
  {
    id: 'cat-6',
    name: 'Textiles',
    image: '/images/categories/textiles.jpg',
    description: 'Sustainable fabrics and materials',
    slug: 'textiles',
    featured: true
  },
  {
    id: 'cat-7',
    name: 'Furniture',
    image: '/images/categories/furniture.jpg',
    description: 'Ethically produced furniture',
    slug: 'furniture',
    featured: false
  },
  {
    id: 'cat-8',
    name: 'Accessories',
    image: '/images/categories/accessories.jpg',
    description: 'Sustainable personal accessories',
    slug: 'accessories',
    featured: false
  },
  {
    id: 'cat-9',
    name: 'Bath',
    image: '/images/categories/bath.jpg',
    description: 'Eco-friendly bath products',
    slug: 'bath',
    featured: false
  },
  {
    id: 'cat-10',
    name: 'Outdoor',
    image: '/images/categories/outdoor.jpg',
    description: 'Sustainable outdoor living',
    slug: 'outdoor',
    featured: false
  },
  {
    id: 'cat-11',
    name: 'Plants',
    image: '/images/categories/plants.jpg',
    description: 'Indoor plants and planters',
    slug: 'plants',
    featured: false
  },
  {
    id: 'cat-12',
    name: 'Gifts',
    image: '/images/categories/gifts.jpg',
    description: 'Curated sustainable gift ideas',
    slug: 'gifts',
    featured: false
  }
];

// Helper function to get featured categories
export const getFeaturedCategories = (): Category[] => {
  return categories.filter(category => category.featured);
};

// Helper function to get a category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};

export default categories;
