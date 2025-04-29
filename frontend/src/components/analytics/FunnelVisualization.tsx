import React from 'react';

interface FunnelStep {
  name: string;
  value: number;
  percentage?: number;
  conversionRate?: number;
}

interface FunnelVisualizationProps {
  data: FunnelStep[];
  title?: string;
  height?: number;
  width?: number;
  showLabels?: boolean;
}

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({
  data,
  title = 'Funnel Visualization',
  height = 400,
  width = 600,
  showLabels = true,
}) => {
  // Process data to ensure it has conversion rates and percentages
  const processedData = data.map((step, i) => {
    const prevValue = i > 0 ? data[i - 1].value : step.value;
    const percentage = i > 0 ? (step.value / prevValue) * 100 : 100;
    const conversionRate = (step.value / data[0].value) * 100;
    return {
      ...step,
      percentage,
      conversionRate,
    };
  });

  // Calculate the maximum value for scaling
  const maxValue = Math.max(...processedData.map(d => d.value));
  
  // Calculate the width percentage for each bar based on its value
  const getBarWidth = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="p-4 bg-gray-50 rounded-lg">
        {processedData.map((step, index) => {
          const barWidth = getBarWidth(step.value);
          const dropOff = index > 0 ? (100 - step.percentage!) : 0;
          
          return (
            <div key={index} className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{step.name}</span>
                <span className="text-sm text-gray-500">{step.value.toLocaleString()} users</span>
              </div>
              
              <div className="relative w-full h-8 bg-gray-200 rounded">
                <div 
                  className="absolute h-8 bg-blue-600 rounded" 
                  style={{ width: `${barWidth}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {step.conversionRate?.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {index > 0 && (
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">
                    {step.percentage?.toFixed(1)}% from previous
                  </span>
                  <span className="text-red-500">
                    {dropOff.toFixed(1)}% drop-off
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Summary stats */}
        {processedData.length > 1 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-md font-medium mb-3">Funnel Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-sm text-gray-500">Starting Users</p>
                <p className="text-xl font-medium">
                  {processedData[0].value.toLocaleString()}
                </p>
              </div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-sm text-gray-500">Completing Users</p>
                <p className="text-xl font-medium">
                  {processedData[processedData.length - 1].value.toLocaleString()}
                </p>
              </div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-sm text-gray-500">Overall Conversion</p>
                <p className="text-xl font-medium">
                  {processedData[processedData.length - 1].conversionRate?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelVisualization;
