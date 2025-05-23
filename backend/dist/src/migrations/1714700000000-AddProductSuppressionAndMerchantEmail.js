"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductSuppressionAndMerchantEmail1714700000000 = void 0;
class AddProductSuppressionAndMerchantEmail1714700000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS "isSuppressed" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "suppressedFrom" text,
      ADD COLUMN IF NOT EXISTS "lastValidationDate" TIMESTAMP WITH TIME ZONE;
    `);
        await queryRunner.query(`
      ALTER TABLE merchants
      ADD COLUMN IF NOT EXISTS "email" varchar(255);
    `);
        await queryRunner.query(`
      UPDATE merchants
      SET email = COALESCE(
        (SELECT email FROM users WHERE users.id = merchants."userId"),
        CONCAT(LOWER(REPLACE(merchants.name, ' ', '.')), '@example.com')
      )
      WHERE email IS NULL;
    `);
        await queryRunner.query(`
      ALTER TABLE merchants
      ALTER COLUMN "email" SET NOT NULL;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN IF EXISTS "isSuppressed",
      DROP COLUMN IF EXISTS "suppressedFrom",
      DROP COLUMN IF EXISTS "lastValidationDate";
    `);
        await queryRunner.query(`
      ALTER TABLE merchants
      DROP COLUMN IF EXISTS "email";
    `);
    }
}
exports.AddProductSuppressionAndMerchantEmail1714700000000 = AddProductSuppressionAndMerchantEmail1714700000000;
//# sourceMappingURL=1714700000000-AddProductSuppressionAndMerchantEmail.js.map