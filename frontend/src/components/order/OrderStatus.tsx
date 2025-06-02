import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ClockIcon, TruckIcon, InboxIcon } from "@heroicons/react/24/outline";

export interface OrderStatusProps {
  orderNumber: string;
  date: string;
  status?: 'processing' | 'shipped' | 'delivered' | 'complete';
}

const OrderStatus = ({ orderNumber, date, status = 'processing' }: OrderStatusProps) => {
  // Define the steps with their properties but without component references
  const steps = [
    { 
      id: 'processing', 
      name: 'Processing', 
      description: 'Your order has been received and is being processed'
    },
    { 
      id: 'shipped', 
      name: 'Shipped', 
      description: 'Your order has been shipped'
    },
    { 
      id: 'delivered', 
      name: 'Out for Delivery', 
      description: 'Your package is out for delivery'
    },
    { 
      id: 'complete', 
      name: 'Delivered', 
      description: 'Your package has been delivered'
    },
  ];

  // Determine current step index based on status
  const currentStepIndex = steps.findIndex(step => step.id === status);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-charcoal">Order Status</h2>
            <p className="text-sm text-gray-500">
              Order #{orderNumber} • Placed on {date}
            </p>
          </div>
          <div className="bg-sage/10 text-sage px-3 py-1 rounded-full text-sm font-medium">
            {status === 'processing' && 'Processing'}
            {status === 'shipped' && 'Shipped'}
            {status === 'delivered' && 'Out for Delivery'}
            {status === 'complete' && 'Delivered'}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200" />
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isComplete = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="relative flex items-start">
                  <div className={`absolute left-0 mt-1 flex h-8 w-8 items-center justify-center rounded-full ${isComplete ? 'bg-sage' : 'bg-gray-100'}`}>
                    {isComplete ? (
                      <CheckCircleIcon className="h-8 w-8 text-sage" aria-hidden="true" />
                    ) : (
                      index === 0 ? (
                        <ClockIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      ) : index === 1 ? (
                        <TruckIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      ) : index === 2 ? (
                        <InboxIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      ) : (
                        <InboxIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      )
                    )}
                  </div>
                  <div className="ml-12">
                    <h3 className={`text-sm font-medium ${isCurrent ? 'text-sage' : isComplete ? 'text-charcoal' : 'text-gray-500'}`}>
                      {step.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {step.description}
                    </p>
                    {isCurrent && (
                      <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        <p className="font-medium">Current Status</p>
                        <p>{step.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
