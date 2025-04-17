import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types/products';
import { brands as allBrands } from '@/data/brands';

// Define complete types to avoid undefined errors
interface ShippingInfo {
  isFree: boolean;
  minimumForFree?: number;
  baseRate?: number;
}

interface ProductRating {
  avnuRating?: { average: number; count: number };
  shopifyRating?: { average: number; count: number };
}

interface Vendor {
  id: string;
  name: string;
  causes: string[];
  isLocal: boolean;
  shippingInfo: ShippingInfo;
}

interface ProductComplete {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  brand: string;
  category: string;
  subCategory: string;
  attributes: Record<string, string>;
  isNew: boolean;
  rating: ProductRating;
  vendor: Vendor;
  inStock: boolean;
  tags: string[];
  createdAt: string;
}

// Mock cart data type definitions
interface CartItem {
  product: ProductComplete;
  quantity: number;
}

// Helper function to get brand ID from name (similar to product page)
const getBrandIdFromName = (brandName: string): string => {
  const brand = allBrands.find(b => b.name === brandName);
  if (brand) return brand.id;
  
  if (brandName.startsWith('Brand ') && allBrands.length > 0) {
    const brandNumber = parseInt(brandName.replace('Brand ', '')) || 1;
    const index = (brandNumber - 1) % allBrands.length;
    return allBrands[index].id;
  }
  
  return brandName.toLowerCase().replace(/\\s+/g, '-');
};

// Checkout steps
enum CheckoutStep {
  INFORMATION = 'information',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review'
}

const CheckoutPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.INFORMATION);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Contact information
    email: '',
    phone: '',
    
    // Shipping information
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Shipping method
    shippingMethod: 'standard',
    
    // Payment information
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    
    // Billing same as shipping
    billingAddressSame: true
  });

  // Mock cart data - in a real app, this would come from a cart context or state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: {
        id: 'product-1',
        title: 'Ceramic Vase',
        description: 'Handcrafted ceramic vase with natural glazes',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800',
        images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800'],
        brand: 'Terra & Clay',
        category: 'Home',
        subCategory: 'Decor',
        attributes: { color: 'Blue', material: 'Ceramic' },
        isNew: true,
        rating: {
          avnuRating: { average: 4.8, count: 24 },
          shopifyRating: { average: 4.7, count: 15 }
        },
        vendor: {
          id: 'vendor-1',
          name: 'Terra & Clay',
          causes: ['sustainable', 'handmade'],
          isLocal: true,
          shippingInfo: {
            isFree: false,
            minimumForFree: 75,
            baseRate: 5.99
          }
        },
        inStock: true,
        tags: ['featured'],
        createdAt: new Date().toISOString()
      },
      quantity: 1
    },
    {
      product: {
        id: 'product-2',
        title: 'Organic Cotton Throw',
        description: 'Soft, organic cotton throw with hand-woven details',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800',
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800'],
        brand: 'Pure Living',
        category: 'Home',
        subCategory: 'Textiles',
        attributes: { color: 'Natural', material: 'Cotton' },
        isNew: false,
        rating: {
          avnuRating: { average: 4.5, count: 18 }
        },
        vendor: {
          id: 'vendor-2',
          name: 'Pure Living',
          causes: ['organic', 'sustainable'],
          isLocal: false,
          shippingInfo: {
            isFree: false,
            minimumForFree: 50,
            baseRate: 4.99
          }
        },
        inStock: true,
        tags: ['bestseller'],
        createdAt: new Date().toISOString()
      },
      quantity: 2
    }
  ]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 8.99; // Standard shipping cost
  const estimatedTax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + estimatedTax;

  // Group items by brand
  const itemsByBrand = cartItems.reduce((groups, item) => {
    const brandName = item.product.brand;
    if (!groups[brandName]) {
      groups[brandName] = [];
    }
    groups[brandName].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Navigation between steps
  const goToNextStep = () => {
    switch (currentStep) {
      case CheckoutStep.INFORMATION:
        setCurrentStep(CheckoutStep.SHIPPING);
        break;
      case CheckoutStep.SHIPPING:
        setCurrentStep(CheckoutStep.PAYMENT);
        break;
      case CheckoutStep.PAYMENT:
        setCurrentStep(CheckoutStep.REVIEW);
        break;
      case CheckoutStep.REVIEW:
        handlePlaceOrder();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case CheckoutStep.SHIPPING:
        setCurrentStep(CheckoutStep.INFORMATION);
        break;
      case CheckoutStep.PAYMENT:
        setCurrentStep(CheckoutStep.SHIPPING);
        break;
      case CheckoutStep.REVIEW:
        setCurrentStep(CheckoutStep.PAYMENT);
        break;
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to order confirmation
      router.push('/order-confirmation');
    }, 2000);
  };

  // Form validation
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case CheckoutStep.INFORMATION:
        return !!formData.email && !!formData.firstName && !!formData.lastName && 
               !!formData.address1 && !!formData.city && !!formData.state && !!formData.zipCode;
      case CheckoutStep.SHIPPING:
        return !!formData.shippingMethod;
      case CheckoutStep.PAYMENT:
        return !!formData.cardNumber && !!formData.cardName && !!formData.expiryDate && !!formData.cvv;
      default:
        return true;
    }
  };

  // Render checkout steps
  const renderCheckoutStep = () => {
    switch (currentStep) {
      case CheckoutStep.INFORMATION:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-charcoal mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-charcoal mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case CheckoutStep.SHIPPING:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-charcoal mb-4">Shipping Method</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-md border-gray-200 hover:border-sage cursor-pointer">
                <input
                  type="radio"
                  id="standard"
                  name="shippingMethod"
                  value="standard"
                  checked={formData.shippingMethod === 'standard'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sage focus:ring-sage border-gray-300"
                />
                <label htmlFor="standard" className="ml-3 flex flex-1 justify-between">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Standard Shipping</span>
                    <span className="block text-sm text-gray-500">3-5 business days</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">$8.99</span>
                </label>
              </div>
              
              <div className="flex items-center p-4 border rounded-md border-gray-200 hover:border-sage cursor-pointer">
                <input
                  type="radio"
                  id="express"
                  name="shippingMethod"
                  value="express"
                  checked={formData.shippingMethod === 'express'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sage focus:ring-sage border-gray-300"
                />
                <label htmlFor="express" className="ml-3 flex flex-1 justify-between">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Express Shipping</span>
                    <span className="block text-sm text-gray-500">1-2 business days</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">$14.99</span>
                </label>
              </div>
              
              <div className="flex items-center p-4 border rounded-md border-gray-200 hover:border-sage cursor-pointer">
                <input
                  type="radio"
                  id="overnight"
                  name="shippingMethod"
                  value="overnight"
                  checked={formData.shippingMethod === 'overnight'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sage focus:ring-sage border-gray-300"
                />
                <label htmlFor="overnight" className="ml-3 flex flex-1 justify-between">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Overnight Shipping</span>
                    <span className="block text-sm text-gray-500">Next business day</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">$24.99</span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case CheckoutStep.PAYMENT:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-charcoal mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="•••• •••• •••• ••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  required
                />
              </div>
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="•••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="billingAddressSame"
                  name="billingAddressSame"
                  checked={formData.billingAddressSame}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                />
                <label htmlFor="billingAddressSame" className="ml-2 block text-sm text-gray-700">
                  Billing address same as shipping address
                </label>
              </div>
            </div>
          </div>
        );
      
      case CheckoutStep.REVIEW:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-charcoal mb-4">Order Review</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-charcoal mb-2">Contact Information</h4>
                <p className="text-sm text-gray-600">{formData.email}</p>
                {formData.phone && <p className="text-sm text-gray-600">{formData.phone}</p>}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-charcoal mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-gray-600">{formData.address1}</p>
                {formData.address2 && <p className="text-sm text-gray-600">{formData.address2}</p>}
                <p className="text-sm text-gray-600">{formData.city}, {formData.state} {formData.zipCode}</p>
                <p className="text-sm text-gray-600">{formData.country}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-charcoal mb-2">Shipping Method</h4>
                <p className="text-sm text-gray-600">
                  {formData.shippingMethod === 'standard' && 'Standard Shipping (3-5 business days)'}
                  {formData.shippingMethod === 'express' && 'Express Shipping (1-2 business days)'}
                  {formData.shippingMethod === 'overnight' && 'Overnight Shipping (Next business day)'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-charcoal mb-2">Payment Information</h4>
                <p className="text-sm text-gray-600">Card ending in {formData.cardNumber.slice(-4)}</p>
                <p className="text-sm text-gray-600">{formData.cardName}</p>
                <p className="text-sm text-gray-600">Expires: {formData.expiryDate}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Render the main checkout layout
  return (
    <div className="bg-warm-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sage hover:text-charcoal mb-6">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Shopping
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main checkout form */}
          <div className="lg:w-2/3">
            {/* Checkout steps */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between mb-6">
                {Object.values(CheckoutStep).map((step, index) => (
                  <div 
                    key={step}
                    className={`flex items-center ${index > 0 ? 'ml-4' : ''}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? 'bg-sage text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm hidden md:inline">
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                    {index < Object.values(CheckoutStep).length - 1 && (
                      <div className="w-8 h-0.5 bg-gray-200 ml-2"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Current step form */}
              {renderCheckoutStep()}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {currentStep !== CheckoutStep.INFORMATION ? (
                  <button
                    onClick={goToPreviousStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div> // Empty div for spacing
                )}
                
                <button
                  onClick={goToNextStep}
                  disabled={!validateCurrentStep() || isProcessing}
                  className={`px-6 py-2 rounded-md text-white font-medium ${validateCurrentStep() && !isProcessing ? 'bg-sage hover:bg-sage/90' : 'bg-gray-400 cursor-not-allowed'} transition-colors`}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : currentStep === CheckoutStep.REVIEW ? (
                    'Place Order'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-charcoal mb-4">Order Summary</h2>
              
              {/* Order items grouped by brand with shipping progress bars */}
              <div className="max-h-80 overflow-y-auto mb-4">
                {Object.entries(itemsByBrand).map(([brandName, items], brandIndex) => {
                  // Calculate brand total for shipping progress
                  const brandTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                  const shippingThreshold = items[0].product.vendor.shippingInfo.minimumForFree || 0;
                  const progress = Math.min((brandTotal / shippingThreshold) * 100, 100);
                  const amountNeeded = Math.max(0, shippingThreshold - brandTotal);
                  
                  return (
                    <div key={brandName} className={`${brandIndex > 0 ? 'pt-4 mt-4 border-t border-gray-100' : ''}`}>
                      {/* Brand Header */}
                      <div className="flex items-center justify-between mb-2">
                        <Link 
                          href={`/brand/${getBrandIdFromName(brandName)}`}
                          className="text-sage hover:underline text-sm font-medium"
                        >
                          {brandName}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      
                      {/* Brand Items */}
                      {items.map(item => (
                        <div key={item.product.id} className="flex py-3 border-b border-gray-100 last:border-b-0">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                            <Image
                              src={item.product.image}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-sm font-medium text-charcoal">{item.product.title}</h4>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                              <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Free Shipping Progress Bar */}
                      {shippingThreshold > 0 && (
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg mt-2 mb-3 border border-teal-100">
                          <p className="text-xs text-gray-700 font-medium mb-1">
                            {amountNeeded > 0
                              ? <>Spend <span className="font-semibold text-teal-700">${amountNeeded.toFixed(2)}</span> more for FREE shipping from {brandName}!</>
                              : <span className="font-semibold text-green-600">You've earned free shipping from {brandName}! 🎉</span>
                            }
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 text-right mt-1">${brandTotal.toFixed(2)} / ${shippingThreshold.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Totals */}
              <div className="space-y-2 py-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span className="font-medium">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
