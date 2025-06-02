import Image from "next/image";
import { formatCurrency } from "@/utils/formatters";

export interface OrderItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

const OrderSummary = ({ items, totals }: OrderSummaryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-lg font-medium text-charcoal mb-4">Order Summary</h2>
        
        {/* Order Items */}
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex items-center">
              <div className="relative h-16 w-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                <Image 
                  src={item.image} 
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 64px"
                />
              </div>
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-charcoal">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-charcoal">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {/* Order Totals */}
        <div className="mt-6 border-t border-gray-200 pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Subtotal</p>
            <p className="text-charcoal font-medium">{formatCurrency(totals.subtotal)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Shipping</p>
            <p className="text-charcoal font-medium">{formatCurrency(totals.shipping)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Tax</p>
            <p className="text-charcoal font-medium">{formatCurrency(totals.tax)}</p>
          </div>
          <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
            <p className="text-charcoal">Total</p>
            <p className="text-charcoal">{formatCurrency(totals.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
