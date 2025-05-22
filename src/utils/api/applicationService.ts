import { MerchantApplication, ApplicationStatus } from '../../types/application';

// Mock data for development - in a real app, this would be fetched from an API
const MOCK_APPLICATIONS: MerchantApplication[] = [
  {
    id: '1',
    shopName: 'Eco Essentials',
    shopDomain: 'eco-essentials.myshopify.com',
    ownerName: 'Jane Smith',
    email: 'jane@ecoessentials.com',
    submissionDate: '2025-05-10T15:30:00Z',
    status: 'pending',
    brandInfo: {
      name: 'Eco Essentials',
      description: 'Sustainable products for everyday living that reduce environmental impact.',
      location: 'Portland, OR',
      categories: ['Home Goods', 'Personal Care'],
      causes: ['Sustainability', 'Zero Waste']
    },
    shippingInfo: {
      offersFreeShipping: true,
      freeShippingThreshold: 75,
      flatRateShipping: 5.99
    },
    returnsPolicy: {
      acceptsReturns: true,
      returnWindow: 30,
      returnShippingPaidBy: 'merchant',
      returnsNotes: 'Items must be in original packaging.'
    },
    products: [
      {
        id: 'p1',
        title: 'Bamboo Toothbrush Set',
        price: 12.99,
        imageUrl: '/images/products/bamboo-toothbrush.jpg',
        inventory: 150
      },
      {
        id: 'p2',
        title: 'Reusable Produce Bags',
        price: 15.99,
        imageUrl: '/images/products/produce-bags.jpg',
        inventory: 85
      },
      {
        id: 'p3',
        title: 'Stainless Steel Water Bottle',
        price: 24.99,
        imageUrl: '/images/products/water-bottle.jpg',
        inventory: 110
      }
    ]
  },
  {
    id: '2',
    shopName: 'Conscious Clothing',
    shopDomain: 'conscious-clothing.myshopify.com',
    ownerName: 'Mark Johnson',
    email: 'mark@consciousclothing.com',
    submissionDate: '2025-05-08T09:15:00Z',
    status: 'pending',
    brandInfo: {
      name: 'Conscious Clothing',
      description: 'Ethically made apparel using organic and recycled materials.',
      location: 'Seattle, WA',
      categories: ['Apparel', 'Accessories'],
      causes: ['Fair Trade', 'Ethical Manufacturing']
    },
    shippingInfo: {
      offersFreeShipping: true,
      freeShippingThreshold: 100,
      flatRateShipping: 7.99
    },
    returnsPolicy: {
      acceptsReturns: true,
      returnWindow: 45,
      returnShippingPaidBy: 'merchant'
    },
    products: [
      {
        id: 'p4',
        title: 'Organic Cotton T-Shirt',
        price: 29.99,
        imageUrl: '/images/products/organic-tshirt.jpg',
        inventory: 200
      },
      {
        id: 'p5',
        title: 'Recycled Polyester Jacket',
        price: 89.99,
        imageUrl: '/images/products/recycled-jacket.jpg',
        inventory: 50
      }
    ]
  },
  {
    id: '3',
    shopName: 'Mindful Beauty',
    shopDomain: 'mindful-beauty.myshopify.com',
    ownerName: 'Sarah Williams',
    email: 'sarah@mindfulbeauty.com',
    submissionDate: '2025-05-05T14:20:00Z',
    status: 'approved',
    brandInfo: {
      name: 'Mindful Beauty',
      description: 'Clean, vegan beauty products free from harmful chemicals.',
      location: 'Los Angeles, CA',
      categories: ['Beauty', 'Personal Care'],
      causes: ['Cruelty-Free', 'Clean Beauty']
    },
    shippingInfo: {
      offersFreeShipping: true,
      freeShippingThreshold: 50,
      flatRateShipping: 4.99
    },
    returnsPolicy: {
      acceptsReturns: true,
      returnWindow: 14,
      returnShippingPaidBy: 'customer'
    },
    products: [
      {
        id: 'p6',
        title: 'Natural Face Serum',
        price: 34.99,
        imageUrl: '/images/products/face-serum.jpg',
        inventory: 75
      },
      {
        id: 'p7',
        title: 'Vegan Lipstick Set',
        price: 28.99,
        imageUrl: '/images/products/lipstick-set.jpg',
        inventory: 120
      }
    ]
  },
  {
    id: '4',
    shopName: 'Urban Gardens',
    shopDomain: 'urban-gardens.myshopify.com',
    ownerName: 'David Chen',
    email: 'david@urbangardens.com',
    submissionDate: '2025-05-03T11:45:00Z',
    status: 'rejected',
    feedback: 'Products do not meet our sustainability criteria. Please revise your product descriptions to include material sourcing information.',
    brandInfo: {
      name: 'Urban Gardens',
      description: 'Indoor gardening supplies for urban dwellers.',
      location: 'Chicago, IL',
      categories: ['Home & Garden', 'Plants']
    },
    shippingInfo: {
      offersFreeShipping: false,
      flatRateShipping: 9.99
    },
    returnsPolicy: {
      acceptsReturns: false
    },
    products: [
      {
        id: 'p8',
        title: 'Ceramic Plant Pot Set',
        price: 39.99,
        imageUrl: '/images/products/ceramic-pots.jpg',
        inventory: 60
      },
      {
        id: 'p9',
        title: 'Vertical Garden Kit',
        price: 119.99,
        imageUrl: '/images/products/garden-kit.jpg',
        inventory: 25
      }
    ]
  }
];

