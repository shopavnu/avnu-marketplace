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

// Define CSS styles for components
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem'
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '1.25rem'
  },
  spinner: {
    display: 'inline-block',
    width: '2rem',
    height: '2rem',
    border: '0.25rem solid rgba(66, 153, 225, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'rgb(66, 153, 225)',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '0.75rem'
  },
  alert: {
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '0.375rem',
    backgroundColor: '#FED7D7',
    color: '#822727'
  },
  alertTitle: {
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  button: {
    backgroundColor: '#3182ce',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    width: '100%',
    border: 'none',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#CBD5E0',
    cursor: 'not-allowed'
  }
};

const spinAnimation = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Define payment element options
const paymentElementOptions: StripePaymentElementOptions = {
  layout: {
    type: 'tabs',
    defaultCollapsed: false
  }
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  orderId,
  clientSecretProp,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>(clientSecretProp || '');

  const stripe = useStripe();
  const elements = useElements();
  
  // Custom toast function to replace Chakra UI's useToast
  const toast = (options: { 
    title: string; 
    description: string; 
    status: string; 
    duration: number; 
    isClosable: boolean; 
    position?: string 
  }) => {
    console.log(`${options.title}: ${options.description}`);
    // Display error in UI through errorMessage state instead
    if (options.status === 'error') {
      setErrorMessage(options.description);
    }
  };

  useEffect(() => {
    async function fetchClientSecret() {
      if (clientSecret || !orderId) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await initiateCheckout(orderId) as CheckoutResponse;
        
        const receivedSecret = response.clientSecret || response.data?.clientSecret;
        
        if (receivedSecret) {
          setClientSecret(receivedSecret);
          console.log('Payment initialization successful');
        } else {
          throw new Error('Failed to retrieve payment information from server');
        }
      } catch (error: unknown) {
        let message = 'Failed to initialize payment';
        
        if (error instanceof Error) {
          message = `Payment initialization failed: ${error.message}`;
        }

        setErrorMessage(message);
        console.error('Stripe payment initialization failed:', error);
        
        toast({
          title: 'Payment Error',
          description: message,
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchClientSecret();
  }, [clientSecret, orderId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment-result`,
        },
      });

      if (error) {
        const message = error.message || 'Something went wrong with your payment';
        setErrorMessage(message);
        
        toast({
          title: 'Payment Error',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        onPaymentError(message);
        
        console.error('Payment confirmation error:', error);
      } else if (paymentIntent) {
        // Payment succeeded
        setErrorMessage(null);
        
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        console.log('Payment succeeded:', paymentIntent);
        onPaymentSuccess(paymentIntent.id, orderId);
      }
    } catch (err: unknown) {
      let message = 'An unexpected error occurred during payment processing';
      
      if (err instanceof Error) {
        message = err.message;
      }
      
      setErrorMessage(message);
      console.error('Payment processing error:', err);
      
      toast({
        title: 'Payment Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div 
        style={styles.loadingContainer}
        data-testid="stripe-loading-container" 
        role="status"
      >
        <div 
          style={styles.spinner}
          aria-label="Loading payment form"
        />
        <style>{spinAnimation}</style>
        <p 
          style={styles.loadingText}
          aria-live="polite"
        >
          Loading payment elements...
        </p>
      </div>
    );
  }

  if (!clientSecret && !isLoading) {
    return (
      <div 
        style={styles.alert}
        data-testid="payment-init-error-alert"
        role="alert"
        aria-live="assertive"
      >
        <h3 style={styles.alertTitle}>Payment Initialization Failed</h3>
        <p>{errorMessage || "Unable to initialize payment form. Please refresh the page or try again later."}</p>
      </div>
    );
  }

  return (
    <div 
      style={styles.container}
      data-testid="stripe-payment-form-container"
    >
      {/* Error message alert (if any) */}
      {errorMessage && (
        <div 
          style={styles.alert}
          data-testid="payment-error-alert"
          role="alert"
          aria-live="assertive"
        >
          <h3 style={styles.alertTitle}>Payment Error</h3>
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Payment form */}
      <form 
        onSubmit={handleSubmit}
        data-testid="stripe-payment-form"
        aria-label="Credit card payment form"
      >
        {/* Payment Element container */}
        <div style={{ marginBottom: '1rem' }}>
          {clientSecret && (
            <PaymentElement
              id="payment-element"
              options={paymentElementOptions}
            />
          )}
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          style={{
            ...styles.button, 
            ...((!stripe || !elements || !clientSecret || isLoading) ? styles.disabledButton : {})
          }}
          disabled={!stripe || !elements || !clientSecret || isLoading}
          data-testid="payment-submit-button"
          aria-label={isLoading ? "Processing payment" : "Complete payment"}
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
};

export default StripePaymentForm;
