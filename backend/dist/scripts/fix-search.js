'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const elasticsearch_1 = require('@elastic/elasticsearch');
const dotenv = __importStar(require('dotenv'));
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
dotenv.config();
const logger = {
  log: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
};
const client = new elasticsearch_1.Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  },
});
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
const productsSettings = {
  index: {
    max_ngram_diff: 3,
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
async function indexExists(index) {
  try {
    const response = await client.indices.exists({ index });
    return !!response;
  } catch (error) {
    logger.error(`Error checking if index ${index} exists:`, error);
    return false;
  }
}
async function createIndex(index, mappings, settings) {
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
async function indexDocument(index, id, document) {
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
async function searchDocuments(index, query) {
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
async function createGraphQLTestFile() {
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
async function main() {
  try {
    logger.log('Testing Elasticsearch connection...');
    const info = await client.info();
    logger.log('Elasticsearch info:', JSON.stringify(info, null, 2));
    await createIndex('products', productsMapping, productsSettings);
    logger.log('Indexing sample products...');
    for (const product of products) {
      await indexDocument('products', product.id, product);
    }
    logger.log('Waiting for indexing to complete...');
    await client.indices.refresh({ index: 'products' });
    logger.log('Searching for "shirt"...');
    const shirtResults = await searchDocuments('products', 'shirt');
    logger.log(`Found ${shirtResults.total.value} shirts:`);
    shirtResults.hits.forEach((hit, index) => {
      logger.log(
        `${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`,
      );
    });
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
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
//# sourceMappingURL=fix-search.js.map
