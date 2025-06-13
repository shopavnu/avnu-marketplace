import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  clientSecret?: string;
  onPaymentSuccess?: (paymentIntentId: string, orderId?: string | null) => void;
  onPaymentError?: (errorMessage: string) => void;
}

const MinimalStripePaymentForm: React.FC<StripePaymentFormProps> = ({ clientSecret, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmed`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An unknown error occurred');
        if (onPaymentError) {
          onPaymentError(error.message || 'An unknown error occurred');
        }
      } else if (paymentIntent) {
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentIntent.id || '');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      if (onPaymentError) {
        onPaymentError(error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return <div>Loading payment form...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', marginBottom: '16px' }}>
          <p style={{ color: '#B91C1C', fontWeight: 'bold' }}>Payment Error</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div>
        <PaymentElement id="payment-element" />
        
        <button 
          type="submit"
          disabled={isLoading || !stripe}
          style={{
            backgroundColor: '#3182CE',
            color: 'white',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            marginTop: '16px',
            opacity: (isLoading || !stripe) ? '0.7' : '1',
          }}
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
};

export default MinimalStripePaymentForm;
