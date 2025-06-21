import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Shopify-first migration sanity', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates shopify_webhooks table', async () => {
    const [{ exists }] = (await prisma.$queryRawUnsafe(
      `SELECT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'shopify_webhooks'
          AND n.nspname = current_schema()
      );`,
    )) as Array<{ exists: boolean }>;

    expect(exists).toBe(true);
  });

  it('adds shopifyShopId to merchants', async () => {
    const cols = (await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'shopifyShopId';",
    )) as Array<{ column_name: string }>;

    expect(cols).toHaveLength(1);
  });

  it('adds shopifyProductId to products', async () => {
    const cols = (await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'shopifyProductId';",
    )) as Array<{ column_name: string }>;

    expect(cols).toHaveLength(1);
  });
});
