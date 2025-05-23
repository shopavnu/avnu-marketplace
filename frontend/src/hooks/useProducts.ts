import { useState, useEffect } from 'react';
import { productsApi } from '@/services/api';
import { Product } from '@/types/products';

interface UseProductsOptions {
  initialSkip?: number;
  initialTake?: number;
  initialData?: Product[];
}

export function useProducts({
  initialSkip = 0,
  initialTake = 12,
  initialData = []
}: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(initialSkip);
  const [take] = useState<number>(initialTake);

  const fetchProducts = async (skipParam = skip, takeParam = take) => {
    if (!hasMore && skipParam > 0) return;
    
    setLoading(true);
    try {
      const data = await productsApi.getAll({ skip: skipParam, take: takeParam });
      
      if (skipParam === 0) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === takeParam);
      setSkip(skipParam + data.length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      // If API fails, we could fall back to mock data here
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setSkip(0);
    setHasMore(true);
    fetchProducts(0);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    fetchMore: () => fetchProducts(),
    refresh
  };
}

export default useProducts;
