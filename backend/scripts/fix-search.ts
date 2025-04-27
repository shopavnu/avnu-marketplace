import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

// Define the settings for products index
const productsSettings = {
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
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    title: 'Casual Linen Shirt',
    description: 'Breathable linen shirt perfect for summer',
    price: 59.99,
    brandName: 'FashionForward',
    categories: ['Clothing', 'Casual'],
    inStock: true,
    merchantId: 'merchant2',
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    title: 'Performance Athletic Shirt',
    description: 'Moisture-wicking athletic shirt for intense workouts',
    price: 39.99,
    brandName: 'SportsPro',
    categories: ['Clothing', 'Athletic'],
    inStock: true,
    merchantId: 'merchant3',
  },
];

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

// Helper function to create an index with mappings and settings
async function createIndex(index: string, mappings: any, settings: any): Promise<void> {
  try {
    const exists = await indexExists(index);
    if (exists) {
      logger.log(`Deleting existing index ${index}...`);
      await client.indices.delete({ index });
    }

    logger.log(`Creating index ${index} with custom mappings and settings...`);
    await client.indices.create({
      index,
      body: {
        settings,
        mappings: {
          properties: mappings.properties,
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
      document,
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
          fields: ['title^3', 'title.ngram^2', 'description^2', 'brandName', 'categories'],
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

// Create a GraphQL search query test file
async function createGraphQLTestFile(): Promise<void> {
  const testQuery = `
# Test basic search for "shirt"
query SearchForShirt {
  searchProducts(input: { query: "shirt", limit: 10, page: 1 }) {
    query
    products {
      id
      title
      description
      price
      brandName
    }
    pagination {
      total
      hasNext
      hasPrevious
    }
  }
}

# Test search with filters
query SearchWithFilters {
  searchProducts(
    input: { 
      query: "shirt", 
      limit: 10, 
      page: 1,
      filters: {
        priceMin: 30,
        priceMax: 60,
        categories: ["Clothing"]
      }
    }
  ) {
    query
    products {
      id
      title
      description
      price
      brandName
      categories
    }
    pagination {
      total
      hasNext
      hasPrevious
    }
    facets {
      categories {
        name
        count
      }
      price {
        min
        max
      }
    }
  }
}

# Test brand search
query SearchByBrand {
  searchProducts(
    input: { 
      query: "", 
      limit: 10, 
      page: 1,
      filters: {
        brandName: "FashionForward"
      }
    }
  ) {
    products {
      id
      title
      brandName
    }
    pagination {
      total
    }
  }
}
`;

  const filePath = path.join(process.cwd(), 'search-test-queries.graphql');
  fs.writeFileSync(filePath, testQuery);
  logger.log(`Created GraphQL test file at ${filePath}`);
}

// Main function
async function main() {
  try {
    logger.log('Testing Elasticsearch connection...');
    const info = await client.info();
    logger.log('Elasticsearch info:', JSON.stringify(info, null, 2));

    // Create products index with custom mappings and settings
    await createIndex('products', productsMapping, productsSettings);

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
      logger.log(
        `${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`,
      );
    });

    // Create GraphQL test file
    await createGraphQLTestFile();

    logger.log('Elasticsearch setup completed successfully!');
    logger.log('');
    logger.log('NEXT STEPS:');
    logger.log('1. Restart your NestJS server to use the updated Elasticsearch indices');
    logger.log('2. Use the generated search-test-queries.graphql file to test the GraphQL API');
    logger.log("3. If search still doesn't work, check the NestJS logs for errors");
  } catch (error) {
    logger.error('Error setting up Elasticsearch:', error);
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
