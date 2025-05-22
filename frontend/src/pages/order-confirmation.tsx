import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const OrderConfirmation = () => {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  // Generate a random order number on component mount
  useEffect(() => {
    const generateOrderNumber = () => {
      const prefix = "AV";
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      return `${prefix}${randomNum}`;
    };

    setOrderNumber(generateOrderNumber());
  }, []);

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

          {/* Order Details */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              Order Details
            </h2>

            <div className="space-y-4">
              {/* Sample order items - in a real app, these would come from the order data */}
              <div className="flex items-center py-3 border-b border-gray-100">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                  <Image
                    src="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800"
                    alt="Ceramic Vase"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-charcoal">
                    Ceramic Vase
                  </h4>
                  <p className="text-xs text-sage">Terra & Clay</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">Qty: 1</span>
                    <span className="text-sm font-medium">$45.99</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center py-3 border-b border-gray-100">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
                  <Image
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800"
                    alt="Organic Cotton Throw"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-charcoal">
                    Organic Cotton Throw
                  </h4>
                  <p className="text-xs text-sage">Pure Living</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">Qty: 2</span>
                    <span className="text-sm font-medium">$79.98</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">$125.97</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">$8.99</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">$10.08</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>$145.04</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-lg font-medium text-charcoal mb-4">
              Shipping Information
            </h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">John Doe</p>
              <p className="text-sm text-gray-700">123 Main Street</p>
              <p className="text-sm text-gray-700">Apt 4B</p>
              <p className="text-sm text-gray-700">New York, NY 10001</p>
              <p className="text-sm text-gray-700">United States</p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-charcoal mb-2">
                Shipping Method
              </h3>
              <p className="text-sm text-gray-700">
                Standard Shipping (3-5 business days)
              </p>
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
