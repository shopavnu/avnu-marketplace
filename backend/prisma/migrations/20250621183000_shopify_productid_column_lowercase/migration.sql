-- Patch Shopify columns for unquoted lowercase table names
-- Some CI databases may have been initialized without quoted identifiers, resulting
-- in lowercase table names (product, merchants). This migration ensures Shopify
-- columns are present regardless of case.

-- 1. Ensure enum exists ---------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopify_product_status_enum') THEN
    CREATE TYPE shopify_product_status_enum AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT');
  END IF;
END $$;

-- 2. Add Shopify columns to lowercase product table -----------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'product'
  ) THEN
    EXECUTE '
      ALTER TABLE product
        ADD COLUMN IF NOT EXISTS shopifyProductId BIGINT,
        ADD COLUMN IF NOT EXISTS shopifyStatus shopify_product_status_enum;
    ';
  END IF;
END $$;

-- 3. Add Shopify columns to lowercase merchants table ---------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'merchants'
  ) THEN
    EXECUTE '
      ALTER TABLE merchants
        ADD COLUMN IF NOT EXISTS shopifyShopId BIGINT,
        ADD COLUMN IF NOT EXISTS myshopifyDomain VARCHAR;
    ';
  END IF;
END $$;
