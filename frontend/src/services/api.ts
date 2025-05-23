import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: async (params?: { skip?: number; take?: number }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  search: async (query: string) => {
    try {
      const response = await api.get(`/products/search/${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching products for "${query}":`, error);
      throw error;
    }
  }
};

// Brands API
export const brandsApi = {
  getAll: async (params?: { skip?: number; take?: number }) => {
    try {
      const response = await api.get('/brands', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching brand ${id}:`, error);
      throw error;
    }
  },
  
  getProducts: async (id: string) => {
    try {
      const response = await api.get(`/brands/${id}/products`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for brand ${id}:`, error);
      throw error;
    }
  }
};

export default api;
