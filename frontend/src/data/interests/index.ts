// Primary interest categories
export type PrimaryCategory = {
  id: string;
  name: string;
  image: string;
  description: string;
};

// Secondary interest categories
export type SecondaryCategory = {
  id: string;
  name: string;
  image: string;
  primaryCategoryId: string;
  description: string;
};

// Primary interest categories
export const primaryCategories: PrimaryCategory[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&q=80&w=800',
    description: 'Discover the latest trends in clothing, accessories, and more'
  },
  {
    id: 'home-decor',
    name: 'Home & Decor',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&q=80&w=800',
    description: 'Transform your living space with stylish furniture and decor'
  },
  {
    id: 'tech',
    name: 'Technology',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&q=80&w=800',
    description: 'Explore the newest gadgets, electronics, and smart devices'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&q=80&w=800',
    description: 'Find makeup, skincare, and personal care products'
  },
  {
    id: 'outdoors',
    name: 'Outdoors',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&q=80&w=800',
    description: 'Gear up for camping, hiking, and outdoor adventures'
  },
  {
    id: 'fitness',
    name: 'Fitness',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&q=80&w=800',
    description: 'Discover workout gear, equipment, and fitness accessories'
  },
  {
    id: 'pets',
    name: 'Pets',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&q=80&w=800',
    description: 'Find everything for your furry, feathered, or scaly friends'
  },
  {
    id: 'food',
    name: 'Food & Drink',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&q=80&w=800',
    description: 'Explore gourmet foods, cooking tools, and specialty drinks'
  },
  {
    id: 'books',
    name: 'Books & Media',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&q=80&w=800',
    description: 'Discover books, music, movies, and other media'
  },
  {
    id: 'art',
    name: 'Art & Crafts',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&q=80&w=800',
    description: 'Find supplies and inspiration for your creative projects'
  },
  {
    id: 'kids',
    name: 'Kids & Baby',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&q=80&w=800',
    description: 'Shop for toys, clothing, and essentials for children'
  },
  {
    id: 'wellness',
    name: 'Health & Wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&q=80&w=800',
    description: 'Explore natural remedies, supplements, and wellness products'
  }
];

// Secondary interest categories
export const secondaryCategories: SecondaryCategory[] = [
  // Fashion subcategories
  {
    id: 'womens-fashion',
    name: 'Women\'s Fashion',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&q=80&w=800',
    primaryCategoryId: 'fashion',
    description: 'Clothing, shoes, and accessories for women'
  },
  {
    id: 'mens-fashion',
    name: 'Men\'s Fashion',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&q=80&w=800',
    primaryCategoryId: 'fashion',
    description: 'Clothing, shoes, and accessories for men'
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Watches',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&q=80&w=800',
    primaryCategoryId: 'fashion',
    description: 'Fine jewelry, watches, and accessories'
  },
  {
    id: 'sustainable-fashion',
    name: 'Sustainable Fashion',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&q=80&w=800',
    primaryCategoryId: 'fashion',
    description: 'Eco-friendly and ethically made clothing'
  },

  // Home & Decor subcategories
  {
    id: 'furniture',
    name: 'Furniture',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&q=80&w=800',
    primaryCategoryId: 'home-decor',
    description: 'Sofas, tables, chairs, and more'
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    image: 'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&q=80&w=800',
    primaryCategoryId: 'home-decor',
    description: 'Cookware, dinnerware, and kitchen accessories'
  },
  {
    id: 'bedding',
    name: 'Bedding & Bath',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&w=800',
    primaryCategoryId: 'home-decor',
    description: 'Sheets, towels, and bathroom accessories'
  },
  {
    id: 'decor',
    name: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&q=80&w=800',
    primaryCategoryId: 'home-decor',
    description: 'Decorative accents, wall art, and more'
  },

  // Technology subcategories
  {
    id: 'computers',
    name: 'Computers & Laptops',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&q=80&w=800',
    primaryCategoryId: 'tech',
    description: 'Desktops, laptops, and computer accessories'
  },
  {
    id: 'smartphones',
    name: 'Smartphones & Accessories',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&q=80&w=800',
    primaryCategoryId: 'tech',
    description: 'Phones, cases, and mobile accessories'
  },
  {
    id: 'audio',
    name: 'Audio & Headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&q=80&w=800',
    primaryCategoryId: 'tech',
    description: 'Headphones, speakers, and audio equipment'
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    image: 'https://images.unsplash.com/photo-1558002038-bb0237f1b416?auto=format&q=80&w=800',
    primaryCategoryId: 'tech',
    description: 'Smart speakers, lighting, and home automation'
  },

  // Outdoors subcategories
  {
    id: 'camping',
    name: 'Camping & Hiking',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&q=80&w=800',
    primaryCategoryId: 'outdoors',
    description: 'Tents, backpacks, and camping gear'
  },
  {
    id: 'fishing',
    name: 'Fishing',
    image: 'https://images.unsplash.com/photo-1542643299-be5d00d22bd3?auto=format&q=80&w=800',
    primaryCategoryId: 'outdoors',
    description: 'Rods, reels, and fishing accessories'
  },
  {
    id: 'water-sports',
    name: 'Water Sports',
    image: 'https://images.unsplash.com/photo-1530349115551-89d5654ae1a3?auto=format&q=80&w=800',
    primaryCategoryId: 'outdoors',
    description: 'Kayaking, paddleboarding, and swimming gear'
  },
  {
    id: 'winter-sports',
    name: 'Winter Sports',
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&q=80&w=800',
    primaryCategoryId: 'outdoors',
    description: 'Skiing, snowboarding, and winter gear'
  },

  // Pets subcategories
  {
    id: 'dog',
    name: 'Dog Supplies',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&q=80&w=800',
    primaryCategoryId: 'pets',
    description: 'Food, toys, and accessories for dogs'
  },
  {
    id: 'cat',
    name: 'Cat Supplies',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&q=80&w=800',
    primaryCategoryId: 'pets',
    description: 'Food, toys, and accessories for cats'
  },
  {
    id: 'small-pets',
    name: 'Small Pet Supplies',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&q=80&w=800',
    primaryCategoryId: 'pets',
    description: 'Supplies for birds, fish, reptiles, and small mammals'
  },
  {
    id: 'pet-health',
    name: 'Pet Health & Wellness',
    image: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&q=80&w=800',
    primaryCategoryId: 'pets',
    description: 'Supplements, grooming, and health products'
  }
];
