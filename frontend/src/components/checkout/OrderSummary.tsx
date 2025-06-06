import React from 'react';
import { Order } from './OrderDetails';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  // Helper to format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(order.subtotal, order.currency)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>{formatCurrency(order.shippingCost, order.currency)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span>{formatCurrency(order.tax, order.currency)}</span>
        </div>
        
        <div className="border-t border-gray-300 pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-xl">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Method (mocked for now) */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <div className="flex items-center">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
          <div>
            <div className="text-sm">Credit Card (Visa)</div>
            <div className="text-xs text-gray-500">**** **** **** 4242</div>
          </div>
        </div>
      </div>
      
      {/* Order policies */}
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-2">
          Your order will be processed and shipped within 1-2 business days.
        </p>
        <p>
          For questions or concerns about your order, please contact our customer support at{' '}
          <a href="mailto:support@avnumarketplace.com" className="text-sage">
            support@avnumarketplace.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
