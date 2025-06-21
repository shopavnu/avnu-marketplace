import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { useRouter } from 'next/router';
import useCart from '@/hooks/useCart';
import clsx from 'clsx';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import FakePaymentForm from '@/components/checkout/FakePaymentForm';
import { initiateCheckout, InitiateCheckoutResponse } from '@/services/checkoutService';
// Replaced Chakra UI imports with standard HTML/CSS

// Make sure to set this in your .env.local or similar environment file
// Use a dummy publishable key in non-prod to avoid loadStripe throwing when env var is missing
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_12345');

const DISABLE_STRIPE = process.env.NEXT_PUBLIC_DISABLE_STRIPE === 'true';
// Use fake payment form automatically during Playwright/Jest tests to avoid real Stripe dependencies
const GLOBAL_FAKE_FLAG = DISABLE_STRIPE || process.env.NODE_ENV === 'test';

const StripeCheckoutPage: React.FC = () => {
  const router = useRouter();
  const urlFakeFlag = router?.query?.mockStripe === '1';
  const USE_FAKE_PAYMENT = GLOBAL_FAKE_FLAG || urlFakeFlag;
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined);
  const [initError, setInitError] = useState<string | null>(null);

  const toast = useCallback((opts: any) => {
    if (typeof window !== 'undefined') {
      console.log(`${opts.title}: ${opts.description ?? ''}`);
    }
  }, []);

  // Payment success handler (hoisted)
  function handlePaymentSuccess(paymentIntentId: string, orderId?: string | null) {
    console.log('Payment Successful!', { paymentIntentId, orderId });
    router.push({
      pathname: '/checkout/confirmation',
      query: {
        payment_intent: paymentIntentId,
        order_id: orderId ?? undefined,
        redirect_status: 'succeeded',
      },
    });
  }

  function handlePaymentError(errorMessage: string) {
    console.error('Payment Error:', errorMessage);
    router.push({
      pathname: '/checkout/confirmation',
      query: { redirect_status: 'error', message: errorMessage },
    });
  }

  // Gather cart & UI state hooks BEFORE any conditional returns to satisfy React hook rules
  const { items, cartTotal, recentlyUpdatedIds, outOfStockIds } = useCart();
  const [summaryOpen, setSummaryOpen] = useState<boolean>(true);

  // [Removed early return to ensure hooks run consistently]
  

  // Redirect to home if cart is empty – but only after verifying that persisted cart is also empty.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasPersistedItems = (() => {
      try {
        const raw = localStorage.getItem('avnu-cart-storage');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed?.state?.items) && parsed.state.items.length > 0;
      } catch {
        return false;
      }
    })();

    if (items.length === 0 && !hasPersistedItems) {
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
  }, [toast]);


  // duplicate handled above, removed
/*
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

  // duplicate handled above, removed
/*
    console.error('Payment Error:', errorMessage);
    router.push({
      pathname: '/checkout/confirmation',
      query: {
        redirect_status: 'error',
        message: errorMessage,
      },
    });
  };
*/

  // In CI/E2E environments we may omit the real Stripe key – allow blank key
// Note: loadStripe('') returns a mock-like instance when window.Stripe is stubbed in Playwright tests.

    


  // If using fake payment form, render it and skip Stripe init (hooks already set above)
  if (USE_FAKE_PAYMENT) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Checkout (Test Mode)</h1>
        <FakePaymentForm
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          orderId={undefined}
        />
      </main>
    );
  }

  
  // Stripe Elements appearance fine-tuned for brand look & feel
  const elementsOptions: StripeElementsOptions = {
    // clientSecret will be fetched by StripePaymentForm if not passed directly here
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#38B2AC', // teal brand
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
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

        {/* Cart Summary (accordion on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: '1.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}
        >
          {/* Mobile toggle button */}
          <button
            onClick={() => setSummaryOpen((prev: boolean) => !prev)}
            style={{
              display: 'block',
              background: 'none',
              border: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              marginBottom: '0.75rem',
              cursor: 'pointer',
            }}
            className="summary-toggle"
          >
            {summaryOpen ? 'Hide' : 'Show'} order summary ▾
          </button>
          <div style={{ display: summaryOpen ? 'block' : 'none' }} className="summary-content">

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4A5568', fontWeight: 'bold' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.length === 0 ? (
              <p style={{ color: '#718096' }}>Your cart is empty.</p>
            ) : (
              <>
                {Object.entries(itemsByBrand).map(([brand, brandItems]) => (
                  <div key={brand} style={{ marginBottom: '0.75rem' }}>
                     <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{brand}</p>
                     <AnimatePresence initial={false}>
                       {brandItems.map((item) => {
                         const isUpdated = recentlyUpdatedIds.includes(item.product.id);
                         const isOos = outOfStockIds.includes(item.product.id);
                         return (
                           <motion.div
                             initial={{ opacity: 0, y: 8 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -8 }}
                             transition={{ duration: 0.25, ease: 'easeInOut' }}
                             key={item.product.id}
                             className={clsx({ 'recently-updated': isUpdated, 'out-of-stock': isOos })}
                             style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', position:'relative' }}
                           >
                             <div
                               style={{
                                 display: 'flex',
                                 gap: '2rem',
                                 alignItems: 'flex-start',
                                 flexWrap: 'wrap',
                               }}
                             >
                               {item.product.image && (
                                 <Image src={item.product.image} alt={item.product.title} width={40} height={40} style={{ borderRadius: '4px' }} />
                               )}
                             </div>
                             <p style={{ color: '#4A5568' }}>{item.quantity} × {item.product.title}</p>
                             {isOos && <span className="out-of-stock-badge">OOS</span>}
                             <p style={{ fontWeight: '500', color: '#2D3748' }}>${(item.product.price * item.quantity).toFixed(2)}</p>
                           </motion.div>
                         );
                       })}
                     </AnimatePresence>
                  </div>
                ))}
                <hr style={{ margin: '0.75rem 0', borderTop: '1px solid #E2E8F0' }} />
                <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Tax calculated at payment.</p>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <p style={{ fontSize: '1.125rem', color: '#2D3748' }}>Total</p>
              <p style={{ fontSize: '1.125rem', color: '#2D3748' }}>${cartTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
        </motion.div>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}
            > 
          {initError && (
            <div style={{background:'#FED7D7',borderLeft:'4px solid #F56565',padding:'1rem',marginBottom:'1rem',borderRadius:'0.375rem'}}>
              <p style={{fontWeight:600,color:'#C53030',marginBottom:'0.25rem'}}>Checkout unavailable</p>
              <p style={{color:'#C53030'}}>{initError}</p>
            </div>
          )}
          {USE_FAKE_PAYMENT ? (
            <FakePaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              orderId={orderId}
            />
          ) : !USE_FAKE_PAYMENT && clientSecret ? (
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
          ) : null}
          {!USE_FAKE_PAYMENT && !clientSecret && !initError && (
            <div style={{padding:'2rem',textAlign:'center'}}>
              <div style={{width:'2.5rem',height:'2.5rem',border:'4px solid #38B2AC',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default StripeCheckoutPage;
