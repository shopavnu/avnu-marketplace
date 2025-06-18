import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import useCartStore from '@/stores/useCartStore';


interface CartUpdatedPayload {
  userId?: string;
  items: any[]; // Use more specific type if backend contracts are defined
}

interface PriceStockChangedPayload {
  items: Array<{
    productId: string;
    price?: number;
    inStock?: boolean;
  }>;
}

// Utility to get API base URL (defaults to current origin)
function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
}

export default function useCartSocket(userId?: string) {
  const toast = (opts: any) => {
    if (typeof window !== 'undefined') {
      // optionally integrate with any UI toast library when available
      console.log(`${opts.title}: ${opts.description ?? ''}`);
    }
  };

  useEffect(() => {
    // Allow overriding cart namespace via env; default to root namespace to avoid "Invalid namespace" if backend not configured
    const namespace = process.env.NEXT_PUBLIC_CART_SOCKET_NAMESPACE || '';
    const socket: Socket = io(`${getApiBaseUrl()}${namespace}`, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect_error', err => {
      console.error('Cart socket connect error', err);
    });

    const { setCartFromServer, items: current } = useCartStore.getState();

    socket.on('cartUpdated', (payload: CartUpdatedPayload) => {
      if (userId && payload.userId && payload.userId !== userId) return;
      const updatedIds = payload.items.map((it:any)=>it.product?.id ?? it.productId);
      setCartFromServer(payload.items as any, updatedIds, []);
    });

    socket.on('priceStockChanged', (payload: PriceStockChangedPayload) => {
      const outIds:string[] = [];
      const priceChangeIds:string[] = [];
      payload.items.forEach(change => {
        // Notify user on each relevant change
        if (change.inStock === false) {
          toast({
            title: 'Item out of stock',
            description: 'Some items in your cart became unavailable.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (change.price !== undefined) {
          toast({
            title: 'Price updated',
            description: 'A price in your cart has changed. Total updated.',
            status: 'info',
            duration: 4000,
            isClosable: true,
          });
        }

        // Collect IDs for highlighting / disabling
        if (change.inStock === false) {
          outIds.push(change.productId);
        }
        if (change.price !== undefined) {
          priceChangeIds.push(change.productId);
        }
      });

      // after iterating over changes
      if (outIds.length || priceChangeIds.length) {
        const { setCartFromServer, items } = useCartStore.getState();
        setCartFromServer(items, priceChangeIds, outIds);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
