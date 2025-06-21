-- Ensure shopifyShopId column exists on merchants table regardless of prior state
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'merchants'
  ) THEN
    -- Add camelCase quoted and lowercase variants just in case -----------------
    ALTER TABLE "public"."merchants"
      ADD COLUMN IF NOT EXISTS "shopifyShopId" BIGINT;
    -- In extremely edge-cases the column may have been created as lowercase
    -- but subsequently dropped – ensure it exists too
    ALTER TABLE "public"."merchants"
      ADD COLUMN IF NOT EXISTS shopifyshopid BIGINT;
  END IF;
END $$;
