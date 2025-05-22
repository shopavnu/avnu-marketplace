'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AddProductIndexes1714437665000 = void 0;
class AddProductIndexes1714437665000 {
  async up(queryRunner) {
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
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_categories_fulltext" ON "products" USING GIN (to_tsvector('english', "categories"))`,
    );
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
  async down(queryRunner) {
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
exports.AddProductIndexes1714437665000 = AddProductIndexes1714437665000;
//# sourceMappingURL=1714437665000-AddProductIndexes.js.map
