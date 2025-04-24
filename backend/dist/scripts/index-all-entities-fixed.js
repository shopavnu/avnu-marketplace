"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv = __importStar(require("dotenv"));
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../src/modules/products/entities/product.entity");
const brand_entity_1 = require("../src/modules/products/entities/brand.entity");
const merchant_entity_1 = require("../src/modules/merchants/entities/merchant.entity");
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
const indexSettings = {
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
async function indexExists(index) {
    try {
        const exists = await client.indices.exists({ index });
        return exists;
    }
    catch (error) {
        logger.error(`Error checking if index ${index} exists:`, error);
        return false;
    }
}
async function createIndex(index, mappings, settings) {
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
    }
    catch (error) {
        logger.error(`Error creating index ${index}:`, error);
        throw error;
    }
}
async function bulkIndexDocuments(index, documents) {
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
        }
        else {
            logger.log(`Successfully bulk indexed ${documents.length} documents in ${index}`);
        }
    }
    catch (error) {
        logger.error(`Error bulk indexing documents in ${index}:`, error);
        throw error;
    }
}
function prepareProductForIndexing(product) {
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
function prepareBrandForIndexing(brand) {
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
function prepareMerchantForIndexing(merchant) {
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
async function main() {
    let connection;
    try {
        logger.log('Connecting to database...');
        connection = await (0, typeorm_1.createConnection)();
        logger.log('Connected to database');
        logger.log('Testing Elasticsearch connection...');
        const info = await client.info();
        logger.log('Elasticsearch connected successfully');
        await createIndex('products', productsMapping, indexSettings);
        await createIndex('brands', brandsMapping, indexSettings);
        await createIndex('merchants', merchantsMapping, indexSettings);
        logger.log('Fetching all products...');
        const productRepository = (0, typeorm_1.getRepository)(product_entity_1.Product);
        const products = await productRepository.find();
        logger.log(`Fetched ${products.length} products`);
        const productsToIndex = products.map(product => prepareProductForIndexing(product));
        logger.log('Indexing products...');
        await bulkIndexDocuments('products', productsToIndex);
        logger.log('Fetching all brands...');
        const brandRepository = (0, typeorm_1.getRepository)(brand_entity_1.Brand);
        const brands = await brandRepository.find();
        logger.log(`Fetched ${brands.length} brands`);
        const brandsToIndex = brands.map(brand => prepareBrandForIndexing(brand));
        logger.log('Indexing brands...');
        await bulkIndexDocuments('brands', brandsToIndex);
        logger.log('Fetching all merchants...');
        const merchantRepository = (0, typeorm_1.getRepository)(merchant_entity_1.Merchant);
        const merchants = await merchantRepository.find();
        logger.log(`Fetched ${merchants.length} merchants`);
        const merchantsToIndex = merchants.map(merchant => prepareMerchantForIndexing(merchant));
        logger.log('Indexing merchants...');
        await bulkIndexDocuments('merchants', merchantsToIndex);
        logger.log('Waiting for indexing to complete...');
        await client.indices.refresh({ index: ['products', 'brands', 'merchants'] });
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
    }
    catch (error) {
        logger.error('Error indexing entities:', error);
    }
    finally {
        if (connection) {
            await connection.close();
            logger.log('Database connection closed');
        }
    }
}
main().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=index-all-entities-fixed.js.map