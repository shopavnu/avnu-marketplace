import { FC, useState, useEffect, ChangeEvent } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BudgetForecast } from '@/types/adCampaigns';

interface BudgetAllocatorProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
  forecast?: BudgetForecast;
  loading?: boolean;
}

const BudgetAllocator: FC<BudgetAllocatorProps> = ({
  budget,
  onBudgetChange,
  forecast,
  loading = false
}) => {
  const [localBudget, setLocalBudget] = useState<number>(budget);

  useEffect(() => {
    setLocalBudget(budget);
  }, [budget]);

  const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newBudget = parseFloat(e.target.value);
    setLocalBudget(newBudget);
  };

  const handleBudgetBlur = () => {
    if (!isNaN(localBudget) && localBudget >= 50) {
      onBudgetChange(localBudget);
    } else {
      // Reset to minimum budget if invalid
      setLocalBudget(50);
      onBudgetChange(50);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-4">
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Campaign Budget</h3>
        </div>
        
        <div className="mt-2">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Total Budget ($)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="budget"
              id="budget"
              min="50"
              step="10"
              value={localBudget}
              onChange={handleBudgetChange}
              onBlur={handleBudgetBlur}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Minimum budget is $50. Recommended budget for best results is ${forecast?.recommendedBudget || 100}.
          </p>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Budget Forecast</h4>
          
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Impressions</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {forecast?.estimatedImpressions?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Clicks</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {forecast?.estimatedClicks?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Conversions</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {forecast?.estimatedConversions?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cost Per Click</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${forecast?.estimatedCostPerClick?.toFixed(2) || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocator;
