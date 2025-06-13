import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export interface InitiateCheckoutResponse {
  orderId: string;
  clientSecret: string;
  paymentIntentId: string;
}

export const initiateCheckout = async (orderId?: string): Promise<InitiateCheckoutResponse> => {
  try {
    const response = await axiosInstance.post<InitiateCheckoutResponse>('/checkout/initiate', { orderId });
    return response.data;
  } catch (error: unknown) {
    // Handle error appropriately, e.g., log it, transform it, or re-throw a custom error
    console.error('Error initiating checkout:', error);
    // It's good practice to throw a more specific error or return a structured error response
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to initiate checkout');
    }
    throw new Error('An unexpected error occurred while initiating checkout.');
  }
};
