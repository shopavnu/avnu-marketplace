-- Add missing Shopify columns to existing Product table in CI databases where previous migration was skipped

-- Ensure enum exists (harmless if already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopify_product_status_enum') THEN
    CREATE TYPE "shopify_product_status_enum" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');
  END IF;
END $$;

-- Add columns to Product
ALTER TABLE "public"."Product"
  ADD COLUMN IF NOT EXISTS "shopifyProductId" BIGINT,
  ADD COLUMN IF NOT EXISTS "shopifyStatus" "shopify_product_status_enum";
