import React from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../../components/checkout/StripePaymentForm';
import { Box, Heading, Container, VStack, Text, Divider, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
// import { useRouter } from 'next/router'; // Uncomment if you need router for redirection

// Make sure to set this in your .env.local or similar environment file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const StripeCheckoutPage: React.FC = () => {
  // const router = useRouter(); // Uncomment for programmatic navigation

  // Example: Get cart details from a hook or context
  // const { cart, totalAmount } = useCart(); 
  const placeholderTotalAmount = 50.00; // Example amount, replace with actual cart total

  const handlePaymentSuccess = (paymentIntentId: string, orderId?: string | null) => {
    console.log('Payment Successful!', { paymentIntentId, orderId });
    // Example: Redirect to an order confirmation page
    // router.push(`/checkout/confirmation?payment_intent_id=${paymentIntentId}&order_id=${orderId}&status=success`);
    alert(`Payment Successful! Order ID: ${orderId || 'N/A'}, PaymentIntent ID: ${paymentIntentId}. Redirecting (simulated)...`);
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment Error:', errorMessage);
    // Display error message to the user, perhaps using a toast or an alert on this page
    alert(`Payment Failed: ${errorMessage}`);
  };
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Container centerContent py={10} minH="100vh">
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <Heading size="md" mt={4}>Configuration Error</Heading>
          <Text mt={2}>Stripe publishable key is not configured. Please check your environment variables.</Text>
        </Alert>
      </Container>
    );
  }
  
  const elementsOptions: StripeElementsOptions = {
    // clientSecret will be fetched by StripePaymentForm if not passed directly here
    appearance: {
      theme: 'stripe', // or 'night', 'flat'
      variables: {
        colorPrimary: '#0570de', // Your brand's primary color
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      },
      rules: {
        '.Tab': {
          border: '1px solid #E0E6EB',
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
        },
        '.Input': {
           boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(18, 42, 66, 0.02)',
        }
      }
    },
  };

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 10 }} bg="gray.50" minH="100vh">
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        <Heading as="h1" size={{ base: "lg", md: "xl" }} textAlign="center" color="gray.800">
          Secure Checkout
        </Heading>

        {/* Placeholder for Cart Summary */}
        <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
          <Heading as="h2" size={{ base: "md", md: "lg" }} mb={4} color="gray.700">Order Summary</Heading>
          <VStack spacing={3} align="stretch">
            <Box display="flex" justifyContent="space-between">
              <Text color="gray.600">Example Product 1 (x1)</Text>
              <Text fontWeight="medium" color="gray.800">$25.00</Text>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text color="gray.600">Example Product 2 (x1)</Text>
              <Text fontWeight="medium" color="gray.800">$25.00</Text>
            </Box>
            <Divider my={3}/>
            <Box display="flex" justifyContent="space-between" fontWeight="bold">
              <Text fontSize={{ base: "md", md: "lg" }} color="gray.800">Total</Text>
              <Text fontSize={{ base: "md", md: "lg" }} color="gray.800">${placeholderTotalAmount.toFixed(2)}</Text>
            </Box>
          </VStack>
        </Box>

        <Box w="full" maxW={{ base: "100%", md: "lg" }} mx="auto"> 
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripePaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Elements>
        </Box>
      </VStack>
    </Container>
  );
};

export default StripeCheckoutPage;
