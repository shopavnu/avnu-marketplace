#!/usr/bin/env node

/**
 * Script to initialize Elasticsearch indices for the av | nu marketplace
 *
 * This script can be used to:
 * 1. Create all required indices with proper mappings
 * 2. Update index settings and mappings
 * 3. Rebuild indices from database data
 *
 * Usage:
 * npm run init-search-indices -- [options]
 *
 * Options:
 *  --create-only    Only create indices if they don't exist
 *  --update         Update existing indices (mappings and settings)
 *  --rebuild        Rebuild indices from database data
 *  --index=name     Specify a single index to operate on (products, merchants, brands)
 */

require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const { Client } = require('@elastic/elasticsearch');
const { createConnection } = require('typeorm');
const fs = require('fs');
const path = require('path');

// Configuration
const ES_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const ES_USERNAME = process.env.ELASTICSEARCH_USERNAME || 'elastic';
const ES_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  createOnly: args.includes('--create-only'),
  update: args.includes('--update'),
  rebuild: args.includes('--rebuild'),
  index: args.find(arg => arg.startsWith('--index='))?.split('=')[1],
};

// Initialize Elasticsearch client
const client = new Client({
  node: ES_NODE,
  auth: {
    username: ES_USERNAME,
    password: ES_PASSWORD,
  },
  maxRetries: 5,
  requestTimeout: 60000,
});

// Index configurations
const indices = {
  products: {
    settings: {
      number_of_shards: 3,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          product_analyzer: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding', 'synonym'],
          },
        },
        filter: {
          synonym: {
            type: 'synonym',
            synonyms: [
              'dress, gown',
              'pants, trousers, slacks',
              'shirt, blouse, top',
              'shoes, footwear',
              'sustainable, eco-friendly, green',
              'ethical, fair-trade, responsible',
            ],
          },
        },
      },
    },
    mappings: {
      properties: {
        id: { type: 'keyword' },
        title: {
          type: 'text',
          analyzer: 'product_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            completion: { type: 'completion' },
          },
        },
        description: {
          type: 'text',
          analyzer: 'product_analyzer',
        },
        price: { type: 'float' },
        compareAtPrice: { type: 'float' },
        categories: { type: 'keyword' },
        tags: { type: 'keyword' },
        values: { type: 'keyword' },
        brandName: {
          type: 'text',
          fields: {
            keyword: { type: 'keyword' },
          },
        },
        merchantId: { type: 'keyword' },
        images: { type: 'keyword' },
        isActive: { type: 'boolean' },
        inStock: { type: 'boolean' },
        quantity: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        isOnSale: { type: 'boolean' },
        discountPercentage: { type: 'float' },
      },
    },
    entityClass: 'Product',
    entityPath: '../src/modules/products/entities/product.entity',
  },
  merchants: {
    settings: {
      number_of_shards: 2,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          merchant_analyzer: {
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
        name: {
          type: 'text',
          analyzer: 'merchant_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            completion: { type: 'completion' },
          },
        },
        description: { type: 'text' },
        logo: { type: 'keyword' },
        website: { type: 'keyword' },
        values: { type: 'keyword' },
        categories: { type: 'keyword' },
        location: { type: 'geo_point' },
        rating: { type: 'float' },
        reviewCount: { type: 'integer' },
        productCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        isActive: { type: 'boolean' },
        popularity: { type: 'float' },
      },
    },
    entityClass: 'Merchant',
    entityPath: '../src/modules/merchants/entities/merchant.entity',
  },
  brands: {
    settings: {
      number_of_shards: 2,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          brand_analyzer: {
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
        name: {
          type: 'text',
          analyzer: 'brand_analyzer',
          fields: {
            keyword: { type: 'keyword' },
            completion: { type: 'completion' },
          },
        },
        description: { type: 'text' },
        logo: { type: 'keyword' },
        website: { type: 'keyword' },
        values: { type: 'keyword' },
        categories: { type: 'keyword' },
        foundedYear: { type: 'integer' },
        origin: { type: 'keyword' },
        rating: { type: 'float' },
        reviewCount: { type: 'integer' },
        productCount: { type: 'integer' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        isActive: { type: 'boolean' },
        popularity: { type: 'float' },
      },
    },
    entityClass: 'Brand',
    entityPath: '../src/modules/products/entities/brand.entity',
  },
};

