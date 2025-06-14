import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

import { useRouter } from 'next/router';
import useCart from '@/hooks/useCart';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { initiateCheckout, InitiateCheckoutResponse } from '@/services/checkoutService';
// Replaced Chakra UI imports with standard HTML/CSS

// Make sure to set this in your .env.local or similar environment file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const StripeCheckoutPage: React.FC = () => {
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined);
  const [initError, setInitError] = useState<string | null>(null);

  const router = useRouter();
  const toast = (opts: any) => {
    if (typeof window !== 'undefined') {
      console.log(`${opts.title}: ${opts.description ?? ''}`);
    }
  };

  // Get cart details from store
  const { items, cartTotal } = useCart();

  // Redirect to home if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/');
      toast({ title: 'Your cart is empty', status: 'info', duration: 4000, isClosable: true });
    }
  }, [items, router, toast]);

  // Group items by brand for display
  const itemsByBrand = useMemo(() => {
    const map: Record<string, typeof items> = {};
    items.forEach((it) => {
      const brand = it.product.brand ?? 'Other';
      if (!map[brand]) map[brand] = [];
      map[brand].push(it);
    });
    return map;
  }, [items]);

  // Pre-create order/payment intent on mount
  useEffect(() => {
    async function init() {
      try {
        const res: InitiateCheckoutResponse = await initiateCheckout();
        setOrderId(res.orderId);
        setClientSecret(res.clientSecret);
      } catch (e) {
        console.error('Checkout init failed', e);
        const msg = (e as Error).message;
        setInitError(msg);
        toast({ title: 'Checkout unavailable', description: msg, status: 'error', duration: 6000, isClosable: true, position: 'top' });
      }
    }
    init();
  }, []);


  const handlePaymentSuccess = (paymentIntentId: string, orderId?: string | null) => {
    console.log('Payment Successful!', { paymentIntentId, orderId });
    router.push(
      {
        pathname: '/checkout/confirmation',
        query: {
          payment_intent: paymentIntentId,
          order_id: orderId ?? undefined,
          redirect_status: 'succeeded',
        },
      },
      undefined,
      { shallow: false },
    );
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment Error:', errorMessage);
    router.push({
      pathname: '/checkout/confirmation',
      query: {
        redirect_status: 'error',
        message: errorMessage,
      },
    });
  };
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div style={{ padding: '2.5rem 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#FED7D7', borderRadius: '0.375rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '200px', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Configuration Error</h2>
          <p style={{ marginTop: '0.5rem' }}>Stripe publishable key is not configured. Please check your environment variables.</p>
        </div>
      </div>
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
    <div style={{ padding: '1.5rem', backgroundColor: '#F7FAFC', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: '#2D3748', fontWeight: 'bold' }}>
          Secure Checkout
        </h1>

        {/* Cart Summary */}
        <div style={{ padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4A5568', fontWeight: 'bold' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.length === 0 ? (
              <p style={{ color: '#718096' }}>Your cart is empty.</p>
            ) : (
              <>
                {Object.entries(itemsByBrand).map(([brand, brandItems]) => (
                  <div key={brand} style={{ marginBottom: '0.75rem' }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{brand}</p>
                    {brandItems.map((item) => (
                      <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.product.image && (
                            <Image src={item.product.image} alt={item.product.title} width={40} height={40} style={{ borderRadius: '4px' }} />
                          )}
                          <p style={{ color: '#4A5568' }}>{item.quantity} × {item.product.title}</p>
                        </div>
                        <p style={{ fontWeight: '500', color: '#2D3748' }}>${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ))}
                <hr style={{ margin: '0.75rem 0', borderTop: '1px solid #E2E8F0' }}/>
                <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Tax calculated at payment.</p>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <p style={{ fontSize: '1.125rem', color: '#2D3748' }}>Total</p>
              <p style={{ fontSize: '1.125rem', color: '#2D3748' }}>${cartTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}> 
          {initError && (
            <div style={{background:'#FED7D7',borderLeft:'4px solid #F56565',padding:'1rem',marginBottom:'1rem',borderRadius:'0.375rem'}}>
              <p style={{fontWeight:600,color:'#C53030',marginBottom:'0.25rem'}}>Checkout unavailable</p>
              <p style={{color:'#C53030'}}>{initError}</p>
            </div>
          )}
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ ...elementsOptions, clientSecret } as StripeElementsOptions}
            >
              <StripePaymentForm
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                orderId={orderId}
                clientSecretProp={clientSecret}
              />
            </Elements>
          )}
          {!clientSecret && !initError && (
            <div style={{padding:'2rem',textAlign:'center'}}>
              <div style={{width:'2.5rem',height:'2.5rem',border:'4px solid #38B2AC',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutPage;
