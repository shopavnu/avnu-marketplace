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

// Sample product data
const products = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'TechGear Pro Laptop',
    description: 'Powerful laptop for professionals and gamers',
    price: 1299.99,
    brandName: 'TechGear',
    categories: ['Electronics', 'Computers'],
    inStock: true,
    merchantId: 'merchant1',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt',
    price: 29.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Sustainable'],
    inStock: true,
    merchantId: 'merchant2',
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Classic Button-Down Shirt',
    description: 'Timeless button-down shirt for any occasion',
    price: 49.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Formal'],
    inStock: true,
    merchantId: 'merchant2',
  }
];

// Create Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  },
});

// Helper function to check if an index exists
async function indexExists(index: string): Promise<boolean> {
  try {
    const response = await client.indices.exists({ index });
    return !!response;
  } catch (error) {
    logger.error(`Error checking if index ${index} exists:`, error);
    return false;
  }
}

// Helper function to create an index
async function createIndex(index: string): Promise<void> {
  try {
    const exists = await indexExists(index);
    if (exists) {
      logger.log(`Index ${index} already exists`);
      return;
    }

    await client.indices.create({
      index,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              custom_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'custom_analyzer',
            },
            price: { type: 'float' },
            brandName: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            categories: {
              type: 'text',
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            inStock: { type: 'boolean' },
            merchantId: { type: 'keyword' },
          },
        },
      },
    });
    logger.log(`Created index ${index}`);
  } catch (error) {
    logger.error(`Error creating index ${index}:`, error);
    throw error;
  }
}

// Helper function to index a document
async function indexDocument(index: string, id: string, document: any): Promise<void> {
  try {
    await client.index({
      index,
      id,
      body: document,
      refresh: true,
    });
    logger.log(`Indexed document ${id} in ${index}`);
  } catch (error) {
    logger.error(`Error indexing document ${id} in ${index}:`, error);
    throw error;
  }
}

// Helper function to search for documents
async function searchDocuments(index: string, query: string): Promise<any> {
  try {
    const response = await client.search({
      index,
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'description^2', 'brandName', 'categories'],
          fuzziness: 'AUTO',
        },
      },
    });
    return response.hits;
  } catch (error) {
    logger.error(`Error searching for "${query}" in ${index}:`, error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    logger.log('Testing Elasticsearch connection...');
    const info = await client.info();
    logger.log('Elasticsearch info:', JSON.stringify(info, null, 2));

    // Create products index
    await createIndex('products');

    // Index sample products
    logger.log('Indexing sample products...');
    for (const product of products) {
      await indexDocument('products', product.id, product);
    }

    // Wait for indexing to complete
    logger.log('Waiting for indexing to complete...');
    await client.indices.refresh({ index: 'products' });

    // Search for shirts
    logger.log('Searching for "shirt"...');
    const shirtResults = await searchDocuments('products', 'shirt');
    logger.log(`Found ${shirtResults.total.value} shirts:`);
    shirtResults.hits.forEach((hit: any, index: number) => {
      logger.log(`${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`);
    });

    // Search for tech products
    logger.log('Searching for "tech"...');
    const techResults = await searchDocuments('products', 'tech');
    logger.log(`Found ${techResults.total.value} tech products:`);
    techResults.hits.forEach((hit: any, index: number) => {
      logger.log(`${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`);
    });

    logger.log('Elasticsearch testing completed successfully!');
  } catch (error) {
    logger.error('Error testing Elasticsearch:', error);
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
