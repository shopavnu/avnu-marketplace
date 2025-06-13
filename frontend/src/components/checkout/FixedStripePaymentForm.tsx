import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { initiateCheckout } from '../../services/checkoutService';

/**
 * Props for the StripePaymentForm component
 */
interface StripePaymentFormProps {
  /** Callback function that is called upon successful payment processing */
  onPaymentSuccess: (paymentIntentId: string, orderId?: string | null) => void;
  /** Callback function that is called when a payment error occurs */
  onPaymentError: (errorMessage: string) => void;
  /** Optional order ID to associate with this payment */
  orderId?: string;
  /** Optional client secret if already available (bypasses the need to fetch one) */
  clientSecretProp?: string;
}

/**
 * Shape of the response from the checkout service
 */
interface CheckoutResponse {
  clientSecret?: string;
  data?: {
    clientSecret?: string;
  };
}

// Define payment element options
const paymentElementOptions: StripePaymentElementOptions = {
  layout: {
    type: 'tabs',
    defaultCollapsed: false
  }
};

/**
 * Stripe Payment Form component for collecting and processing payments
 */
const FixedStripePaymentForm = ({
  onPaymentSuccess,
  onPaymentError,
  orderId,
  clientSecretProp,
}: StripePaymentFormProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>(clientSecretProp || '');

  const stripe = useStripe();
  const elements = useElements();
  
  // Custom toast function to replace Chakra UI's useToast
  const toast = (options: { 
    title: string; 
    description: string; 
    status: 'success' | 'error' | 'warning' | 'info'; 
    duration: number; 
    isClosable: boolean; 
    position?: string 
  }): void => {
    console.log(`${options.title}: ${options.description}`);
    // Display error in UI through errorMessage state instead
    if (options.status === 'error') {
      setErrorMessage(options.description);
    }
  };

  const fetchClientSecret = async (): Promise<void> => {
    if (clientSecret || !orderId) {
      return;
    }

    try {
      setIsLoading(true);
      const response: CheckoutResponse = await initiateCheckout(orderId);
      const secret = response?.clientSecret || response?.data?.clientSecret;
      if (secret) {
        setClientSecret(secret);
      } else {
        throw new Error('Failed to fetch client secret');
      }
    } catch (error: any) {
      const message = error?.message || 'Unable to start checkout. Please try again.';
      setErrorMessage(message);
      onPaymentError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch client secret once on mount if not provided
  useEffect(() => {
    if (!clientSecret && orderId) {
      void fetchClientSecret();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, orderId]);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Check for hash fragment in the URL which may contain payment intent result
    const clientSecretParam = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    
    if (clientSecretParam) {
      stripe.retrievePaymentIntent(clientSecretParam).then(({ paymentIntent }) => {
        if (!paymentIntent) {
          return;
        }

        switch (paymentIntent.status) {
          case "succeeded":
            // Show success message
            break;
          case "processing":
            // Show processing message
            break;
          case "requires_payment_method":
            // Show error message
            setErrorMessage("Your payment was not successful, please try again.");
            break;
          default:
            setErrorMessage("Something went wrong with your payment. Please try again.");
            break;
        }
      });
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js hasn't loaded yet or elements not ready
      return;
    }

    setIsLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmed`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Payment failed. Please try again.');
      } else {
        // Payment succeeded
        // Handle success (you can add additional logic here)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles using standard inline React style objects
  const styles = {
    formContainer: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center' as const,
    },
    alertContainer: {
      padding: '12px 16px',
      backgroundColor: '#FEE2E2',
      border: '1px solid #F87171',
      borderRadius: '4px',
      marginBottom: '16px',
    },
    alertTitle: {
      color: '#B91C1C',
      fontWeight: 600,
      marginBottom: '4px',
    },
    button: {
      backgroundColor: '#3182CE',
      color: 'white',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 600,
      cursor: 'pointer',
      width: '100%',
      marginTop: '16px',
    },
    disabledButton: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    loadingText: {
      marginTop: '8px',
    },
    spinAnimation: {
      animation: 'spin 1s linear infinite',
    }
  };

  // Loading state when Stripe is initializing
  if (!stripe || !elements) {
    return (
      <div 
        style={styles.loadingContainer}
        data-testid="stripe-loading-container" 
        role="status"
      >
        <div style={styles.loadingContainer}>
          <p>Loading payment form...</p>
        </div>
      </div>
    );
  }

  // Error state if there was a setup issue
  if (errorMessage && !clientSecret) {
    return (
      <div 
        style={styles.alertContainer}
        data-testid="stripe-error-container" 
        role="alert"
      >
        <h3 style={styles.alertTitle}>Payment Initialization Failed</h3>
        <p>{errorMessage || "Unable to initialize payment form. Please refresh the page or try again later."}</p>
      </div>
    );
  }

  // Normal payment form
  return (
    <form 
      onSubmit={handleSubmit}
      data-testid="stripe-payment-form"
    >
      {errorMessage && (
        <div 
          style={styles.alertContainer}
          data-testid="payment-error" 
          role="alert"
        >
          <h3 style={styles.alertTitle}>Payment Error</h3>
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div style={styles.formContainer}>
        <PaymentElement 
          id="payment-element" 
          options={{ 
            // Add any PaymentElement options here if needed
          }} 
        />
        
        <button 
          type="submit"
          style={{
            ...styles.button,
            ...((!stripe || !elements || !clientSecret || isLoading) ? styles.disabledButton : {})
          }}
          disabled={!stripe || !elements || !clientSecret || isLoading}
          data-testid="submit-button"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
};

export default FixedStripePaymentForm;
