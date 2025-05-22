'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AddPostgresSpecificIndexes1714437666000 = void 0;
class AddPostgresSpecificIndexes1714437666000 {
  async up(queryRunner) {
    const isPostgres = (await queryRunner.connection.driver.options.type) === 'postgres';
    if (!isPostgres) {
      console.log('Skipping PostgreSQL-specific indexes as the database is not PostgreSQL');
      return;
    }
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_fulltext_search" 
      ON "products" USING GIN (to_tsvector('english', "title" || ' ' || "description"))
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_created_at_brin" 
      ON "products" USING BRIN ("createdAt")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_featured_partial" 
      ON "products" ("merchantId", "isActive") 
      WHERE "featured" = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_in_stock_partial" 
      ON "products" ("merchantId", "isActive") 
      WHERE "inStock" = true
    `);
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
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_attributes_gin" 
      ON "products" USING GIN ("attributes" jsonb_path_ops)
    `);
  }
  async down(queryRunner) {
    const isPostgres = (await queryRunner.connection.driver.options.type) === 'postgres';
    if (!isPostgres) {
      return;
    }
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_fulltext_search"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_created_at_brin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_featured_partial"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_in_stock_partial"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_price_range"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_attributes_gin"`);
  }
}
exports.AddPostgresSpecificIndexes1714437666000 = AddPostgresSpecificIndexes1714437666000;
//# sourceMappingURL=1714437666000-AddPostgresSpecificIndexes.js.map
