import { 
  EyeIcon, 
  CursorArrowRaysIcon, 
  ShoppingCartIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface ProductMetric {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

interface ProductMetricsCardProps {
  productId: string;
  productName: string;
  views: ProductMetric;
  clicks: ProductMetric;
  conversions: ProductMetric;
  conversionRate: number;
}

const ProductMetricsCard = ({ 
  productId, 
  productName, 
  views, 
  clicks, 
  conversions,
  conversionRate
}: ProductMetricsCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900 truncate">{productName}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{productId}</p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Views */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-2 bg-blue-100">
                <EyeIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Views</h4>
                <div className="flex items-baseline">
                  <p className="text-xl font-semibold text-gray-900">{views.value.toLocaleString()}</p>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    views.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {views.changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-1">{views.change}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Clicks */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-2 bg-purple-100">
                <CursorArrowRaysIcon className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Clicks</h4>
                <div className="flex items-baseline">
                  <p className="text-xl font-semibold text-gray-900">{clicks.value.toLocaleString()}</p>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    clicks.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {clicks.changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-1">{clicks.change}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conversions */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-2 bg-green-100">
                <ShoppingCartIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-500">Conversions</h4>
                <div className="flex items-baseline">
                  <p className="text-xl font-semibold text-gray-900">{conversions.value}</p>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    conversions.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {conversions.changeType === 'increase' ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-1">{conversions.change}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conversion Rate Progress */}
        <div className="mt-5">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">Conversion Rate</h4>
            <span className="text-sm font-medium text-gray-900">{conversionRate.toFixed(2)}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-sage h-2.5 rounded-full" 
              style={{ width: `${Math.min(conversionRate * 5, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMetricsCard;
