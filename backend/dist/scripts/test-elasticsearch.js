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
dotenv.config();
const logger = {
    log: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
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
    }
];
const client = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
});
async function indexExists(index) {
    try {
        const response = await client.indices.exists({ index });
        return !!response;
    }
    catch (error) {
        logger.error(`Error checking if index ${index} exists:`, error);
        return false;
    }
}
async function createIndex(index) {
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
            body: document,
            refresh: true,
        });
        logger.log(`Indexed document ${id} in ${index}`);
    }
    catch (error) {
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
                    fields: ['title^3', 'description^2', 'brandName', 'categories'],
                    fuzziness: 'AUTO',
                },
            },
        });
        return response.hits;
    }
    catch (error) {
        logger.error(`Error searching for "${query}" in ${index}:`, error);
        throw error;
    }
}
async function main() {
    try {
        logger.log('Testing Elasticsearch connection...');
        const info = await client.info();
        logger.log('Elasticsearch info:', JSON.stringify(info, null, 2));
        await createIndex('products');
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
            logger.log(`${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`);
        });
        logger.log('Searching for "tech"...');
        const techResults = await searchDocuments('products', 'tech');
        logger.log(`Found ${techResults.total.value} tech products:`);
        techResults.hits.forEach((hit, index) => {
            logger.log(`${index + 1}. ${hit._source.title} - $${hit._source.price} (${hit._source.brandName})`);
        });
        logger.log('Elasticsearch testing completed successfully!');
    }
    catch (error) {
        logger.error('Error testing Elasticsearch:', error);
    }
}
main().catch(error => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-elasticsearch.js.map