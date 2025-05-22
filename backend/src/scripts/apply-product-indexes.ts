/**
 * Script to apply database indexes for product query optimization
 *
 * This script can be run directly to add all necessary indexes to the products table
 * without requiring a full migration.
 *
 * Usage:
 * ts-node src/scripts/apply-product-indexes.ts
 */

import { createConnection } from 'typeorm';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

// Load environment variables
config();

const logger = new Logger('ApplyProductIndexes');

async function applyProductIndexes() {
  logger.log('Starting application of product indexes...');

  try {
    // Create a database connection
    const connection = await createConnection({
      type: 'postgres', // Adjust based on your actual database type
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'avnu',
      synchronize: false,
      logging: true,
    });

    logger.log('Database connection established');

    // Execute index creation queries
    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_price" ON "products" ("price")`,
    );
    logger.log('Created price index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_merchant_id" ON "products" ("merchantId")`,
    );
    logger.log('Created merchantId index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_in_stock" ON "products" ("inStock")`,
    );
    logger.log('Created inStock index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_featured" ON "products" ("featured")`,
    );
    logger.log('Created featured index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_created_at" ON "products" ("createdAt")`,
    );
    logger.log('Created createdAt index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_is_suppressed" ON "products" ("isSuppressed")`,
    );
    logger.log('Created isSuppressed index');

    // Add fulltext index for categories
    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_categories_fulltext" ON "products" USING GIN (to_tsvector('english', "categories"))`,
    );
    logger.log('Created categories fulltext index');

    // Add composite indexes for common query patterns
    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_merchant_stock_active" ON "products" ("merchantId", "inStock", "isActive")`,
    );
    logger.log('Created merchant+stock+active composite index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_price_stock_active" ON "products" ("price", "inStock", "isActive")`,
    );
    logger.log('Created price+stock+active composite index');

    await connection.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_created_id" ON "products" ("createdAt", "id")`,
    );
    logger.log('Created createdAt+id composite index');

    // Close the connection
    await connection.close();
    logger.log('Database connection closed');

    logger.log('Successfully applied all product indexes!');
  } catch (error) {
    logger.error(`Error applying product indexes: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// Run the function
applyProductIndexes();
