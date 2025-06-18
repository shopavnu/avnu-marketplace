import { Box, Button, Heading, Spinner, Text } from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type PaymentStatusState =
  | 'loading'
  | 'success'
  | 'processing'
  | 'requires_payment_method'
  | 'requires_action'
  | 'canceled'
  | 'error';

const ConfirmationPage: React.FC = () => {
  const router = useRouter();
  const {
    payment_intent_client_secret: clientSecret,
    payment_intent, // just in case we want to show it later
    redirect_status,
    order_id,
  } = router.query as {
    payment_intent_client_secret?: string;
    payment_intent?: string;
    redirect_status?: string;
    order_id?: string;
  };

  const [status, setStatus] = useState<PaymentStatusState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // We need the client secret to retrieve the PaymentIntent
    if (!clientSecret) return;

    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          setStatus('error');
          setErrorMessage('Stripe failed to initialize.');
          return;
        }
        const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

        if (error) {
          setStatus('error');
          setErrorMessage(error.message || 'Unable to retrieve payment details.');
        } else if (paymentIntent) {
          switch (paymentIntent.status) {
            case 'succeeded':
              setStatus('success');
              break;
            case 'processing':
              setStatus('processing');
              break;
            case 'requires_payment_method':
            case 'requires_action':
              setStatus('requires_payment_method');
              break;
            case 'canceled':
              setStatus('canceled');
              break;
            default:
              setStatus('error');
          }
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred while confirming your payment.');
      }
    })();
  }, [clientSecret]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box textAlign="center" py={10}>
            <Spinner />
            <Text mt={4}>Finalizing your payment...</Text>
          </Box>
        );
      case 'success':
        return (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Payment Successful 🎉
            </Heading>
            {order_id && (
              <Text mb={2}>
                Your order ID: <strong>{order_id}</strong>
              </Text>
            )}
            <Text mb={6}>Thank you for your purchase.</Text>
            <Link href="/" passHref>
              <Button colorScheme="teal">Continue Shopping</Button>
            </Link>
          </Box>
        );
      case 'processing':
        return (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Payment Processing
            </Heading>
            <Text mb={6}>We're processing your payment. You will receive an email confirmation shortly.</Text>
          </Box>
        );
      case 'requires_payment_method':
        return (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Payment Failed
            </Heading>
            <Text mb={6}>Your payment was not successful, please try again.</Text>
            <Link href="/stripe-checkout" passHref>
              <Button colorScheme="red">Return to Checkout</Button>
            </Link>
          </Box>
        );
      case 'canceled':
        return (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Payment Canceled
            </Heading>
            <Text mb={6}>Your payment was canceled. You can try again or continue shopping.</Text>
            <Link href="/stripe-checkout" passHref>
              <Button colorScheme="yellow" mr={2}>
                Retry Payment
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button variant="ghost">Home</Button>
            </Link>
          </Box>
        );
      case 'error':
      default:
        return (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Something went wrong
            </Heading>
            <Text mb={6}>{errorMessage || 'We could not confirm your payment.'}</Text>
            <Link href="/stripe-checkout" passHref>
              <Button colorScheme="red">Return to Checkout</Button>
            </Link>
          </Box>
        );
    }
  };

  return (
    <Box maxW="xl" mx="auto" px={4}>
      {renderContent()}
    </Box>
  );
};

import dynamicLib from 'next/dynamic';

// Disable prerendering to avoid Chakra context SSR issues
export const dynamic = 'error';

// Disable server-side rendering to avoid Chakra context issues
const ConfirmationPageNoSSR = dynamicLib(() => Promise.resolve(ConfirmationPage), { ssr: false });

export default ConfirmationPageNoSSR;