// Helper function to transform database entity to Elasticsearch document
function transformEntityToDocument(entity, indexName) {
  // Base transformation
  const doc = { ...entity };

  // Index-specific transformations
  if (indexName === 'products') {
    // Add virtual fields
    doc.isOnSale = entity.compareAtPrice !== null && entity.price < entity.compareAtPrice;

    if (doc.isOnSale && entity.compareAtPrice) {
      doc.discountPercentage = Math.round(
        ((entity.compareAtPrice - entity.price) / entity.compareAtPrice) * 100,
      );
    }

    // Convert location to geo_point if available
    if (entity.latitude && entity.longitude) {
      doc.location = {
        lat: entity.latitude,
        lon: entity.longitude,
      };
    }
  }

  return doc;
}

// Main function
async function main() {
  try {
    console.log('Elasticsearch Index Initialization');
    console.log('=================================');
    console.log(`Elasticsearch Node: ${ES_NODE}`);

    // Check connection
    await client.ping();
    console.log('Connected to Elasticsearch successfully');

    // Determine which indices to process
    const indicesToProcess = options.index ? { [options.index]: indices[options.index] } : indices;

    // Process each index
    for (const [indexName, config] of Object.entries(indicesToProcess)) {
      console.log(`\nProcessing index: ${indexName}`);

      // Check if index exists
      const indexExists = await client.indices.exists({ index: indexName });

      if (indexExists.body) {
        console.log(`Index ${indexName} already exists`);

        if (options.update) {
          console.log(`Updating index ${indexName} settings and mappings`);
          // Update mappings
          await client.indices.putMapping({
            index: indexName,
            body: config.mappings,
          });
          console.log(`Updated mappings for ${indexName}`);

          // Note: Some settings can't be updated on a live index
          console.log('Note: To update analysis settings, you need to rebuild the index');
        }
      } else {
        console.log(`Creating index ${indexName}`);
        await client.indices.create({
          index: indexName,
          body: {
            settings: config.settings,
            mappings: config.mappings,
          },
        });
        console.log(`Created index ${indexName} successfully`);
      }

      // Rebuild index data if requested
      if (options.rebuild) {
        console.log(`Rebuilding data for index ${indexName}`);

        // Connect to database
        const connection = await createConnection();
        console.log('Connected to database');

        // Get entity repository
        const entityClass = require(path.resolve(__dirname, config.entityPath))[config.entityClass];
        const repository = connection.getRepository(entityClass);

        // Get all entities
        const entities = await repository.find();
        console.log(`Found ${entities.length} ${indexName} to index`);

        if (entities.length > 0) {
          // Delete existing documents
          await client.deleteByQuery({
            index: indexName,
            body: {
              query: {
                match_all: {},
              },
            },
          });
          console.log(`Cleared existing documents from ${indexName}`);

          // Prepare bulk indexing
          const operations = entities.flatMap(entity => [
            { index: { _index: indexName, _id: entity.id } },
            transformEntityToDocument(entity, indexName),
          ]);

          // Perform bulk indexing
          const bulkResponse = await client.bulk({ body: operations });

          if (bulkResponse.errors) {
            console.error('Errors during bulk indexing:', bulkResponse.errors);
          } else {
            console.log(`Successfully indexed ${entities.length} ${indexName}`);
          }
        }

        // Close database connection
        await connection.close();
        console.log('Closed database connection');
      }
    }

    console.log('\nElasticsearch index initialization completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
