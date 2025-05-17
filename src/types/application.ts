export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface MerchantApplication {
  id: string;
  shopName: string;
  shopDomain: string;
  ownerName: string;
  email: string;
  submissionDate: string;
  status: ApplicationStatus;
  feedback?: string;
  
  // Brand information
  brandInfo: {
    name: string;
    description: string;
    location: string;
    categories: string[];
    causes?: string[];
    logoUrl?: string;
  };
  
  // Shipping information
  shippingInfo: {
    offersFreeShipping: boolean;
    freeShippingThreshold?: number;
    flatRateShipping?: number;
    shippingRestrictions?: string;
  };
  
  // Returns policy
  returnsPolicy: {
    acceptsReturns: boolean;
    returnWindow?: number;
    returnShippingPaidBy?: 'merchant' | 'customer';
    returnsNotes?: string;
  };
  
  // Products
  products: Array<{
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    inventory: number;
  }>;
}
