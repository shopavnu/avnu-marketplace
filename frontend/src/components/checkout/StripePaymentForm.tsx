import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'; // Corrected import path
import { initiateCheckout } from '../../services/checkoutService';
import { Button, CircularProgress, Box, Text, VStack, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface StripePaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string, orderId?: string | null) => void;
  onPaymentError: (errorMessage: string) => void;
  orderId?: string; // Optional: if order is already created and we just need to pay
  clientSecretProp?: string; // Optional: if client secret is already fetched
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  orderId: existingOrderId,
  clientSecretProp,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(clientSecretProp || null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(existingOrderId || null);
  const [isLoading, setIsLoading] = useState(false); // For Stripe's actions
  const [isInitializing, setIsInitializing] = useState(!clientSecretProp); // Only initialize if clientSecret isn't provided
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Only initiate checkout to get clientSecret if it wasn't passed as a prop
    if (!clientSecretProp && !existingOrderId) { 
      setIsInitializing(true);
      initiateCheckout()
        .then((data) => {
          setClientSecret(data.clientSecret);
          setCurrentOrderId(data.orderId);
          setIsInitializing(false);
        })
        .catch((error) => {
          console.error('Failed to initialize checkout:', error);
          const message = error.message || 'Could not initialize payment.';
          setErrorMessage(message);
          onPaymentError(message);
          setIsInitializing(false);
        });
    } else if (clientSecretProp) {
      setClientSecret(clientSecretProp);
      setIsInitializing(false);
    }
    // If existingOrderId is provided but no clientSecretProp, the parent component is responsible for fetching it.
    // Or, this component could be enhanced to fetch it based on orderId.

  }, [clientSecretProp, existingOrderId, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Stripe is not ready. Please wait a moment and try again.');
      toast({
        title: 'Initialization Error',
        description: 'Stripe is not ready. Please wait or refresh.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation?order_id=${currentOrderId}`,
      },
      // redirect: 'if_required', // Uncomment for more manual control
    });

    if (error) {
      let userMessage = error.message || 'An unexpected error occurred.';
      if (error.type === "card_error" || error.type === "validation_error") {
        userMessage = error.message || 'Please check your card details.';
      }
      setErrorMessage(userMessage);
      onPaymentError(userMessage);
      toast({
        title: 'Payment Failed',
        description: userMessage,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } else if (paymentIntent) {
      // This block is typically for 'if_required' redirect or if no redirect happened.
      // With default redirect, success is handled on the return_url page.
      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id, currentOrderId);
        toast({
          title: 'Payment Successful!',
          description: `Order ${currentOrderId} confirmed. You will be redirected.`, 
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else if (paymentIntent.status === 'requires_action') {
         toast({
          title: 'Further action required',
          description: 'Please complete the steps with your payment provider.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Handle other statuses if necessary
        setErrorMessage(`Payment status: ${paymentIntent.status}`);
      }
    }
    setIsLoading(false);
  };

  if (isInitializing) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="250px" p={5} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <CircularProgress isIndeterminate color="blue.500" size="48px" />
        <Text fontSize="lg" fontWeight="medium">Initializing Secure Payment...</Text>
        <Text fontSize="sm" color="gray.500">Please wait while we prepare your transaction.</Text>
      </VStack>
    );
  }

  if (!clientSecret && !isInitializing) {
     return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minH="250px" p={5} borderRadius="lg" boxShadow="md">
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="xl" fontWeight="bold">Payment Initialization Failed</AlertTitle>
        <AlertDescription maxWidth="sm">
          {errorMessage || 'We encountered an issue loading the payment form. Please try refreshing the page or contact support if the problem persists.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!stripe || !elements) {
    return (
      <VStack spacing={4} align="center" justify="center" minH="250px" p={5} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <CircularProgress isIndeterminate color="gray.400" size="48px" />
        <Text fontSize="lg" fontWeight="medium">Loading Payment Gateway...</Text>
        <Text fontSize="sm" color="gray.500">Securely connecting to Stripe.</Text>
      </VStack>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth={{ base: "100%", md: "500px" }} p={{base: 4, md: 6}} borderWidth="1px" borderRadius="xl" boxShadow="lg" bg="white">
      <VStack spacing={6} align="stretch">
        <Text fontSize={{base: "xl", md: "2xl"}} fontWeight="bold" textAlign="center" color="gray.700">Secure Payment</Text>
        
        <Box my={2}>
          <PaymentElement 
            id="payment-element" 
            options={{
              layout: 'tabs', // 'tabs' or 'accordion'
              // business: { name: 'Avnu Marketplace' }, // Optional: display business name
            }}
          />
        </Box>
        
        {errorMessage && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription data-testid="payment-error-message">{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          isDisabled={!stripe || !elements || isLoading || isInitializing}
          width="full"
          size="lg"
          py={6} // Taller button
          fontSize="md"
          fontWeight="bold"
          mt={2}
          _hover={{ bg: 'blue.600' }}
          _active={{ bg: 'blue.700' }}
          // Simple animation example
          transition="background-color 0.2s ease-out, transform 0.1s ease-out"
          _disabled={{ 
            bg: 'gray.300',
            cursor: 'not-allowed',
            opacity: 0.7
          }}
          _loading={{ 
            opacity: 0.8
          }}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </VStack>
    </Box>
  );
};

export default StripePaymentForm;
