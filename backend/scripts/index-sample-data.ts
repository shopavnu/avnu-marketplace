/**
 * Script to index sample data in Elasticsearch
 * 
 * This script creates sample products, brands, and merchants
 * and indexes them in Elasticsearch with proper mappings and settings.
 */
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a logger
const logger = {
  log: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
};

// Create Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  },
});

// Define the mapping for products index
const productsMapping = {
  properties: {
    id: { type: 'keyword' },
    title: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
        ngram: {
          type: 'text',
          analyzer: 'ngram_analyzer',
        },
      },
    },
    description: {
      type: 'text',
      analyzer: 'english',
    },
    price: { type: 'float' },
    compareAtPrice: { type: 'float' },
    categories: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    tags: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    merchantId: { type: 'keyword' },
    brandName: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    isActive: { type: 'boolean' },
    inStock: { type: 'boolean' },
    quantity: { type: 'integer' },
    values: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};

// Define the mapping for brands index
const brandsMapping = {
  properties: {
    id: { type: 'keyword' },
    name: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
        ngram: {
          type: 'text',
          analyzer: 'ngram_analyzer',
        },
      },
    },
    description: {
      type: 'text',
      analyzer: 'english',
    },
    logo: { type: 'text' },
    website: { type: 'text' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};

// Define the mapping for merchants index
const merchantsMapping = {
  properties: {
    id: { type: 'keyword' },
    name: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
        ngram: {
          type: 'text',
          analyzer: 'ngram_analyzer',
        },
      },
    },
    description: {
      type: 'text',
      analyzer: 'english',
    },
    logo: { type: 'text' },
    website: { type: 'text' },
    categories: {
      type: 'text',
      analyzer: 'english',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};

// Define the settings for all indices
const indexSettings = {
  index: {
    max_ngram_diff: 3,  // Allow a larger difference between min_gram and max_gram
  },
  analysis: {
    analyzer: {
      ngram_analyzer: {
        type: 'custom',
        tokenizer: 'ngram_tokenizer',
        filter: ['lowercase'],
      },
    },
    tokenizer: {
      ngram_tokenizer: {
        type: 'ngram',
        min_gram: 2,
        max_gram: 4,
        token_chars: ['letter', 'digit'],
      },
    },
  },
};

