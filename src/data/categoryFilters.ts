import { BrandCategory, CategoryConfig } from '@/types/brand';

type CategoryFilters = {
  [K in BrandCategory]: CategoryConfig['filters'];
};

export const categoryFilters: CategoryFilters = {
  Baby: {
    categories: [
      {
        id: 'clothing',
        name: 'Clothing',
        subCategories: ['Bodysuits', 'Sleepwear', 'Outerwear', 'Accessories']
      },
      {
        id: 'gear',
        name: 'Gear',
        subCategories: ['Strollers', 'Car Seats', 'Carriers', 'Playtime']
      },
      {
        id: 'nursery',
        name: 'Nursery',
        subCategories: ['Furniture', 'Bedding', 'Decor', 'Storage']
      },
      {
        id: 'feeding',
        name: 'Feeding',
        subCategories: ['Bottles', 'Bibs', 'High Chairs', 'Utensils']
      }
    ],
    attributes: {
      size: ['Newborn', '0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T'],
      gender: ['Boy', 'Girl', 'Unisex'],
      material: ['Organic Cotton', 'Bamboo', 'Cotton Blend', 'Fleece'],
      season: ['Spring/Summer', 'Fall/Winter', 'All Season']
    }
  },

  'Pet Products': {
    categories: [
      {
        id: 'food',
        name: 'Food & Treats',
        subCategories: ['Dry Food', 'Wet Food', 'Treats', 'Supplements']
      },
      {
        id: 'toys',
        name: 'Toys',
        subCategories: ['Chew Toys', 'Interactive', 'Plush', 'Training']
      },
      {
        id: 'supplies',
        name: 'Supplies',
        subCategories: ['Beds', 'Collars & Leashes', 'Bowls', 'Grooming']
      },
      {
        id: 'health',
        name: 'Health & Wellness',
        subCategories: ['Medications', 'Vitamins', 'First Aid', 'Dental Care']
      }
    ],
    attributes: {
      petType: ['Dog', 'Cat', 'Small Pet', 'Bird', 'Fish'],
      lifestage: ['Puppy/Kitten', 'Adult', 'Senior'],
      size: ['Small', 'Medium', 'Large', 'X-Large'],
      features: ['Natural', 'Grain-Free', 'Eco-Friendly', 'Made in USA']
    }
  },

  Outdoor: {
    categories: [
      {
        id: 'camping',
        name: 'Camping',
        subCategories: ['Tents', 'Sleeping Bags', 'Backpacks', 'Cooking']
      },
      {
        id: 'hiking',
        name: 'Hiking',
        subCategories: ['Boots', 'Poles', 'Navigation', 'Hydration']
      },
      {
        id: 'clothing',
        name: 'Clothing',
        subCategories: ['Jackets', 'Pants', 'Base Layers', 'Accessories']
      },
      {
        id: 'gear',
        name: 'Gear',
        subCategories: ['Tools', 'Lighting', 'Safety', 'Storage']
      }
    ],
    attributes: {
      season: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
      activity: ['Camping', 'Hiking', 'Climbing', 'Water Sports'],
      weatherResistance: ['Waterproof', 'Water-Resistant', 'Windproof', 'UV Protection'],
      material: ['Nylon', 'Polyester', 'Merino Wool', 'Gore-Tex']
    }
  },

  Sports: {
    categories: [
      {
        id: 'equipment',
        name: 'Equipment',
        subCategories: ['Training', 'Game Play', 'Protection', 'Accessories']
      },
      {
        id: 'apparel',
        name: 'Apparel',
        subCategories: ['Tops', 'Bottoms', 'Footwear', 'Accessories']
      },
      {
        id: 'accessories',
        name: 'Accessories',
        subCategories: ['Bags', 'Hydration', 'Electronics', 'Recovery']
      },
      {
        id: 'nutrition',
        name: 'Nutrition',
        subCategories: ['Protein', 'Energy', 'Hydration', 'Recovery']
      }
    ],
    attributes: {
      sport: ['Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Running'],
      level: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      gender: ['Men', 'Women', 'Unisex'],
      size: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }
  },

  Books: {
    categories: [
      {
        id: 'fiction',
        name: 'Fiction',
        subCategories: ['Literary', 'Mystery', 'Science Fiction', 'Romance']
      },
      {
        id: 'non-fiction',
        name: 'Non-Fiction',
        subCategories: ['Business', 'Self-Help', 'History', 'Science']
      },
      {
        id: 'children',
        name: 'Children',
        subCategories: ['Picture Books', 'Chapter Books', 'Educational', 'Activity Books']
      },
      {
        id: 'academic',
        name: 'Academic',
        subCategories: ['Textbooks', 'Reference', 'Study Guides', 'Professional']
      }
    ],
    attributes: {
      format: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'],
      language: ['English', 'Spanish', 'French', 'German'],
      audience: ['Children', 'Young Adult', 'Adult', 'Professional'],
      condition: ['New', 'Like New', 'Good', 'Acceptable']
    }
  },

  'Food & Beverage': {
    categories: [
      {
        id: 'pantry',
        name: 'Pantry',
        subCategories: ['Snacks', 'Baking', 'Condiments', 'Canned Goods']
      },
      {
        id: 'beverages',
        name: 'Beverages',
        subCategories: ['Coffee', 'Tea', 'Juice', 'Water']
      },
      {
        id: 'specialty',
        name: 'Specialty',
        subCategories: ['Organic', 'Gluten-Free', 'Vegan', 'International']
      },
      {
        id: 'fresh',
        name: 'Fresh',
        subCategories: ['Produce', 'Dairy', 'Meat', 'Bakery']
      }
    ],
    attributes: {
      dietary: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo'],
      allergens: ['Nut-Free', 'Dairy-Free', 'Soy-Free', 'Egg-Free'],
      certification: ['Organic', 'Non-GMO', 'Fair Trade', 'Kosher'],
      packaging: ['Single Serve', 'Family Size', 'Bulk', 'Gift Pack']
    }
  },

  'Art & Crafts': {
    categories: [
      {
        id: 'drawing',
        name: 'Drawing & Painting',
        subCategories: ['Pencils', 'Paint', 'Canvas', 'Paper']
      },
      {
        id: 'crafting',
        name: 'Crafting',
        subCategories: ['Yarn', 'Fabric', 'Beads', 'Tools']
      },
      {
        id: 'kids',
        name: 'Kids Art',
        subCategories: ['Coloring', 'Clay', 'Craft Kits', 'School Supplies']
      },
      {
        id: 'storage',
        name: 'Storage & Organization',
        subCategories: ['Cases', 'Boxes', 'Bags', 'Furniture']
      }
    ],
    attributes: {
      skill: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      medium: ['Acrylic', 'Watercolor', 'Oil', 'Mixed Media'],
      age: ['Kids', 'Teen', 'Adult', 'All Ages'],
      quality: ['Student', 'Artist', 'Professional', 'Premium']
    }
  },

  'Toys & Games': {
    categories: [
      {
        id: 'toys',
        name: 'Toys',
        subCategories: ['Action Figures', 'Dolls', 'Building', 'Vehicles']
      },
      {
        id: 'games',
        name: 'Games',
        subCategories: ['Board Games', 'Card Games', 'Puzzles', 'Educational']
      },
      {
        id: 'outdoor',
        name: 'Outdoor Play',
        subCategories: ['Sports', 'Ride-Ons', 'Water Toys', 'Playsets']
      },
      {
        id: 'electronics',
        name: 'Electronic Toys',
        subCategories: ['Remote Control', 'Interactive', 'Learning', 'Gaming']
      }
    ],
    attributes: {
      age: ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', '12+ Years'],
      type: ['Educational', 'Active Play', 'Creative', 'Strategy'],
      players: ['Single Player', '2 Players', '2-4 Players', '4+ Players'],
      skill: ['Motor Skills', 'Problem Solving', 'Social Skills', 'STEM']
    }
  },

  Wellness: {
    categories: [
      {
        id: 'supplements',
        name: 'Supplements',
        subCategories: ['Vitamins', 'Minerals', 'Herbs', 'Sports Nutrition']
      },
      {
        id: 'fitness',
        name: 'Fitness',
        subCategories: ['Equipment', 'Apparel', 'Accessories', 'Recovery']
      },
      {
        id: 'personal-care',
        name: 'Personal Care',
        subCategories: ['Bath & Body', 'Aromatherapy', 'Sleep', 'Stress Relief']
      },
      {
        id: 'health-tech',
        name: 'Health Tech',
        subCategories: ['Trackers', 'Apps', 'Devices', 'Smart Equipment']
      }
    ],
    attributes: {
      goal: ['Energy', 'Immunity', 'Sleep', 'Stress Relief', 'Fitness'],
      form: ['Capsules', 'Tablets', 'Powder', 'Liquid', 'Gummies'],
      dietary: ['Vegan', 'Gluten-Free', 'Non-GMO', 'Organic'],
      certification: ['GMP', 'NSF', 'USDA Organic', 'Third-Party Tested']
    }
  },

  Stationery: {
    categories: [
      {
        id: 'writing',
        name: 'Writing Instruments',
        subCategories: ['Pens', 'Pencils', 'Markers', 'Highlighters']
      },
      {
        id: 'paper',
        name: 'Paper Products',
        subCategories: ['Notebooks', 'Planners', 'Cards', 'Sticky Notes']
      },
      {
        id: 'organization',
        name: 'Organization',
        subCategories: ['Folders', 'Binders', 'Desk Organizers', 'Storage']
      },
      {
        id: 'art-supplies',
        name: 'Art Supplies',
        subCategories: ['Coloring', 'Drawing', 'Crafting', 'Journaling']
      }
    ],
    attributes: {
      use: ['School', 'Office', 'Personal', 'Art'],
      style: ['Classic', 'Modern', 'Minimalist', 'Decorative'],
      material: ['Paper', 'Plastic', 'Metal', 'Recycled'],
      features: ['Refillable', 'Eco-Friendly', 'Premium', 'Limited Edition']
    }
  },


  'Apparel': {
    categories: [
      {
        id: 'tops',
        name: 'Tops',
        subCategories: ['T-Shirts', 'Shirts', 'Sweaters', 'Hoodies', 'Blouses']
      },
      {
        id: 'bottoms',
        name: 'Bottoms',
        subCategories: ['Pants', 'Jeans', 'Shorts', 'Skirts']
      },
      {
        id: 'outerwear',
        name: 'Outerwear',
        subCategories: ['Jackets', 'Coats', 'Blazers']
      },
      {
        id: 'dresses',
        name: 'Dresses',
        subCategories: ['Casual', 'Formal', 'Summer', 'Winter']
      }
    ],
    attributes: {
      size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      color: ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Gray'],
      material: ['Cotton', 'Linen', 'Wool', 'Polyester', 'Silk', 'Denim'],
      fit: ['Regular', 'Slim', 'Relaxed', 'Oversized']
    }
  },
  'Accessories': {
    categories: [
      {
        id: 'jewelry',
        name: 'Jewelry',
        subCategories: ['Necklaces', 'Earrings', 'Bracelets', 'Rings']
      },
      {
        id: 'bags',
        name: 'Bags',
        subCategories: ['Handbags', 'Backpacks', 'Wallets', 'Totes']
      },
      {
        id: 'watches',
        name: 'Watches',
        subCategories: ['Analog', 'Digital', 'Smart', 'Luxury']
      },
      {
        id: 'other',
        name: 'Other',
        subCategories: ['Belts', 'Scarves', 'Hats', 'Sunglasses']
      }
    ],
    attributes: {
      material: ['Gold', 'Silver', 'Leather', 'Canvas', 'Stainless Steel'],
      style: ['Classic', 'Modern', 'Casual', 'Luxury'],
      color: ['Gold', 'Silver', 'Black', 'Brown', 'Multi'],
      priceRange: ['Budget', 'Mid-range', 'Premium', 'Luxury']
    }
  },
  'Home Goods': {
    categories: [
      {
        id: 'furniture',
        name: 'Furniture',
        subCategories: ['Seating', 'Tables', 'Storage', 'Beds']
      },
      {
        id: 'decor',
        name: 'Decor',
        subCategories: ['Wall Art', 'Vases', 'Mirrors', 'Pillows']
      },
      {
        id: 'lighting',
        name: 'Lighting',
        subCategories: ['Table Lamps', 'Floor Lamps', 'Pendant Lights', 'Sconces']
      },
      {
        id: 'textiles',
        name: 'Textiles',
        subCategories: ['Rugs', 'Curtains', 'Throws', 'Bedding']
      }
    ],
    attributes: {
      material: ['Wood', 'Metal', 'Glass', 'Ceramic', 'Textile'],
      style: ['Modern', 'Traditional', 'Minimalist', 'Bohemian', 'Industrial'],
      color: ['Natural', 'White', 'Black', 'Gray', 'Brown', 'Colorful'],
      room: ['Living Room', 'Bedroom', 'Dining Room', 'Office']
    }
  },
  'Beauty': {
    categories: [
      {
        id: 'skincare',
        name: 'Skincare',
        subCategories: ['Cleansers', 'Moisturizers', 'Serums', 'Masks']
      },
      {
        id: 'makeup',
        name: 'Makeup',
        subCategories: ['Face', 'Eyes', 'Lips', 'Brushes']
      },
      {
        id: 'haircare',
        name: 'Hair Care',
        subCategories: ['Shampoo', 'Conditioner', 'Styling', 'Treatment']
      },
      {
        id: 'fragrance',
        name: 'Fragrance',
        subCategories: ['Perfume', 'Cologne', 'Body Spray', 'Essential Oils']
      }
    ],
    attributes: {
      skinType: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
      concern: ['Anti-aging', 'Acne', 'Brightening', 'Hydrating'],
      formulation: ['Cream', 'Liquid', 'Gel', 'Oil', 'Powder'],
      benefits: ['Hydrating', 'Brightening', 'Firming', 'Clarifying']
    }
  },
  'Electronics': {
    categories: [
      {
        id: 'computers',
        name: 'Computers',
        subCategories: ['Laptops', 'Desktops', 'Tablets', 'Accessories']
      },
      {
        id: 'audio',
        name: 'Audio',
        subCategories: ['Headphones', 'Speakers', 'Earbuds', 'Microphones']
      },
      {
        id: 'mobile',
        name: 'Mobile',
        subCategories: ['Phones', 'Cases', 'Chargers', 'Accessories']
      },
      {
        id: 'gaming',
        name: 'Gaming',
        subCategories: ['Consoles', 'Controllers', 'Games', 'Accessories']
      }
    ],
    attributes: {
      brand: ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google'],
      condition: ['New', 'Refurbished', 'Open Box'],
      features: ['Wireless', 'Bluetooth', 'USB-C', 'Touch Screen'],
      usage: ['Personal', 'Professional', 'Gaming', 'Creative']
    }
  }
};
