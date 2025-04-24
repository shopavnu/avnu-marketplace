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
const dbConfig = {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'avnu_marketplace',
    entities: [
        product_entity_1.Product,
        brand_entity_1.Brand,
        merchant_entity_1.Merchant
    ],
    synchronize: false
};
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
        const result = await client.indices.exists({ index });
        return result;
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
async function indexDocument(index, id, document) {
    try {
        await client.index({
            index,
            id,
            document,
            refresh: true,
        });
        logger.log(`Indexed document ${id} in ${index}`);
    }
    catch (error) {
        logger.error(`Error indexing document ${id} in ${index}:`, error);
        throw error;
    }
}
async function bulkIndexDocuments(index, documents) {
    if (documents.length === 0) {
        logger.warn(`No documents to index for ${index}`);
        return;
    }
    const operations = [];
    for (const doc of documents) {
        operations.push({ index: { _index: index, _id: doc.id } }, doc);
    }
    try {
        const result = await client.bulk({ refresh: true, body: operations });
        const bulkResponse = result;
        if (bulkResponse.errors) {
            logger.error(`Errors during bulk indexing for ${index}:`, bulkResponse.errors);
        }
        else {
            logger.log(`Successfully indexed ${documents.length} documents in ${index}`);
        }
    }
    catch (error) {
        logger.error(`Error bulk indexing documents in ${index}:`, error);
        throw error;
    }
}
function prepareProductForIndexing(product, categories) {
    const productCategories = categories
        .filter(cat => product.categories?.includes(cat.id))
        .map(cat => cat.name);
    return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        categories: productCategories,
        tags: product.tags,
        merchantId: product.merchantId,
        brandName: product.brandName,
        isActive: product.isActive,
        inStock: product.inStock,
        quantity: product.quantity,
        values: product.values,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}
function prepareBrandForIndexing(brand) {
    return {
        id: brand.id,
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
        website: brand.website,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
    };
}
function prepareMerchantForIndexing(merchant, categories) {
    const merchantCategories = categories
        .filter(cat => merchant.categories?.includes(cat.id))
        .map(cat => cat.name);
    return {
        id: merchant.id,
        name: merchant.name,
        description: merchant.description,
        logo: merchant.logo,
        website: merchant.website,
        categories: merchantCategories,
        createdAt: merchant.createdAt,
        updatedAt: merchant.updatedAt,
    };
}
async function main() {
    let connection;
    try {
        logger.log('Connecting to database...');
        connection = await (0, typeorm_1.createConnection)(dbConfig);
        logger.log('Connected to database');
        logger.log('Testing Elasticsearch connection...');
        const info = await client.info();
        logger.log('Elasticsearch info:', JSON.stringify(info, null, 2));
        await createIndex('products', productsMapping, indexSettings);
        await createIndex('brands', brandsMapping, indexSettings);
        await createIndex('merchants', merchantsMapping, indexSettings);
        logger.log('Fetching all categories...');
        const categories = [
            { id: 'cat1', name: 'Electronics' },
            { id: 'cat2', name: 'Clothing' },
            { id: 'cat3', name: 'Home & Garden' },
            { id: 'cat4', name: 'Sports & Outdoors' },
            { id: 'cat5', name: 'Beauty & Personal Care' },
        ];
        logger.log(`Fetched ${categories.length} categories`);
        logger.log('Fetching all products...');
        const productRepository = (0, typeorm_1.getRepository)(product_entity_1.Product);
        const products = await productRepository.find();
        logger.log(`Fetched ${products.length} products`);
        const productsToIndex = products.map(product => prepareProductForIndexing(product, categories));
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
        const merchantsToIndex = merchants.map(merchant => prepareMerchantForIndexing(merchant, categories));
        logger.log('Indexing merchants...');
        await bulkIndexDocuments('merchants', merchantsToIndex);
        logger.log('Waiting for indexing to complete...');
        await client.indices.refresh({ index: ['products', 'brands', 'merchants'] });
        const productCount = await client.count({ index: 'products' });
        const brandCount = await client.count({ index: 'brands' });
        const merchantCount = await client.count({ index: 'merchants' });
        const productCountResult = productCount;
        const brandCountResult = brandCount;
        const merchantCountResult = merchantCount;
        logger.log('Indexing completed successfully!');
        logger.log(`Products indexed: ${productCountResult.count || 0}`);
        logger.log(`Brands indexed: ${brandCountResult.count || 0}`);
        logger.log(`Merchants indexed: ${merchantCountResult.count || 0}`);
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
//# sourceMappingURL=index-all-entities.js.map