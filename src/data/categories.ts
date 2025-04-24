import { Category } from '@/types/search';

export const categories: Category[] = [
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    icon: '👕',
    subCategories: [
      {
        id: 'mens',
        name: "Men's Clothing",
        parentId: 'clothing',
        attributes: [
          {
            name: 'Size',
            type: 'size',
            values: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
          },
          {
            name: 'Color',
            type: 'color',
            values: ['Black', 'White', 'Blue', 'Red', 'Green']
          }
        ]
      },
      {
        id: 'womens',
        name: "Women's Clothing",
        parentId: 'clothing',
        attributes: [
          {
            name: 'Size',
            type: 'size',
            values: ['XS', 'S', 'M', 'L', 'XL']
          },
          {
            name: 'Color',
            type: 'color',
            values: ['Black', 'White', 'Blue', 'Red', 'Pink']
          }
        ]
      },
      {
        id: 'accessories',
        name: 'Accessories',
        parentId: 'clothing',
        attributes: [
          {
            name: 'Type',
            type: 'style',
            values: ['Bags', 'Jewelry', 'Watches', 'Scarves']
          }
        ]
      }
    ]
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: '🏠',
    subCategories: [
      {
        id: 'furniture',
        name: 'Furniture',
        parentId: 'home',
        attributes: [
          {
            name: 'Room',
            type: 'style',
            values: ['Living Room', 'Bedroom', 'Dining Room', 'Office']
          },
          {
            name: 'Material',
            type: 'material',
            values: ['Wood', 'Metal', 'Glass', 'Fabric']
          }
        ]
      },
      {
        id: 'decor',
        name: 'Home Decor',
        parentId: 'home',
        attributes: [
          {
            name: 'Type',
            type: 'style',
            values: ['Wall Art', 'Vases', 'Candles', 'Pillows']
          }
        ]
      }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    icon: '✨',
    subCategories: [
      {
        id: 'skincare',
        name: 'Skincare',
        parentId: 'beauty',
        attributes: [
          {
            name: 'Skin Type',
            type: 'style',
            values: ['Dry', 'Oily', 'Combination', 'Sensitive']
          },
          {
            name: 'Product Type',
            type: 'style',
            values: ['Cleanser', 'Moisturizer', 'Serum', 'Mask']
          }
        ]
      },
      {
        id: 'makeup',
        name: 'Makeup',
        parentId: 'beauty',
        attributes: [
          {
            name: 'Product Type',
            type: 'style',
            values: ['Face', 'Eyes', 'Lips', 'Brushes']
          }
        ]
      }
    ]
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    icon: '🍽️',
    subCategories: [
      {
        id: 'snacks',
        name: 'Snacks',
        parentId: 'food',
        attributes: [
          {
            name: 'Dietary',
            type: 'style',
            values: ['Vegan', 'Gluten-Free', 'Keto', 'Organic']
          }
        ]
      },
      {
        id: 'beverages',
        name: 'Beverages',
        parentId: 'food',
        attributes: [
          {
            name: 'Type',
            type: 'style',
            values: ['Coffee', 'Tea', 'Juice', 'Kombucha']
          }
        ]
      }
    ]
  },
  {
    id: 'art',
    name: 'Art & Craft',
    icon: '🎨',
    subCategories: [
      {
        id: 'paintings',
        name: 'Paintings',
        parentId: 'art',
        attributes: [
          {
            name: 'Style',
            type: 'style',
            values: ['Abstract', 'Modern', 'Traditional', 'Pop Art']
          },
          {
            name: 'Medium',
            type: 'material',
            values: ['Oil', 'Acrylic', 'Watercolor', 'Digital']
          }
        ]
      },
      {
        id: 'crafts',
        name: 'Handmade Crafts',
        parentId: 'art',
        attributes: [
          {
            name: 'Material',
            type: 'material',
            values: ['Wood', 'Ceramic', 'Textile', 'Metal']
          }
        ]
      }
    ]
  }
];
