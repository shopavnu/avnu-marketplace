import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add PostgreSQL-specific indexes and optimizations
 * These indexes use PostgreSQL-specific features for better performance
 */
export class AddPostgresSpecificIndexes1714437666000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if we're using PostgreSQL
    const isPostgres = (await queryRunner.connection.driver.options.type) === 'postgres';

    if (!isPostgres) {
      console.log('Skipping PostgreSQL-specific indexes as the database is not PostgreSQL');
      return;
    }

    // 1. Create GIN index for full-text search on title and description
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_fulltext_search" 
      ON "products" USING GIN (to_tsvector('english', "title" || ' ' || "description"))
    `);

    // 2. Create BRIN index for createdAt (more efficient for date ranges on large tables)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_created_at_brin" 
      ON "products" USING BRIN ("createdAt")
    `);

    // 3. Create partial index for featured products (only indexes featured=true)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_featured_partial" 
      ON "products" ("merchantId", "isActive") 
      WHERE "featured" = true
    `);

    // 4. Create partial index for in-stock products
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_in_stock_partial" 
      ON "products" ("merchantId", "isActive") 
      WHERE "inStock" = true
    `);

    // 5. Create expression index for price ranges (useful for price filtering)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_price_range" 
      ON "products" (
        CASE 
          WHEN "price" < 10 THEN 0
          WHEN "price" >= 10 AND "price" < 50 THEN 1
          WHEN "price" >= 50 AND "price" < 100 THEN 2
          WHEN "price" >= 100 AND "price" < 500 THEN 3
          ELSE 4
        END
      )
    `);

    // 6. Create index for jsonb operations if using jsonb columns
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_attributes_gin" 
      ON "products" USING GIN ("attributes" jsonb_path_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if we're using PostgreSQL
    const isPostgres = (await queryRunner.connection.driver.options.type) === 'postgres';

    if (!isPostgres) {
      return;
    }

    // Drop all PostgreSQL-specific indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_fulltext_search"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_created_at_brin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_featured_partial"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_in_stock_partial"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price_range"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_attributes_gin"`);
  }
}
