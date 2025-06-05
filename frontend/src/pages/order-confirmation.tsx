import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { trackOrderCompleted } from "@/analytics/tracking";
import { OrderDetails } from "@/components/checkout/OrderDetails";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { RecommendedProducts } from "@/components/products/RecommendedProducts";
import useCart from "@/hooks/useCart"; // Corrected to default import

// Define types for the order and order items
interface OrderItemProduct {
  id: string;
  title: string;
  image?: string;
}

interface OrderItemType {
  product: OrderItemProduct;
  price: number;
  quantity: number;
  vendorName?: string;
}

interface ShippingAddressType {
  name: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderType {
  id: string;
  total: number;
  currency: string;
  items: OrderItemType[];
  shippingAddress: ShippingAddressType;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  status?: string;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
}

const OrderConfirmation = () => {
  const router = useRouter();
  const { items, cartTotal, clearCart, getCartForApi } = useCart();
  const [orderNumber, setOrderNumber] = useState("");

  // Generate a random order number on component mount
  useEffect(() => {
    const generateOrderNumber = () => {
      const prefix = "AV";
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `${prefix}${randomNum}`;
    };

    const newOrderNumber = generateOrderNumber();
    setOrderNumber(newOrderNumber);

    // Define mockOrder here to use the generated orderNumber
    const mockOrder: OrderType = {
      id: newOrderNumber,
      total: cartTotal || 145.04, // Use cart total if available, else fallback
      currency: "USD",
      items: items.length > 0 ? items.map(item => ({
        product: { 
          id: item.product.id, 
          title: item.product.title, 
          image: item.product.image 
        },
        price: item.product.price, 
        quantity: item.quantity,
        vendorName: item.product.brand
      })) : [
        { product: { id: "prod_1", title: "Ceramic Vase" }, price: 45.99, quantity: 1, vendorName: "Terra & Clay" },
        { product: { id: "prod_2", title: "Organic Cotton Throw" }, price: 39.99, quantity: 2, vendorName: "Pure Living" },
      ],
      shippingAddress: {
        name: "John Doe",
        street: "123 Main Street",
        apartment: "Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States",
      },
      shippingMethod: "Standard Shipping (3-5 business days)",
      subtotal: items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 125.97,
      shippingCost: 8.99, // Example, adjust if dynamic
      tax: (cartTotal || 145.04) * 0.08 || 10.08, // Example tax calculation
    };

    if (router.isReady && mockOrder) {
      trackOrderCompleted({
        orderId: mockOrder.id,
        total: mockOrder.total,
        currency: mockOrder.currency,
        products: mockOrder.items.map((item) => ({
          id: item.product.id,
          name: item.product.title,
          price: item.price,
          quantity: item.quantity,
        })),
        cartTotal,
        cartItems: getCartForApi().items,
      });
      clearCart(); // Clear the cart after order completion
    }
  }, [router.isReady, items, cartTotal, clearCart, getCartForApi]);

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
            >
              <CheckCircleIcon className="w-20 h-20 text-sage" />
            </motion.div>
          </div>

          {/* Order Confirmation Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-3">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-600">
              Your order has been received and is now being processed. You will
              receive an email confirmation shortly.
            </p>
            <div className="mt-4 py-3 px-4 bg-gray-50 rounded-md inline-block">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-medium text-charcoal">{orderNumber}</p>
            </div>
          </div>

          {/* Order Details & Summary using components */}
          {orderNumber && (
            <>
              <OrderDetails order={{
                id: orderNumber,
                total: cartTotal || 145.04,
                currency: "USD",
                items: items.length > 0 ? items.map(item => ({
                  product: {
                    id: item.product.id,
                    title: item.product.title,
                    image: item.product.image
                  },
                  price: item.product.price,
                  quantity: item.quantity,
                  vendorName: item.product.brand
                })) : [
                  { product: { id: "prod_1", title: "Ceramic Vase", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800" }, price: 45.99, quantity: 1, vendorName: "Terra & Clay" },
                  { product: { id: "prod_2", title: "Organic Cotton Throw", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800" }, price: 39.99, quantity: 2, vendorName: "Pure Living" },
                ],
                shippingAddress: { name: "John Doe", street: "123 Main Street", apartment: "Apt 4B", city: "New York", state: "NY", zip: "10001", country: "United States" },
                shippingMethod: "Standard Shipping (3-5 business days)",
                subtotal: items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 125.97,
                shippingCost: 8.99,
                tax: (cartTotal || 145.04) * 0.08 || 10.08,
                status: "Processing",
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }} />
              <OrderSummary order={{
                id: orderNumber,
                total: cartTotal || 145.04,
                currency: "USD",
                items: items.length > 0 ? items.map(item => ({
                  product: {
                    id: item.product.id,
                    title: item.product.title,
                    image: item.product.image
                  },
                  price: item.product.price,
                  quantity: item.quantity,
                  vendorName: item.product.brand
                })) : [
                  { product: { id: "prod_1", title: "Ceramic Vase", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800" }, price: 45.99, quantity: 1, vendorName: "Terra & Clay" },
                  { product: { id: "prod_2", title: "Organic Cotton Throw", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800" }, price: 39.99, quantity: 2, vendorName: "Pure Living" },
                ],
                shippingAddress: { name: "John Doe", street: "123 Main Street", apartment: "Apt 4B", city: "New York", state: "NY", zip: "10001", country: "United States" },
                shippingMethod: "Standard Shipping (3-5 business days)",
                subtotal: items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 125.97,
                shippingCost: 8.99,
                tax: (cartTotal || 145.04) * 0.08 || 10.08,
                status: "Processing",
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }} />
            </>
          )}

          {/* Recommended Products */}
          <div className="mt-12">
            <RecommendedProducts />
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