// Common rejection reasons for dropdown
export const REJECTION_REASONS = [
  'Products do not meet our quality standards',
  'Products do not meet our sustainability criteria',
  'Insufficient product information provided',
  'Brand values not aligned with Avnu Marketplace',
  'Incomplete application information',
  'Unable to verify business legitimacy',
  'Prohibited products or categories',
  'Other (please specify)'
];

// Application service for API calls
export const applicationService = {
  // Get all merchant applications
  async getApplications(filters?: { status?: ApplicationStatus }): Promise<MerchantApplication[]> {
    // In a real app, this would be an API call
    // Example: return await fetch('/api/admin/applications').then(res => res.json());
    
    // For development, use mock data with optional filtering
    let applications = [...MOCK_APPLICATIONS];
    
    if (filters?.status) {
      applications = applications.filter(app => app.status === filters.status);
    }
    
    return Promise.resolve(applications);
  },
  
  // Get a single application by ID
  async getApplicationById(id: string): Promise<MerchantApplication | null> {
    // In a real app, this would be an API call
    // Example: return await fetch(`/api/admin/applications/${id}`).then(res => res.json());
    
    // For development, use mock data
    const application = MOCK_APPLICATIONS.find(app => app.id === id);
    return Promise.resolve(application || null);
  },
  
  // Update application status (approve or reject)
  async updateApplicationStatus(
    id: string, 
    status: ApplicationStatus, 
    feedback?: string
  ): Promise<MerchantApplication> {
    // In a real app, this would be an API call
    // Example: return await fetch(`/api/admin/applications/${id}/status`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status, feedback })
    // }).then(res => res.json());
    
    // For development, update mock data
    const index = MOCK_APPLICATIONS.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error('Application not found');
    }
    
    // Update the application
    const updatedApplication = {
      ...MOCK_APPLICATIONS[index],
      status,
      feedback: status === 'rejected' ? feedback : undefined
    };
    
    // In a real app, we would persist this change to the database
    // For now, just update our mock array
    MOCK_APPLICATIONS[index] = updatedApplication;
    
    // In a real app, this would also trigger an email notification
    console.log(`Email would be sent to ${updatedApplication.email} about ${status} status`);
    
    return Promise.resolve(updatedApplication);
  },
  
  // Send email notification (mock implementation)
  async sendStatusNotification(application: MerchantApplication): Promise<boolean> {
    // In a real app, this would call an email service API
    // This is just a mock implementation
    console.log(`Notification email sent to ${application.email}`);
    console.log(`Status: ${application.status}`);
    if (application.feedback) {
      console.log(`Feedback: ${application.feedback}`);
    }
    
    return Promise.resolve(true);
  }
};
