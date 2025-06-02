import { TruckIcon, ClockIcon } from "@heroicons/react/24/outline";

export interface ShippingDetailsProps {
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
}

const ShippingDetails = ({ customer, shipping }: ShippingDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-lg font-medium text-charcoal mb-4">Shipping Details</h2>

        <div className="space-y-6">
          {/* Shipping Address */}
          <div>
            <h3 className="text-sm font-medium text-charcoal flex items-center mb-2">
              <span className="mr-2">Delivery Address</span>
            </h3>
            <div className="text-sm text-gray-700">
              <p className="font-medium">{customer.name}</p>
              <p>{customer.address.line1}</p>
              {customer.address.line2 && <p>{customer.address.line2}</p>}
              <p>
                {customer.address.city}, {customer.address.state}{" "}
                {customer.address.postalCode}
              </p>
              <p>{customer.address.country}</p>
            </div>
          </div>

          {/* Shipping Method */}
          <div>
            <h3 className="text-sm font-medium text-charcoal flex items-center mb-2">
              <TruckIcon className="h-4 w-4 mr-2 text-sage" />
              <span>Shipping Method</span>
            </h3>
            <p className="text-sm text-gray-700">{shipping.method}</p>
          </div>

          {/* Estimated Delivery */}
          <div>
            <h3 className="text-sm font-medium text-charcoal flex items-center mb-2">
              <ClockIcon className="h-4 w-4 mr-2 text-sage" />
              <span>Estimated Delivery</span>
            </h3>
            <p className="text-sm text-gray-700">{shipping.estimatedDelivery}</p>
            <p className="text-xs text-gray-500 mt-1">
              Tracking information will be sent to{" "}
              <span className="font-medium">{customer.email}</span> once your order ships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetails;
