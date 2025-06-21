import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Shopify-first migration sanity', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates shopify_webhooks table', async () => {
    const [{ exists }] = (await prisma.$queryRawUnsafe(
      "SELECT to_regclass('public.shopify_webhooks') IS NOT NULL AS exists;",
    )) as Array<{ exists: boolean }>;

    expect(exists).toBe(true);
  });

  it('adds shopifyShopId to merchants', async () => {
    const cols = (await prisma.$queryRawUnsafe(
      "SELECT 1 FROM information_schema.columns WHERE column_name ILIKE 'shopify%shopid' LIMIT 1;",
    )) as Array<unknown>;

    expect(cols.length).toBeGreaterThan(0);
  });

  it('adds shopifyProductId to products', async () => {
    const cols = (await prisma.$queryRawUnsafe(
      "SELECT 1 FROM information_schema.columns WHERE column_name ILIKE 'shopify%productid' LIMIT 1;",
    )) as Array<unknown>;

    expect(cols.length).toBeGreaterThan(0);
  });
});
