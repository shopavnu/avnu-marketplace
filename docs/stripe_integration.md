# Stripe Integration for Avnu Marketplace

This document outlines the approach and features for integrating Stripe payments into the Avnu Marketplace application.

## Phase 1: Backend Checkout Orchestration (Completed)

This phase focused on establishing the necessary backend infrastructure to support the Stripe checkout process.

### Key Features Implemented:

1.  **Checkout Module (`CheckoutModule`):**
    *   A dedicated NestJS module (`backend/src/modules/checkout/`) was created to encapsulate all checkout-related logic, promoting modularity and separation of concerns.
    *   It includes `CheckoutService` for business logic and `CheckoutController` for handling API requests.
    *   The module is integrated into the main `AppModule`.

2.  **Checkout Service (`CheckoutService`):**
    *   The core of the backend checkout flow resides in `CheckoutService.initiateCheckoutProcess(userId: string)`.
    *   **Workflow:**
        1.  **User Authentication:** Verifies the authenticated user.
        2.  **Cart Retrieval:** Fetches the user's active cart using `CartService`.
        3.  **Amount Calculation:** Calculates the total payable amount from cart items.
        4.  **Order Creation (Preliminary):** Creates an order in the database with a `PENDING` payment status using `OrdersService`. This order includes item details derived from the cart.
        5.  **Stripe PaymentIntent Creation:** Communicates with the Stripe API to create a PaymentIntent. The amount and currency (defaulting to 'usd', configurable via `DEFAULT_CURRENCY` env var) are passed to Stripe. The `order_id` is included in the PaymentIntent's metadata to link the Stripe transaction to the internal order.
        6.  **Order Update:** Updates the newly created order with the `stripePaymentIntentId` received from Stripe.
        7.  **Response:** Returns the `orderId`, the PaymentIntent's `clientSecret` (for frontend use), and the `paymentIntentId`.

3.  **Checkout Controller (`CheckoutController`):**
    *   Exposes a `POST` endpoint: `/api/checkout/initiate`.
    *   **Protection:** Secured using `JwtAuthGuard`, ensuring only authenticated users can initiate checkout.
    *   **Request:** Expects an authenticated user session.
    *   **Response:** Returns `InitiateCheckoutResponseDto` containing `orderId`, `clientSecret`, and `paymentIntentId`.

4.  **Data Transfer Objects (DTOs):**
    *   `InitiateCheckoutResponseDto`: Defines the structure for the `/api/checkout/initiate` response, enhancing API documentation (Swagger) and type safety.
    *   `UpdateOrderDto`: Modified to include an optional `stripePaymentIntentId` field, allowing the `OrdersService` to store this link.

5.  **Error Handling and Logging:**
    *   Basic logging is in place within the service and controller.
    *   Standard NestJS HTTP exceptions are used for error responses.

### API Endpoint:

*   **`POST /api/checkout/initiate`**
    *   **Description:** Initiates the checkout process for the authenticated user.
    *   **Auth:** JWT Token required.
    *   **Response Body (`InitiateCheckoutResponseDto`):**
        ```json
        {
          "orderId": "string",
          "clientSecret": "string", // Stripe PaymentIntent client secret
          "paymentIntentId": "string"
        }
        ```

### Next Steps (Backend):
*   Implement robust webhook handlers for various Stripe events (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.dispute.created`, etc.) to update order status and manage post-payment lifecycle. (Partially covered by existing `StripeWebhookController` and `StripeService`, but will need expansion for full order lifecycle based on `order_id` in metadata).

## Phase 2: Frontend Integration (Upcoming)

This phase will involve:
1.  Creating a frontend service/hook to call the `/api/checkout/initiate` backend endpoint.
2.  Using the `clientSecret` (obtained from the backend) with Stripe.js (or React Stripe.js) to:
    *   Mount Stripe's payment elements (e.g., Card Element).
    *   Confirm the payment on the client-side.
3.  Handling payment success or failure in the UI.
4.  Redirecting to an order confirmation page or displaying appropriate messages.
5.  Collecting shipping information if not already present.

## Phase 3: Webhook Enhancements (Ongoing with Backend)

This phase will focus on:
1.  Ensuring the `StripeWebhookController` and `StripeService` can handle all relevant payment lifecycle events.
2.  Updating order statuses (`PaymentStatus.COMPLETED`, `PaymentStatus.FAILED`, etc.) based on webhook events.
3.  Handling refunds and disputes.
4.  Potentially triggering other post-payment actions like sending confirmation emails.

This document will be updated as the integration progresses.
