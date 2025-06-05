import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { PackageIcon, TruckIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Types
interface OrderItemProduct {
  id: string;
  title: string;
  image?: string;
}

interface OrderItem {
  product: OrderItemProduct;
  price: number;
  quantity: number;
  vendorName?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  status?: string;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  // Helper to format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Group items by vendor/brand for display
  const itemsByVendor = order.items.reduce((acc: Record<string, OrderItem[]>, item) => {
    const vendorName = item.vendorName || 'Unknown Vendor';
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(item);
    return acc;
  }, {});

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Order Details</h2>
      
      {/* Order Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <div className="flex items-center mb-2">
          <PackageIcon className="h-5 w-5 text-sage mr-2" />
          <span className="font-medium">Status:</span>
          <span className="ml-2 px-2 py-1 bg-sage-100 text-sage rounded-md text-sm">
            {order.status || 'Processing'}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <TruckIcon className="h-5 w-5 text-sage mr-2" />
          <span className="font-medium">Shipping Method:</span>
          <span className="ml-2">{order.shippingMethod}</span>
        </div>
        {order.estimatedDelivery && (
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-sage mr-2" />
            <span className="font-medium">Estimated Delivery:</span>
            <span className="ml-2">{order.estimatedDelivery}</span>
          </div>
        )}
      </div>
      
      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Items in Your Order</h3>
        
        {Object.entries(itemsByVendor).map(([vendorName, items]) => (
          <div key={vendorName} className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Sold by: {vendorName}</div>
            {items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="flex py-3 border-b last:border-b-0">
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.title}
                      layout="fill"
                      objectFit="cover"
                      priority={index < 2}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <div className="font-medium">{item.product.title}</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Quantity: {item.quantity}
                  </div>
                  <div className="text-charcoal font-medium mt-1">
                    {formatCurrency(item.price)} each
                  </div>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Shipping Address */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Shipping Address</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="font-medium">{order.shippingAddress.name}</div>
          <div>{order.shippingAddress.street}</div>
          {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
          <div>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </div>
          <div>{order.shippingAddress.country}</div>
        </div>
      </div>
      
      {/* Order Dates */}
      <div className="text-sm text-gray-500">
        <div>Order Date: {formatDate(order.createdAt)}</div>
        {order.updatedAt && order.updatedAt !== order.createdAt && (
          <div>Last Updated: {formatDate(order.updatedAt)}</div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
