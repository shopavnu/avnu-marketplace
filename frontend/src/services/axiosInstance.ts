import axios from 'axios';

// Determine the base URL based on the environment
// Default to localhost for development
// Support new preferred NEXT_PUBLIC_API_BASE_URL variable while
// falling back to legacy NEXT_PUBLIC_API_URL for backward compatibility
// Backend origin (scheme://host:port). Default to localhost dev server.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// All REST endpoints are served under /api in NestJS.
const API_BASE_URL = `${API_ORIGIN}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment if you use cookies for authentication
});

// Attach Clerk JWT (browser) on every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Only run in the browser -- for SSR you'll fetch the token per-request via getAuth()
      if (typeof window !== 'undefined' && (window as any).Clerk) {
        const token: string | null | undefined = await (window as any).Clerk?.session?.getToken({
          template: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || 'backend',
        });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      // Don't block the request if token retrieval fails
      console.warn('Unable to attach Clerk JWT', err);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Optional: Add a response interceptor for global error handling or token refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // Potentially redirect to login or refresh token
      console.error('Unauthorized, redirecting to login...');
      // window.location.href = '/login'; // Or use your router's navigation method
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
