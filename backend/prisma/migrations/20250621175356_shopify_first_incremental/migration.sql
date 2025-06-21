-- Incremental Shopify-first migration generated manually to avoid re-creating existing tables
-- Adds Shopify-specific tables and columns that were missing from the original baseline.

-- 1. Enum used by products table -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopify_product_status_enum') THEN
    CREATE TYPE "shopify_product_status_enum" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');
  END IF;
END $$;

-- 2. Columns on merchants --------------------------------------------------------
ALTER TABLE IF EXISTS "public"."merchants"
  ADD COLUMN IF NOT EXISTS "shopifyShopId" BIGINT,
  ADD COLUMN IF NOT EXISTS "myshopifyDomain" VARCHAR;

-- 3. Columns on products ---------------------------------------------------------
ALTER TABLE IF EXISTS "public"."products"
  ADD COLUMN IF NOT EXISTS "shopifyProductId" BIGINT,
  ADD COLUMN IF NOT EXISTS "shopifyStatus" "shopify_product_status_enum";

-- 4. Shopify webhooks table ------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."shopify_webhooks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchantId" UUID NOT NULL,
  "topic"       VARCHAR NOT NULL,
  "receivedAt"  TIMESTAMP(6) NOT NULL DEFAULT now(),
  "payload"     JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_shopify_webhooks_merchant" ON "public"."shopify_webhooks" ("merchantId");
