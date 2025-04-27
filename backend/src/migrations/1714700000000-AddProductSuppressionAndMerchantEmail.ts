import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSuppressionAndMerchantEmail1714700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add suppression fields to products table
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS "isSuppressed" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "suppressedFrom" text,
      ADD COLUMN IF NOT EXISTS "lastValidationDate" TIMESTAMP WITH TIME ZONE;
    `);

    // Add email field to merchants table
    await queryRunner.query(`
      ALTER TABLE merchants
      ADD COLUMN IF NOT EXISTS "email" varchar(255);
    `);

    // Set default email for existing merchants based on their user's email or a placeholder
    await queryRunner.query(`
      UPDATE merchants
      SET email = COALESCE(
        (SELECT email FROM users WHERE users.id = merchants."userId"),
        CONCAT(LOWER(REPLACE(merchants.name, ' ', '.')), '@example.com')
      )
      WHERE email IS NULL;
    `);

    // Make email required for future records
    await queryRunner.query(`
      ALTER TABLE merchants
      ALTER COLUMN "email" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove suppression fields from products table
    await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN IF EXISTS "isSuppressed",
      DROP COLUMN IF EXISTS "suppressedFrom",
      DROP COLUMN IF EXISTS "lastValidationDate";
    `);

    // Remove email field from merchants table
    await queryRunner.query(`
      ALTER TABLE merchants
      DROP COLUMN IF EXISTS "email";
    `);
  }
}
