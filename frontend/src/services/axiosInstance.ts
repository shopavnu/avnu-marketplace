import axios from 'axios';

// Determine the base URL based on the environment
// Default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment if you use cookies for authentication
});

// Optional: Add a request interceptor to include the JWT token
// This assumes you store your token in localStorage or a state management solution
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: Retrieve token from localStorage
    const token = localStorage.getItem('authToken'); // Adjust 'authToken' to your token's storage key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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
