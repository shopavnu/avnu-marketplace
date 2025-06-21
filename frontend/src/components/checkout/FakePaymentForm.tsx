import React from 'react';

interface FakePaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string, orderId?: string | null) => void;
  onPaymentError: (errorMessage: string) => void;
  orderId?: string;
}

/**
 * Test-only replacement for StripePaymentForm. It simply shows a "Pay Now" button
 * and calls the success callback immediately when clicked. Rendered when
 * NEXT_PUBLIC_DISABLE_STRIPE === "true" to keep end-to-end tests independent of
 * Stripe.
 */
import useCartStore from '@/stores/useCartStore';

const FakePaymentForm: React.FC<FakePaymentFormProps> = ({
  onPaymentSuccess,
  orderId,
}) => {
  const { outOfStockIds, items } = useCartStore();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const hasOutOfStock = (outOfStockIds && outOfStockIds.length > 0) || items.some(it => it.product && it.product.inStock === false);
  const buttonDisabled = !hydrated || hasOutOfStock;

  return (
    <div data-testid="stripe-payment-form-container" style={{ maxWidth: 400, margin: '0 auto' }}>
      {hasOutOfStock && (
        <div style={{ background: '#FED7D7', color: '#822727', padding: '1rem', borderRadius: 6, marginBottom: 12 }}>
          Some items are out of stock. Please update your cart.
        </div>
      )}
      <button
        type="button"
        data-testid="pay-button"
        aria-label="Pay Now"
        disabled={buttonDisabled}
        style={{
          background: hasOutOfStock ? '#CBD5E0' : '#3182ce',
          color: hasOutOfStock ? '#4A5568' : '#fff',
          border: 'none',
          padding: '0.75rem 1rem',
          borderRadius: 4,
          cursor: hasOutOfStock ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
        onClick={() => !buttonDisabled && onPaymentSuccess('pi_test_fake', orderId)}
      >
        Pay Now
      </button>
    </div>
  );
};

export default FakePaymentForm;
