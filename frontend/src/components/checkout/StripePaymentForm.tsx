import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { initiateCheckout } from '../../services/checkoutService';
// Import components and their types separately for better TypeScript resolution
import {
  Button,
  Box,
  Text,
  Spinner,
  Alert,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import type {
  ButtonProps,
  BoxProps,
  TextProps,
  SpinnerProps,
  AlertProps,
  AlertTitleProps,
  AlertDescriptionProps,
  UseToastOptions,
} from '@chakra-ui/react';

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
  const toast = useToast();

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
  }, [clientSecret, orderId, toast]);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
  };

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
    return React.createElement(
      Box as unknown as React.ComponentType<BoxProps>,
      { textAlign: "center", p: 5, "data-testid": "stripe-loading-container", role: "status" },
      [
        React.createElement(
          Spinner as unknown as React.ComponentType<SpinnerProps>,
          { size: "md", color: "blue.500", "aria-label": "Loading payment form", key: "spinner" }
        ),
        React.createElement(
          Text as unknown as React.ComponentType<TextProps>,
          { mt: 3, key: "loading-text", "aria-live": "polite" },
          "Loading payment elements..."
        )
      ]
    );
  }

  if (!clientSecret && !isLoading) {
    return React.createElement(
      Alert as unknown as React.ComponentType<AlertProps>,
      { 
        status: "error", 
        mb: 4, 
        borderRadius: "md", 
        "data-testid": "payment-init-error-alert",
        role: "alert",
        "aria-live": "assertive"
      },
      [
        React.createElement(
          AlertTitle as unknown as React.ComponentType<AlertTitleProps>,
          { fontWeight: "semibold", key: "error-title" },
          "Payment Initialization Failed"
        ),
        React.createElement(
          AlertDescription as unknown as React.ComponentType<AlertDescriptionProps>,
          { key: "error-description" },
          errorMessage || "Unable to initialize payment form. Please refresh the page or try again later."
        )
      ]
    );
  }

  return React.createElement(
    Box as unknown as React.ComponentType<BoxProps>,
    { 
      maxWidth: "600px", 
      mx: "auto", 
      p: 4, 
      "data-testid": "stripe-payment-form-container"
    },
    [
      // Error message alert (if any)
      errorMessage && React.createElement(
        Alert as unknown as React.ComponentType<AlertProps>,
        { 
          status: "error", 
          mb: 4, 
          borderRadius: "md", 
          key: "error-alert", 
          "data-testid": "payment-error-alert",
          role: "alert",
          "aria-live": "assertive"
        },
        [
          React.createElement(
            AlertTitle as unknown as React.ComponentType<AlertTitleProps>,
            { fontWeight: "semibold", key: "error-title" },
            "Payment Error"
          ),
          React.createElement(
            AlertDescription as unknown as React.ComponentType<AlertDescriptionProps>,
            { key: "error-description" },
            errorMessage
          )
        ]
      ),
      
      // Payment form
      React.createElement(
        "form",
        { 
          onSubmit: handleSubmit, 
          key: "payment-form", 
          "data-testid": "stripe-payment-form",
          "aria-label": "Credit card payment form"
        },
        [
          // Payment Element container
          React.createElement(
            Box as unknown as React.ComponentType<BoxProps>,
            { mb: 4, key: "payment-element-container" },
            clientSecret && React.createElement(
              PaymentElement,
              {
                id: "payment-element",
                options: paymentElementOptions,
                key: "payment-element"
              }
            )
          ),
          
          // Submit button
          React.createElement(
            Button as unknown as React.ComponentType<ButtonProps>,
            {
              type: "submit",
              colorScheme: "blue",
              isLoading: isLoading,
              loadingText: "Processing payment...",
              isDisabled: !stripe || !elements || !clientSecret || isLoading,
              width: "100%",
              key: "submit-button",
              "data-testid": "payment-submit-button",
              "aria-label": isLoading ? "Processing payment" : "Complete payment"
            },
            isLoading ? "Processing..." : "Pay Now"
          )
        ]
      )
    ]
  );
};

export default StripePaymentForm;
