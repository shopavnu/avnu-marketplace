import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

// Define Merchant User interface to include merchantId
interface MerchantUser {
  id: string;
  merchantId: string;
  email: string;
  name?: string;
  role: string;
}

export interface PlatformConnection {
  id: string;
  merchantId: string;
  platformType: 'shopify' | 'native'; // Removed WooCommerce as part of the Shopify-first approach
  platformStoreUrl: string;
  platformStoreName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsePlatformConnectionsReturn {
  connections: PlatformConnection[];
  loading: boolean;
  error: string | null;
  fetchConnections: () => Promise<void>;
  connectToShopify: (shopDomain: string) => Promise<string>;
  disconnectPlatform: (connectionId: string) => Promise<boolean>;
  syncPlatform: (connectionId: string) => Promise<void>;
}

export const usePlatformConnections = (): UsePlatformConnectionsReturn => {
  // Cast the user to MerchantUser type to access merchantId
  const { user } = useAuth() as { user: MerchantUser | null };
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define fetchConnections first before using it in useEffect
  const fetchConnections = useCallback(async () => {
    if (!user?.merchantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PlatformConnection[]>(
        `/api/integrations/auth/connections/${user.merchantId}`
      );
      setConnections(response.data);
    } catch (err) {
      console.error('Error fetching platform connections:', err);
      setError('Failed to load platform connections');
    } finally {
      setLoading(false);
    }
  }, [user?.merchantId]);
  
  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const errorParam = urlParams.get('error');
    const platform = urlParams.get('platform');
    
    if (success === 'true' && platform) {
      setError(null);
      // Refresh connections list when returning from successful OAuth flow
      fetchConnections();
    } else if (success === 'false' && errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    // Clear URL parameters after handling them
    if (success || errorParam) {
      // Remove query parameters from URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [fetchConnections]);

  useEffect(() => {
    if (user?.merchantId) {
      fetchConnections();
    }
  }, [user?.merchantId, fetchConnections]);

  const connectToShopify = async (shopDomain: string): Promise<string> => {
    if (!user?.merchantId) {
      throw new Error('User must be a merchant to connect to Shopify');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<{ url: string }>(
        '/api/integrations/auth/shopify/authorize',
        {
          params: {
            merchantId: user.merchantId,
            shopDomain: shopDomain
          }
        }
      );
      
      return response.data.url;
    } catch (err) {
      console.error('Error connecting to Shopify:', err);
      setError('Failed to connect to Shopify');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // WooCommerce integration has been removed as part of our Shopify-first approach

  const disconnectPlatform = async (connectionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<{ success: boolean }>(
        `/api/integrations/auth/disconnect/${connectionId}`
      );
      
      // Refresh connections list
      await fetchConnections();
      
      return response.data.success;
    } catch (err) {
      console.error('Error disconnecting platform:', err);
      setError('Failed to disconnect platform');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncPlatform = async (connectionId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // This endpoint will be implemented later when we build the sync functionality
      await axios.post(`/api/integrations/sync/${connectionId}`);
      
      // Refresh connections list
      await fetchConnections();
    } catch (err) {
      console.error('Error syncing platform:', err);
      setError('Failed to sync platform');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    connections,
    loading,
    error,
    fetchConnections,
    connectToShopify,
    disconnectPlatform,
    syncPlatform
  };
};
