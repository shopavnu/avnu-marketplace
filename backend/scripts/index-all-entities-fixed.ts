/**
 * Script to index all entities (products, brands, merchants) in Elasticsearch
 *
 * This script connects to the database, fetches all entities,
 * and indexes them in Elasticsearch with proper mappings and settings.
 */
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { createConnection, getRepository } from 'typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import { Brand } from '../src/modules/products/entities/brand.entity';
import { Merchant } from '../src/modules/merchants/entities/merchant.entity';

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
    max_ngram_diff: 3, // Allow a larger difference between min_gram and max_gram
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
    const operations = documents.flatMap(doc => [{ index: { _index: index, _id: doc.id } }, doc]);

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

// Helper function to prepare product data for indexing
function prepareProductForIndexing(product: Product): any {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    categories: product.categories || [],
    tags: product.tags || [],
    merchantId: product.merchantId,
    brandName: product.brandName,
    isActive: product.isActive,
    inStock: product.inStock,
    quantity: product.quantity || 0,
    values: product.values || [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// Helper function to prepare brand data for indexing
function prepareBrandForIndexing(brand: Brand): any {
  return {
    id: brand.id,
    name: brand.name,
    description: brand.description || '',
    logo: brand.logo || '',
    website: brand.website || '',
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

// Helper function to prepare merchant data for indexing
function prepareMerchantForIndexing(merchant: Merchant): any {
  return {
    id: merchant.id,
    name: merchant.name,
    description: merchant.description || '',
    logo: merchant.logo || '',
    website: merchant.website || '',
    categories: merchant.categories || [],
    createdAt: merchant.createdAt,
    updatedAt: merchant.updatedAt,
  };
}

// Main function
async function main() {
  let connection;
  try {
    logger.log('Connecting to database...');
    connection = await createConnection();
    logger.log('Connected to database');

    logger.log('Testing Elasticsearch connection...');
    const info = await client.info();
    logger.log('Elasticsearch connected successfully');

    // Create indices with custom mappings and settings
    await createIndex('products', productsMapping, indexSettings);
    await createIndex('brands', brandsMapping, indexSettings);
    await createIndex('merchants', merchantsMapping, indexSettings);

    // Fetch and index all products
    logger.log('Fetching all products...');
    const productRepository = getRepository(Product);
    const products = await productRepository.find();
    logger.log(`Fetched ${products.length} products`);

    const productsToIndex = products.map(product => prepareProductForIndexing(product));

    logger.log('Indexing products...');
    await bulkIndexDocuments('products', productsToIndex);

    // Fetch and index all brands
    logger.log('Fetching all brands...');
    const brandRepository = getRepository(Brand);
    const brands = await brandRepository.find();
    logger.log(`Fetched ${brands.length} brands`);

    const brandsToIndex = brands.map(brand => prepareBrandForIndexing(brand));

    logger.log('Indexing brands...');
    await bulkIndexDocuments('brands', brandsToIndex);

    // Fetch and index all merchants
    logger.log('Fetching all merchants...');
    const merchantRepository = getRepository(Merchant);
    const merchants = await merchantRepository.find();
    logger.log(`Fetched ${merchants.length} merchants`);

    const merchantsToIndex = merchants.map(merchant => prepareMerchantForIndexing(merchant));

    logger.log('Indexing merchants...');
    await bulkIndexDocuments('merchants', merchantsToIndex);

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
    logger.log("3. If search still doesn't work, check the NestJS logs for errors");
  } catch (error) {
    logger.error('Error indexing entities:', error);
  } finally {
    if (connection) {
      await connection.close();
      logger.log('Database connection closed');
    }
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
