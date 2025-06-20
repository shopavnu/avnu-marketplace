-- Incremental Shopify-first migration generated manually to avoid re-creating existing tables
-- Adds Shopify-specific tables and columns that were missing from the original baseline.

-- Ensure pgcrypto extension for gen_random_uuid() ------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Enum used by products table -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopify_product_status_enum') THEN
    CREATE TYPE "shopify_product_status_enum" AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');
  END IF;
END $$;

-- 2. Ensure merchants table exists and add Shopify columns -----------------------
CREATE TABLE IF NOT EXISTS "public"."merchants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR,
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()
);

ALTER TABLE "public"."merchants"
  ADD COLUMN IF NOT EXISTS "shopifyShopId" BIGINT,
  ADD COLUMN IF NOT EXISTS "myshopifyDomain" VARCHAR;

-- 3. Ensure Product table exists and add columns ---------------------------------
CREATE TABLE IF NOT EXISTS "public"."Product" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP(6) NOT NULL DEFAULT now()
);

ALTER TABLE "public"."Product"
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
