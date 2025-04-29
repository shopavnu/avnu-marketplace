import React from 'react';

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface AdRevenueChartProps {
  dailyMetrics: DailyMetric[];
  title: string;
}

const AdRevenueChart: React.FC<AdRevenueChartProps> = ({ dailyMetrics, title }) => {
  // Calculate summary metrics
  const totalRevenue = dailyMetrics.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = dailyMetrics.reduce((sum, item) => sum + item.cost, 0);
  const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  const totalClicks = dailyMetrics.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = dailyMetrics.reduce((sum, item) => sum + item.conversions, 0);
  
  // Sort metrics by date for display
  const sortedMetrics = [...dailyMetrics].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get the first and last dates for range display
  const firstDate = sortedMetrics.length > 0 ? new Date(sortedMetrics[0].date).toLocaleDateString() : 'N/A';
  const lastDate = sortedMetrics.length > 0 ? 
    new Date(sortedMetrics[sortedMetrics.length - 1].date).toLocaleDateString() : 'N/A';
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500 mb-4">Date range: {firstDate} to {lastDate}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-medium">${totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Cost</p>
            <p className="text-xl font-medium">${totalCost.toFixed(2)}</p>
          </div>
          
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">ROI</p>
            <p className="text-xl font-medium">{totalROI.toFixed(2)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Clicks</p>
            <p className="text-xl font-medium">{totalClicks.toLocaleString()}</p>
          </div>
          
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">Total Conversions</p>
            <p className="text-xl font-medium">{totalConversions.toLocaleString()}</p>
          </div>
          
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-xl font-medium">
              {totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : '0.00'}%
            </p>
          </div>
        </div>
        
        {dailyMetrics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Recent Daily Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedMetrics.slice(-5).map((metric, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Date(metric.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${metric.revenue.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${metric.cost.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                        {metric.roi.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdRevenueChart;
