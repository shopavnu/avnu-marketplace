import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface InitiateCheckoutResponse {
  orderId: string;
  clientSecret: string;
  paymentIntentId: string;
}

export const initiateCheckout = async (orderId?: string): Promise<InitiateCheckoutResponse> => {
  // If mock mode enabled, immediately return fake data
  if (process.env.NEXT_PUBLIC_USE_MOCK_CHECKOUT === 'true') {
    const id1 = uuidv4().replace(/-/g, '').slice(0, 24);
    const id2 = uuidv4().replace(/-/g, '').slice(0, 24);
    return {
      orderId: uuidv4(),
      clientSecret: `pi_${id1}_secret_${id2}`,
      paymentIntentId: `pi_${id1}`,
    };
  }
  try {
    const response = await axiosInstance.post<InitiateCheckoutResponse>('/checkout/initiate', { orderId });
    return response.data;
  } catch (error: unknown) {
    // Handle error appropriately, e.g., log it, transform it, or re-throw a custom error
    console.error('Error initiating checkout:', error);
    // It's good practice to throw a more specific error or return a structured error response
    if (process.env.NODE_ENV !== 'production') {
      // Fallback mock data for local development so frontend can proceed
      console.warn('Using mock checkout data because API call failed');
      const id1 = uuidv4().replace(/-/g, '').slice(0, 24);
        const id2 = uuidv4().replace(/-/g, '').slice(0, 24);
        return {
          orderId: uuidv4(),
          clientSecret: `pi_${id1}_secret_${id2}`,
          paymentIntentId: `pi_${id1}`,
        };
    }

    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || 'Failed to initiate checkout');
    }
    throw new Error('An unexpected error occurred while initiating checkout.');
  }
};
