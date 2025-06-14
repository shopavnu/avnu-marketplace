# Checkout Integration – Deferred Auth Work

_Updated: 2025-06-13_

We decided to postpone fully wiring Stripe checkout to the authenticated backend endpoint. Below is a concise summary of the current state and the TODOs a future developer needs to tackle.

## Current State

* Front-end page `/stripe-checkout` exists and renders Stripe Elements.
* `checkoutService.initiateCheckout()` POSTs to `/checkout/initiate` via the shared `axiosInstance`.
* `axiosInstance` now selects the base URL in this order:
  1. `NEXT_PUBLIC_API_BASE_URL`
  2. `NEXT_PUBLIC_API_URL` (legacy)
  3. `http://localhost:8080/api` (fallback)
* When the request fails (e.g., 401 or network error) the service falls back to **mock data** so the UI does not crash.
* The NestJS route `POST /checkout/initiate` is protected by a JWT guard.

## Outstanding Work

1. **Authorization**
   * Ensure a valid JWT is available in the browser and sent as `Authorization: Bearer <token>`.
   * Today `axiosInstance` will include the header automatically _if_ the token is stored under `localStorage['authToken']`.
   * Option B: mark the route public in NestJS (`@Public()` or remove the guard) for guest checkout.

2. **Remove Mock Fallback**
   * Delete the mock-data branch in `checkoutService.ts` once the backend returns `200` with a real `clientSecret`.

3. **Verify Full Client Secret**
   * Response should include a string like `pi_*********_secret_*********`.
   * Pass that directly to the `<Elements>` provider.

4. **End-to-End Test Checklist**
   * Add item(s) to cart.
   * Visit `/stripe-checkout` → backend returns `orderId`, `clientSecret`.
   * Complete payment on Stripe test card `4242 4242 4242 4242`.
   * Verify `/checkout/confirmation` shows success.
   * Confirm `StripeService.handleWebhookEvent` sets `order.paymentStatus = COMPLETED`.

## Nice to Have Later

* Replace console-based toasts with a client-only toast solution.
* Re-enable production build when checkout flow is complete.
* Add Cypress / Playwright tests for the full happy-path flow.

---

Feel free to reach out to the original contributor for any clarifications.