// Sample data
const sampleProducts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'TechGear Pro Laptop',
    description: 'Powerful laptop for professionals and gamers',
    price: 1299.99,
    compareAtPrice: 1499.99,
    brandName: 'TechGear',
    categories: ['Electronics', 'Computers'],
    tags: ['laptop', 'gaming', 'professional'],
    inStock: true,
    quantity: 50,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 899.99,
    compareAtPrice: 999.99,
    brandName: 'TechGear',
    categories: ['Electronics', 'Phones'],
    tags: ['smartphone', 'mobile', '5G'],
    inStock: true,
    quantity: 100,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    price: 249.99,
    compareAtPrice: 299.99,
    brandName: 'AudioPro',
    categories: ['Electronics', 'Audio'],
    tags: ['headphones', 'wireless', 'noise-cancelling'],
    inStock: true,
    quantity: 75,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt',
    price: 29.99,
    compareAtPrice: 39.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Sustainable'],
    tags: ['t-shirt', 'organic', 'sustainable'],
    inStock: true,
    quantity: 200,
    merchantId: 'merchant2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    title: 'Designer Jeans',
    description: 'Premium designer jeans with perfect fit',
    price: 129.99,
    compareAtPrice: 149.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Denim'],
    tags: ['jeans', 'designer', 'premium'],
    inStock: true,
    quantity: 150,
    merchantId: 'merchant2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    title: 'Running Shoes',
    description: 'Lightweight and comfortable running shoes',
    price: 89.99,
    compareAtPrice: 109.99,
    brandName: 'SportsPro',
    categories: ['Footwear', 'Athletic'],
    tags: ['shoes', 'running', 'athletic'],
    inStock: true,
    quantity: 100,
    merchantId: 'merchant3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    title: 'Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 79.99,
    compareAtPrice: 99.99,
    brandName: 'TechGear',
    categories: ['Electronics', 'Fitness'],
    tags: ['fitness', 'tracker', 'health'],
    inStock: true,
    quantity: 120,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    title: 'Smart Watch',
    description: 'Feature-rich smart watch with fitness tracking',
    price: 199.99,
    compareAtPrice: 249.99,
    brandName: 'TechGear',
    categories: ['Electronics', 'Wearables'],
    tags: ['watch', 'smart', 'fitness'],
    inStock: true,
    quantity: 80,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    title: 'Yoga Mat',
    description: 'Eco-friendly non-slip yoga mat',
    price: 39.99,
    compareAtPrice: 49.99,
    brandName: 'SportsPro',
    categories: ['Fitness', 'Yoga'],
    tags: ['yoga', 'mat', 'eco-friendly'],
    inStock: true,
    quantity: 150,
    merchantId: 'merchant3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Bluetooth Speaker',
    description: 'Portable waterproof bluetooth speaker',
    price: 59.99,
    compareAtPrice: 79.99,
    brandName: 'AudioPro',
    categories: ['Electronics', 'Audio'],
    tags: ['speaker', 'bluetooth', 'portable'],
    inStock: true,
    quantity: 90,
    merchantId: 'merchant1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Winter Jacket',
    description: 'Warm and stylish winter jacket',
    price: 149.99,
    compareAtPrice: 179.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Outerwear'],
    tags: ['jacket', 'winter', 'warm'],
    inStock: true,
    quantity: 70,
    merchantId: 'merchant2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Hiking Backpack',
    description: 'Durable and comfortable hiking backpack',
    price: 89.99,
    compareAtPrice: 109.99,
    brandName: 'SportsPro',
    categories: ['Outdoor', 'Hiking'],
    tags: ['backpack', 'hiking', 'outdoor'],
    inStock: true,
    quantity: 60,
    merchantId: 'merchant3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Classic Button-Down Shirt',
    description: 'Timeless button-down shirt for any occasion',
    price: 49.99,
    compareAtPrice: 59.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Formal'],
    tags: ['shirt', 'button-down', 'formal'],
    inStock: true,
    quantity: 180,
    merchantId: 'merchant2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    title: 'Casual Linen Shirt',
    description: 'Breathable linen shirt perfect for summer',
    price: 59.99,
    compareAtPrice: 69.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Casual'],
    tags: ['shirt', 'linen', 'summer'],
    inStock: true,
    quantity: 150,
    merchantId: 'merchant2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    title: 'Performance Athletic Shirt',
    description: 'Moisture-wicking athletic shirt for intense workouts',
    price: 39.99,
    compareAtPrice: 49.99,
    brandName: 'SportsPro',
    categories: ['Clothing', 'Athletic'],
    tags: ['shirt', 'athletic', 'performance'],
    inStock: true,
    quantity: 200,
    merchantId: 'merchant3',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleBrands = [
  {
    id: 'brand1',
    name: 'TechGear',
    description: 'Leading technology brand for electronics and gadgets',
    logo: 'https://example.com/logos/techgear.png',
    website: 'https://techgear.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand2',
    name: 'FashionForward',
    description: 'Trendy and sustainable fashion brand',
    logo: 'https://example.com/logos/fashionforward.png',
    website: 'https://fashionforward.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand3',
    name: 'SportsPro',
    description: 'Professional sports and fitness equipment',
    logo: 'https://example.com/logos/sportspro.png',
    website: 'https://sportspro.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'brand4',
    name: 'AudioPro',
    description: 'Premium audio equipment and accessories',
    logo: 'https://example.com/logos/audiopro.png',
    website: 'https://audiopro.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleMerchants = [
  {
    id: 'merchant1',
    name: 'Electronics Emporium',
    description: 'One-stop shop for all your electronics needs',
    logo: 'https://example.com/logos/electronics-emporium.png',
    website: 'https://electronics-emporium.example.com',
    categories: ['Electronics', 'Gadgets', 'Computers'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'merchant2',
    name: 'Fashion Boutique',
    description: 'Curated fashion for all occasions',
    logo: 'https://example.com/logos/fashion-boutique.png',
    website: 'https://fashion-boutique.example.com',
    categories: ['Clothing', 'Accessories', 'Footwear'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'merchant3',
    name: 'Sports & Outdoors',
    description: 'Everything for sports and outdoor activities',
    logo: 'https://example.com/logos/sports-outdoors.png',
    website: 'https://sports-outdoors.example.com',
    categories: ['Sports', 'Fitness', 'Outdoor'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to check if an index exists
async function indexExists(index: string): Promise<boolean> {
  try {
    const exists = await client.indices.exists({ index });
    return exists;
  } catch (error) {
    logger.error(`Error checking if index ${index} exists:`, error);
    return false;
  }
}

// Helper function to create an index with mappings and settings
async function createIndex(index: string, mappings: any, settings: any): Promise<void> {
  try {
    const exists = await indexExists(index);
    if (exists) {
      logger.log(`Index ${index} already exists, deleting...`);
      await client.indices.delete({ index });
    }

    logger.log(`Creating index ${index} with custom mappings and settings...`);
    await client.indices.create({
      index,
      body: {
        settings,
        mappings,
      },
    });
    logger.log(`Index ${index} created successfully`);
  } catch (error) {
    logger.error(`Error creating index ${index}:`, error);
    throw error;
  }
}

// Helper function to bulk index documents
async function bulkIndexDocuments(index: string, documents: any[]): Promise<void> {
  if (documents.length === 0) {
    logger.warn(`No documents to index in ${index}`);
    return;
  }

  try {
    const operations = documents.flatMap(doc => [
      { index: { _index: index, _id: doc.id } },
      doc
    ]);

    const bulkResponse = await client.bulk({ refresh: true, body: operations });

    if (bulkResponse.errors) {
      const errorItems = bulkResponse.items.filter(item => item.index.error);
      logger.error(`Errors during bulk indexing in ${index}:`, errorItems);
    } else {
      logger.log(`Successfully bulk indexed ${documents.length} documents in ${index}`);
    }
  } catch (error) {
    logger.error(`Error bulk indexing documents in ${index}:`, error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    logger.log('Testing Elasticsearch connection...');
    const info = await client.info();
    logger.log('Elasticsearch connected successfully');

    // Create indices with custom mappings and settings
    await createIndex('products', productsMapping, indexSettings);
    await createIndex('brands', brandsMapping, indexSettings);
    await createIndex('merchants', merchantsMapping, indexSettings);

    // Index sample data
    logger.log('Indexing sample products...');
    await bulkIndexDocuments('products', sampleProducts);

    logger.log('Indexing sample brands...');
    await bulkIndexDocuments('brands', sampleBrands);

    logger.log('Indexing sample merchants...');
    await bulkIndexDocuments('merchants', sampleMerchants);

    // Wait for indexing to complete
    logger.log('Waiting for indexing to complete...');
    await client.indices.refresh({ index: ['products', 'brands', 'merchants'] });

    // Log some stats
    const productCount = await client.count({ index: 'products' });
    const brandCount = await client.count({ index: 'brands' });
    const merchantCount = await client.count({ index: 'merchants' });

    logger.log('Indexing completed successfully!');
    logger.log(`Products indexed: ${productCount.count}`);
    logger.log(`Brands indexed: ${brandCount.count}`);
    logger.log(`Merchants indexed: ${merchantCount.count}`);
    
    logger.log('');
    logger.log('NEXT STEPS:');
    logger.log('1. Restart your NestJS server to use the updated Elasticsearch indices');
    logger.log('2. Use the GraphQL API to test search functionality');
    logger.log('3. If search still doesn\'t work, check the NestJS logs for errors');

  } catch (error) {
    logger.error('Error indexing sample data:', error);
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
