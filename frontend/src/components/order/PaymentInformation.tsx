import { CreditCardIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/formatters";

export interface PaymentInformationProps {
  payment: {
    method: string;
    last4: string;
  };
  customer: {
    name: string;
  };
  totals: {
    total: number;
  };
}

const PaymentInformation = ({ payment, customer, totals }: PaymentInformationProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-lg font-medium text-charcoal mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-sage" />
          Payment Information
        </h2>
        
        <div className="space-y-3">
          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-1">Payment Method</h3>
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-md flex-grow">
                <p className="text-sm text-charcoal font-medium">{payment.method}</p>
                <p className="text-sm text-gray-600">•••• •••• •••• {payment.last4}</p>
                <p className="text-sm text-gray-600">{customer.name}</p>
              </div>
            </div>
          </div>
          
          {/* Amount Charged */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-charcoal mb-1">Amount Charged</h3>
            <p className="text-lg font-medium text-charcoal">{formatCurrency(totals.total)}</p>
            <p className="text-xs text-gray-500 mt-1">
              A receipt has been sent to your email address
            </p>
          </div>
          
          {/* Payment Security Notice */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-sage mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-500">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInformation;
