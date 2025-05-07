import { MigrationInterface, QueryRunner } from "typeorm";

export class ShopifyFirstMigration1714222133000 implements MigrationInterface {
    name = 'ShopifyFirstMigration1714222133000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Back up WooCommerce connections to a backup table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "merchant_platform_connection_woo_backup" AS
            SELECT * FROM "merchant_platform_connection"
            WHERE "platformType" = 'woocommerce'
        `);

        // 2. Remove WooCommerce connections
        await queryRunner.query(`
            DELETE FROM "merchant_platform_connection"
            WHERE "platformType" = 'woocommerce'
        `);

        // 3. Update any product metadata that might reference WooCommerce
        await queryRunner.query(`
            UPDATE "product"
            SET "metadata" = jsonb_set("metadata", '{integrationType}', '"shopify"')
            WHERE "metadata" ? 'integrationType' 
            AND "metadata"->>'integrationType' = 'woocommerce'
        `);

        // 4. Update any products with WooCommerce platformType to have null platformType
        await queryRunner.query(`
            UPDATE "product"
            SET "platformType" = NULL
            WHERE "platformType" = 'woocommerce'
        `);

        // 5. Create migration record in the database
        await queryRunner.query(`
            INSERT INTO "migration_record" ("name", "description", "executedAt")
            VALUES (
                'ShopifyFirstMigration', 
                'Migrated from multi-platform to Shopify-first approach', 
                NOW()
            )
            ON CONFLICT ("name") DO UPDATE 
            SET "executedAt" = NOW(),
                "description" = 'Migrated from multi-platform to Shopify-first approach'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore WooCommerce connections from backup
        await queryRunner.query(`
            INSERT INTO "merchant_platform_connection"
            SELECT * FROM "merchant_platform_connection_woo_backup"
        `);

        // Restore product metadata
        await queryRunner.query(`
            UPDATE "product"
            SET "platformType" = 'woocommerce'
            WHERE "metadata" ? 'integrationType' 
            AND "metadata"->>'integrationType' = 'shopify'
            AND "externalId" LIKE 'woo_%'
        `);

        // Remove migration record
        await queryRunner.query(`
            DELETE FROM "migration_record"
            WHERE "name" = 'ShopifyFirstMigration'
        `);
    }
}
