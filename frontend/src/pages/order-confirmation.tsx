import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import useCartStore from "@/stores/useCartStore";
import analytics, { EventType } from "@/services/analytics";
import {
  OrderSummary,
  ShippingDetails,
  PaymentInformation,
  OrderStatus
} from "@/components/order";

// Define types for our order details
interface OrderItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDetails {
  orderNumber: string;
  date: string;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  shipping: {
    method: string;
    cost: number;
    estimatedDelivery: string;
  };
  payment: {
    method: string;
    last4: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

const OrderConfirmation = () => {
  const router = useRouter();
  const { clearCart, items } = useCartStore();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderStatus, setOrderStatus] = useState<'processing' | 'shipped' | 'delivered' | 'complete'>('processing');

  // Generate order details on component mount
  useEffect(() => {
    // In a real app, we would fetch the order details from the API
    // based on the order ID from the URL or state management
    // For this demo, we'll generate the order details based on the cart items
    
    // Generate a random order number
    const generateOrderNumber = () => {
      const prefix = "AV";
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `${prefix}${randomNum}`;
    };

    // Format date as Month Day, Year
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Estimate delivery date (7-10 days from now)
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Create order details
    // For a real app, this would come from the API
    const orderData: OrderDetails = {
      orderNumber: generateOrderNumber(),
      date: formattedDate,
      items: items.map(item => ({
        id: item.product.id,
        title: item.product.title,
        brand: item.product.brand || 'Unknown Brand',
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      customer: {
        name: 'John Doe', // In real app, from checkout form
        email: 'john.doe@example.com',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States'
        }
      },
      shipping: {
        method: 'Standard Shipping (3-5 business days)',
        cost: 8.99,
        estimatedDelivery: formattedDeliveryDate
      },
      payment: {
        method: 'Credit Card',
        last4: '4242'
      },
      totals: {
        subtotal: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        shipping: 8.99,
        tax: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08,
        total: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + 8.99 + 
               (items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 0.08)
      }
    };

    setOrderDetails(orderData);
    
    // Track purchase event for analytics
    if (items.length > 0) {
      analytics.trackPurchase({
        transaction_id: orderData.orderNumber,
        items: orderData.items.map(item => ({
          id: item.id,
          name: item.title,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity
        })),
        value: orderData.totals.total,
        currency: 'USD',
        shipping: orderData.totals.shipping,
        tax: orderData.totals.tax
      });
      
      // Clear the cart after purchase is complete
      clearCart();
    }
  }, [items, clearCart]);
  
  // Track page view
  useEffect(() => {
    analytics.trackPageView({
      path: window.location.pathname,
      title: 'Order Confirmation'
    });
  }, []);

  if (!orderDetails) {
    return (
      <div className="bg-warm-white min-h-screen flex items-center justify-center">
        <div className="p-6 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-sage border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-charcoal">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8"
        >
          {/* Success Icon & Confirmation Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
              className="inline-flex"
            >
              <CheckCircleIcon className="w-20 h-20 text-sage" aria-hidden="true" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mt-4 mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Your order has been received and is now being processed. We've sent a confirmation email to <span className="font-medium">{orderDetails.customer.email}</span>.
            </p>
            
            {/* Order Number & Date */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
              <div className="py-3 px-4 bg-gray-50 rounded-md inline-block">
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-medium text-charcoal">{orderDetails.orderNumber}</p>
              </div>
              <div className="py-3 px-4 bg-gray-50 rounded-md inline-block">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-lg font-medium text-charcoal">{orderDetails.date}</p>
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              {/* Order Summary Component */}
              <OrderSummary 
                items={orderDetails.items}
                totals={orderDetails.totals}
              />
              
              {/* Order Status Timeline */}
              <OrderStatus
                orderNumber={orderDetails.orderNumber}
                date={orderDetails.date}
                status={orderStatus}
              />
            </div>
            
            <div className="space-y-6">
              {/* Shipping Details Component */}
              <ShippingDetails
                customer={orderDetails.customer}
                shipping={orderDetails.shipping}
              />
              
              {/* Payment Information Component */}
              <PaymentInformation
                payment={orderDetails.payment}
                customer={orderDetails.customer}
                totals={orderDetails.totals}
              />
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <div className="bg-sage/5 p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-start">
                <EnvelopeIcon className="h-10 w-10 text-sage mr-4 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-medium text-charcoal">Order Confirmation Email Sent</h2>
                  <p className="text-gray-600 mt-1">
                    We've sent a confirmation email to <span className="font-medium">{orderDetails.customer.email}</span> with 
                    all your order details and tracking information.
                  </p>
                </div>
              </div>
              <button className="mt-4 sm:mt-0 bg-white border border-gray-300 hover:bg-gray-50 text-sage font-medium py-2 px-4 rounded transition-colors flex-shrink-0">
                Resend Email
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-sage text-white rounded-md text-center font-medium hover:bg-sage/90 transition-colors"
            >
              Continue Shopping
            </Link>

            <Link
              href="/account"
              className="px-6 py-3 border border-gray-300 text-charcoal rounded-md text-center font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              View My Account
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
