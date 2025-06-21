import { test, expect } from '@playwright/test';

/*
  Edge-case checkout test: item goes out of stock – Pay button should be disabled.
  We mock the products API to mark the item as out of stock, proceed to checkout
  and verify the Pay button cannot be clicked.
*/

test.describe('Checkout flow – out-of-stock item', () => {
  test.beforeEach(async ({ page }) => {
    const product = {
      id: 'product-oos',
      title: 'Sold Out Tee',
      price: 29.99,
      image: 'https://via.placeholder.com/300',
      brand: 'MockBrand',
      slug: 'sold-out-tee',
      inStock: false,
    };

    // Stub checkout initiate endpoint only — rest of network requests can proceed normally
    await page.route('**/api/checkout/initiate', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ orderId: 'order-2', clientSecret: 'cs_test_456' }) });
    });
    await page.route('**/api/checkout/initiate', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ orderId: 'order-2', clientSecret: 'cs_test_456' }) });
    });

    // Preload cart in localStorage BEFORE any page scripts run
    await page.addInitScript((item) => {
      localStorage.setItem('avnu-cart-storage', JSON.stringify({
        state: { items: [item] },
        version: 0,
      }));
      // Prevent checkout page from redirecting when cart appears empty before rehydration
      Object.defineProperty(window.location, 'replace', { value: () => {}, configurable: true });

    }, {
      product,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });

    // Navigate straight to checkout
    await page.goto('/stripe-checkout?mockStripe=1');
  });

  test('pay button disabled for out-of-stock item', async ({ page }) => {
    // Already on checkout page via beforeEach; verify URL
    await expect(page).toHaveURL(/stripe-checkout/);

    // Wait for form container first to ensure hydration
    await page.locator('[data-testid="stripe-payment-form-container"]').waitFor({ state: 'attached', timeout: 5_000 });
    // Then grab the Pay Now button
    const payBtn = page.locator('[data-testid="pay-button"]');
    await expect(payBtn).toBeVisible({ timeout: 5_000 });
    await expect(payBtn).toBeDisabled();
  });
});
