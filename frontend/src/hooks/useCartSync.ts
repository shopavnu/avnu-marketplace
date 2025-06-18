import { useEffect } from 'react';
import useCartStore from '@/stores/useCartStore';
import { CartItem } from '@/types/cart';

/**
 * Syncs Zustand cart state across browser tabs using the `storage` event.
 *
 * Rationale: Checkout page (or any view) should instantly reflect cart changes
 * that happen in another tab / window. Persist middleware already stores the
 * cart in localStorage under the key `avnu-cart-storage`. We listen for that
 * key changing and patch the local state.
 */
const STORAGE_KEY = 'avnu-cart-storage';

function parseItemsFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.state?.items ?? [];
  } catch {
    return [];
  }
}

export default function useCartSync() {
  const setItems = useCartStore((s) => s.items);
  const replaceItems = useCartStore.setState;

  // On mount, ensure state matches latest localStorage (covers hard refresh)
  useEffect(() => {
    const latestItems = parseItemsFromStorage();
    replaceItems((prev) => ({ ...prev, items: latestItems }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to storage events from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === e.oldValue) return;
      const latestItems = parseItemsFromStorage();
      replaceItems((prev) => ({ ...prev, items: latestItems }));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When items change in this tab, write to storage (persist already does it),
  // but we also emit a custom event for same-tab listeners if needed.
  useEffect(() => {
    // Nothing needed; persist middleware handles write.
  }, [setItems]);
}
