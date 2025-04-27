import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPreferenceProfile1714414890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_preference_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(),
        "totalPageViews" integer NOT NULL DEFAULT 0,
        "totalProductViews" integer NOT NULL DEFAULT 0,
        "averageScrollDepth" float NOT NULL DEFAULT 0,
        "averageProductViewTimeSeconds" float NOT NULL DEFAULT 0,
        "averageSessionDurationMinutes" float NOT NULL DEFAULT 0,
        "productEngagementCount" integer NOT NULL DEFAULT 0,
        "topViewedCategories" text,
        "topViewedBrands" text,
        "recentlyViewedProducts" text,
        "categoryPreferences" jsonb,
        "brandPreferences" jsonb,
        "productPreferences" jsonb,
        "viewTimeByCategory" jsonb,
        "viewTimeByBrand" jsonb,
        "scrollDepthByPageType" jsonb,
        "priceRangePreferences" jsonb,
        "hasEnoughData" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_preference_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_preference_profiles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    
    // Create index for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_user_preference_profiles_userId" ON "user_preference_profiles" ("userId")
    `);
    
    // Add new interaction types to session_interactions type enum
    await queryRunner.query(`
      ALTER TYPE "public"."session_interactions_type_enum" ADD VALUE IF NOT EXISTS 'scroll_depth'
    `);
    
    await queryRunner.query(`
      ALTER TYPE "public"."session_interactions_type_enum" ADD VALUE IF NOT EXISTS 'product_view'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the user_preference_profiles table
    await queryRunner.query(`
      DROP TABLE "user_preference_profiles"
    `);
    
    // Note: We cannot easily remove values from an enum type in PostgreSQL
    // The enum values will remain but won't cause issues
  }
}
