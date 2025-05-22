import { useState, useEffect } from 'react';

interface AnalyticsResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch analytics data
 * @param endpoint API endpoint to fetch data from
 * @returns Object containing data, loading state, and error if any
 */
export function useAnalyticsData<T>(endpoint: string): AnalyticsResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // For development purposes, we'll simulate loading with mock data
        // In production, this would be a real API call
        const mockResponse = await new Promise<T>((resolve) => {
          setTimeout(() => {
            // Generate mock data based on the endpoint
            // This is a simplified example - customize based on actual needs
            if (endpoint.includes('performance')) {
              const mockPerformanceData = {
                pageLoadTime: {
                  average: 2.3,
                  byPage: [
                    { pagePath: '/home', loadTime: 1.8 },
                    { pagePath: '/shop', loadTime: 2.5 },
                    { pagePath: '/product/1', loadTime: 3.2 },
                  ],
                },
                firstContentfulPaint: {
                  average: 1.5,
                  byPage: [
                    { pagePath: '/home', fcp: 1.2 },
                    { pagePath: '/shop', fcp: 1.7 },
                    { pagePath: '/product/1', fcp: 2.1 },
                  ],
                },
                largestContentfulPaint: {
                  average: 2.1,
                  byPage: [
                    { pagePath: '/home', lcp: 1.8 },
                    { pagePath: '/shop', lcp: 2.3 },
                    { pagePath: '/product/1', lcp: 2.8 },
                  ],
                },
                firstInputDelay: {
                  average: 45,
                  byPage: [
                    { pagePath: '/home', fid: 35 },
                    { pagePath: '/shop', fid: 50 },
                    { pagePath: '/product/1', fid: 65 },
                  ],
                },
                cumulativeLayoutShift: {
                  average: 0.15,
                  byPage: [
                    { pagePath: '/home', cls: 0.1 },
                    { pagePath: '/shop', cls: 0.2 },
                    { pagePath: '/product/1', cls: 0.18 },
                  ],
                },
                timeToInteractive: {
                  average: 3.2,
                  byPage: [
                    { pagePath: '/home', tti: 2.5 },
                    { pagePath: '/shop', tti: 3.5 },
                    { pagePath: '/product/1', tti: 4.1 },
                  ],
                },
              };
              resolve(mockPerformanceData as unknown as T);
            } else {
              // Default mock data for other endpoints
              resolve({} as T);
            }
          }, 1000);
        });
        
        setData(mockResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
