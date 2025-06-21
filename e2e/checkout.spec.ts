import { test, expect } from '@playwright/test';

/*
  Happy-path guest checkout
  ‑ Adds first product to cart
  ‑ Proceeds to Stripe checkout page
  ‑ Submits payment (Stripe test mode – element interaction is skipped by mocking `confirmPayment`)
  ‑ Verifies redirect to confirmation page with succeeded status

  NOTE: DOM selectors are app-specific – adjust as needed.
*/

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock products API and related endpoints before visiting the site
    const mockProducts = [
      {
        id: 'product-1',
        title: 'Test Product',
        price: 19.99,
        image: 'https://via.placeholder.com/300',
        brand: 'MockBrand',
        slug: 'product-1',
        inStock: true,
      },
    ];

    await page.route('**/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    await page.route('**/products/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts[0]),
      });
    });

    await page.route('**/api/checkout/initiate', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ orderId: 'order-1', clientSecret: 'cs_test_123' }),
      });
    });

    // Return empty success for any GraphQL query/mutation
    await page.route('**/graphql', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      });
    });

    // Navigate directly to product detail page after stubbing
    await page.goto('/product/product-1');
  });

  test('guest can complete checkout', async ({ page }) => {
    // extend timeout to allow dev servers warm-up
    test.setTimeout(60_000);
    // Product detail page is already loaded via beforeEach
    await page.getByRole('button', { name: /add to cart/i }).click();

    // 2. Open cart dropdown & go to checkout
    await page.getByRole('button', { name: /shopping cart/i }).click();
    await page.locator('a[href="/stripe-checkout"]').click();

    // 3. Wait for stripe-checkout page to initialise
    await expect(page).toHaveURL(/stripe-checkout/);




    // 5. Submit payment form
    await page.locator('[data-testid="pay-button"]').click();

    // 6. Expect redirect to confirmation with success
    await page.waitForURL(/checkout\/confirmation.*redirect_status=succeeded/);
  });
});

