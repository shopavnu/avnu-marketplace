// Section types for vertical discovery feed
export enum SectionType {
  FEATURED = 'FEATURED',
  NEW_ARRIVALS = 'NEW_ARRIVALS',
  TRENDING = 'TRENDING',
  FOR_YOU = 'FOR_YOU',
  SUSTAINABLE = 'SUSTAINABLE',
  HANDMADE = 'HANDMADE',
  LOCAL = 'LOCAL',
  CATEGORY_SPOTLIGHT = 'CATEGORY_SPOTLIGHT',
  BRAND_SPOTLIGHT = 'BRAND_SPOTLIGHT',
  SEASONAL = 'SEASONAL',
  BESTSELLERS = 'BESTSELLERS'
}

export interface Section {
  id: string;
  title: string;
  description: string;
  type: SectionType;
  layout: 'grid' | 'masonry' | 'featured';
  backgroundColor?: string;
  productCount: number;
  priority: number; // Used for ordering sections
  items?: any[]; // Array of products or other items for this section
}

export const discoverySections: Section[] = [
  {
    id: 'featured',
    title: 'Featured Products',
    description: 'Curated selection of exceptional products',
    type: SectionType.FEATURED,
    layout: 'grid',
    backgroundColor: 'bg-warm-white',
    productCount: 8,
    priority: 1
  },
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    description: 'Just landed on Avnu',
    type: SectionType.NEW_ARRIVALS,
    layout: 'grid',
    backgroundColor: 'bg-sage/5',
    productCount: 8,
    priority: 2
  },
  {
    id: 'for-you',
    title: 'For You',
    description: 'Products we think you\'ll love based on your preferences',
    type: SectionType.FOR_YOU,
    layout: 'grid',
    backgroundColor: 'bg-warm-white',
    productCount: 24,
    priority: 3
  },
  {
    id: 'sustainable',
    title: 'Sustainable Choices',
    description: 'Products that are kind to the planet',
    type: SectionType.SUSTAINABLE,
    layout: 'grid',
    backgroundColor: 'bg-sage/5',
    productCount: 8,
    priority: 4
  },
  {
    id: 'handmade',
    title: 'Handcrafted Treasures',
    description: 'Unique pieces made with care',
    type: SectionType.HANDMADE,
    layout: 'grid',
    backgroundColor: 'bg-warm-white',
    productCount: 8,
    priority: 5
  },
  {
    id: 'local',
    title: 'Shop Local',
    description: 'Support businesses in your community',
    type: SectionType.LOCAL,
    layout: 'grid',
    backgroundColor: 'bg-sage/5',
    productCount: 8,
    priority: 6
  },
  {
    id: 'trending',
    title: 'Trending Now',
    description: 'What\'s popular this week',
    type: SectionType.TRENDING,
    layout: 'grid',
    backgroundColor: 'bg-warm-white',
    productCount: 8,
    priority: 7
  },
  {
    id: 'home-decor',
    title: 'Home Decor',
    description: 'Beautiful pieces for your space',
    type: SectionType.CATEGORY_SPOTLIGHT,
    layout: 'grid',
    backgroundColor: 'bg-sage/5',
    productCount: 8,
    priority: 8
  },
  {
    id: 'bestsellers',
    title: 'Bestsellers',
    description: 'Our most popular products',
    type: SectionType.BESTSELLERS,
    layout: 'grid',
    backgroundColor: 'bg-warm-white',
    productCount: 8,
    priority: 9
  }
];

// Helper function to get sections in priority order
export const getSectionsInOrder = () => {
  return [...discoverySections].sort((a, b) => a.priority - b.priority);
};

// Helper function to get a specific section by ID
export const getSectionById = (id: string) => {
  return discoverySections.find(section => section.id === id);
};

// Helper function to get sections by type
export const getSectionsByType = (type: SectionType) => {
  return discoverySections.filter(section => section.type === type);
};
