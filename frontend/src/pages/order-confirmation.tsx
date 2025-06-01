import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircleIcon, 
  ChevronRightIcon, 
  EnvelopeIcon,
  TruckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import useCartStore from "@/stores/useCartStore";
import analytics, { EventType } from "@/services/analytics";

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
              <CheckCircleIcon className="w-20 h-20 text-sage" />
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

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Confirmation Email Card */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex">
              <div className="rounded-full bg-blue-100 p-2 mr-3 flex-shrink-0">
                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800 text-sm">Confirmation Email</h3>
                <p className="text-xs text-blue-700">
                  We've sent a receipt to your email address
                </p>
              </div>
            </div>
            
            {/* Shipping Status Card */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex">
              <div className="rounded-full bg-amber-100 p-2 mr-3 flex-shrink-0">
                <TruckIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 text-sm">Shipping Status</h3>
                <p className="text-xs text-amber-700">
                  Your order is being prepared
                </p>
              </div>
            </div>
            
            {/* Estimated Delivery Card */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex">
              <div className="rounded-full bg-green-100 p-2 mr-3 flex-shrink-0">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800 text-sm">Estimated Delivery</h3>
                <p className="text-xs text-green-700">
                  By {orderDetails.shipping.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              Order Details
            </h2>

            <div className="space-y-4">
              {/* Order items from cart data */}
              {orderDetails.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center py-3 border-b border-gray-100">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-charcoal">
                      {item.title}
                    </h4>
                    <p className="text-xs text-sage">{item.brand}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${orderDetails.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${orderDetails.totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${orderDetails.totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>${orderDetails.totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-charcoal mb-4">
                  Shipping Information
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">{orderDetails.customer.name}</p>
                  <p className="text-sm text-gray-700">{orderDetails.customer.address.line1}</p>
                  {orderDetails.customer.address.line2 && (
                    <p className="text-sm text-gray-700">{orderDetails.customer.address.line2}</p>
                  )}
                  <p className="text-sm text-gray-700">
                    {orderDetails.customer.address.city}, {orderDetails.customer.address.state} {orderDetails.customer.address.postalCode}
                  </p>
                  <p className="text-sm text-gray-700">{orderDetails.customer.address.country}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-charcoal mb-2">
                    Shipping Method
                  </h3>
                  <p className="text-sm text-gray-700">
                    {orderDetails.shipping.method}
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-charcoal mb-4">
                  Payment Information
                </h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">{orderDetails.payment.method}</p>
                  <p className="text-sm text-gray-700">•••• •••• •••• {orderDetails.payment.last4}</p>
                  <p className="text-sm text-gray-700">{orderDetails.customer.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              What&apos;s Next?
            </h2>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center text-sage font-medium">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-charcoal">
                    Order Processing
                  </h3>
                  <p className="text-sm text-gray-600">
                    We&apos;re preparing your items for shipment.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center text-sage font-medium">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-charcoal">
                    Shipping
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your order will be shipped within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center text-sage font-medium">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-charcoal">
                    Delivery
                  </h3>
                  <p className="text-sm text-gray-600">
                    You&apos;ll receive tracking information via email once your
                    order ships.
                  </p>
                </div>
              </div>
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
