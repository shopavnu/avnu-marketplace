import { test, expect, Page } from '@playwright/test';

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
    // Ensure front-end dev server running before executing tests
    await page.goto('/');
  });

  test('guest can complete checkout', async ({ page }) => {
    // extend timeout to allow dev servers warm-up
    test.setTimeout(60_000);
    // 1. Wait for product list then add first product to cart
    await page.waitForSelector('[data-testid="product-card"]');
    await page.getByTestId('product-card').first().getByRole('button', { name: /add to cart/i }).click();

    // 2. Open cart dropdown & go to checkout
    await page.locator('[data-testid="cart-toggle"]').click();
    await page.locator('[data-testid="checkout-button"]').click();

    // 3. Wait for stripe-checkout page to initialise
    await expect(page).toHaveURL(/stripe-checkout/);

    // 4. Intercept Stripe confirm to bypass real network
    await mockStripeConfirmPayment(page);

    // 5. Submit payment form
    await page.locator('[data-testid="pay-button"]').click();

    // 6. Expect redirect to confirmation with success
    await page.waitForURL(/checkout\/confirmation.*redirect_status=succeeded/);
  });
});

async function mockStripeConfirmPayment(page: Page) {
  // Replace Stripe.confirmPayment call with resolved promise
  await page.addInitScript(() => {
    // @ts-ignore – injected into browser context
    window.Stripe = (pk: string) => ({
      elements: () => ({ create: () => ({ mount: () => {} }) }),
      confirmPayment: async () => ({ paymentIntent: { id: 'pi_test', status: 'succeeded' } }),
    });
  });
}
