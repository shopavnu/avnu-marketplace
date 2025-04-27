import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useSession } from './useSession';

// Define user preference profile type
export interface UserPreferenceProfile {
  id: string;
  userId: string;
  lastUpdated: string;
  totalPageViews: number;
  totalProductViews: number;
  averageScrollDepth: number;
  averageProductViewTimeSeconds: number;
  averageSessionDurationMinutes: number;
  productEngagementCount: number;
  topViewedCategories: string[];
  topViewedBrands: string[];
  recentlyViewedProducts: string[];
  categoryPreferences: Record<string, number>;
  brandPreferences: Record<string, number>;
  productPreferences: Record<string, number>;
  viewTimeByCategory: Record<string, number>;
  viewTimeByBrand: Record<string, number>;
  scrollDepthByPageType: Record<string, number>;
  priceRangePreferences: Record<string, number>;
  hasEnoughData: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for accessing and managing user preference profiles
 */
export const useUserPreferences = () => {
  const { isAuthenticated, user } = useAuth();
  const { sessionId } = useSession();
  const [userPreferences, setUserPreferences] = useState<UserPreferenceProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user preferences
  const fetchUserPreferences = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserPreferences(null);
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/user-preference-profile');
      setUserPreferences(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch user preferences');
      console.error('Failed to fetch user preferences:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  
  // Update user preferences from current session
  const updateFromCurrentSession = useCallback(async () => {
    if (!isAuthenticated || !user || !sessionId) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/user-preference-profile/update-from-session/${sessionId}`);
      setUserPreferences(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to update user preferences');
      console.error('Failed to update user preferences:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, sessionId]);
  
  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async (limit?: number) => {
    if (!isAuthenticated || !user) {
      return [];
    }
    
    try {
      const response = await axios.get('/api/user-preference-profile/recommendations', {
        params: { limit }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to get personalized recommendations:', err);
      return [];
    }
  }, [isAuthenticated, user]);
  
  // Load user preferences on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPreferences();
    } else {
      setUserPreferences(null);
    }
  }, [isAuthenticated, user, fetchUserPreferences]);
  
  return {
    userPreferences,
    loading,
    error,
    fetchUserPreferences,
    updateFromCurrentSession,
    getPersonalizedRecommendations
  };
};
