import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIndexes1714437665000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add single column indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_price" ON "products" ("price")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_merchant_id" ON "products" ("merchantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_in_stock" ON "products" ("inStock")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_featured" ON "products" ("featured")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_created_at" ON "products" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_is_suppressed" ON "products" ("isSuppressed")`,
    );

    // Add fulltext index for categories
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_categories_fulltext" ON "products" USING GIN (to_tsvector('english', "categories"))`,
    );

    // Add composite indexes for common query patterns
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_merchant_stock_active" ON "products" ("merchantId", "inStock", "isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_price_stock_active" ON "products" ("price", "inStock", "isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_created_id" ON "products" ("createdAt", "id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_created_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price_stock_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_merchant_stock_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_categories_fulltext"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_is_suppressed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_featured"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_in_stock"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_merchant_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price"`);
  }
}
