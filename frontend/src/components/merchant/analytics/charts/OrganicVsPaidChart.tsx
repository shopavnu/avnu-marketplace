import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OrganicVsPaidData {
  impressions: {
    organic: number;
    paid: number;
  };
  clicks: {
    organic: number;
    paid: number;
  };
  conversionRates: {
    organic: number;
    paid: number;
  };
  revenue: {
    organic: number;
    paid: number;
  };
}

interface OrganicVsPaidChartProps {
  data: OrganicVsPaidData;
  title?: string;
}

const OrganicVsPaidChart: React.FC<OrganicVsPaidChartProps> = ({
  data,
  title = 'Organic vs. Paid Performance',
}) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Prepare data for the chart
  const labels = ['Impressions', 'Clicks', 'Conversion Rate', 'Revenue'];
  
  // Normalize revenue to be on a similar scale as other metrics for visualization
  const maxRevenue = Math.max(data.revenue.organic, data.revenue.paid);
  const normalizedOrganicRevenue = maxRevenue > 0 ? data.revenue.organic / maxRevenue * 100 : 0;
  const normalizedPaidRevenue = maxRevenue > 0 ? data.revenue.paid / maxRevenue * 100 : 0;
  
  // Normalize conversion rates to percentage for better visualization
  const organicConversionPercentage = data.conversionRates.organic * 100;
  const paidConversionPercentage = data.conversionRates.paid * 100;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Organic',
        data: [
          data.impressions.organic,
          data.clicks.organic,
          organicConversionPercentage,
          normalizedOrganicRevenue,
        ],
        backgroundColor: 'rgba(101, 163, 13, 0.7)', // sage green
        borderColor: 'rgb(101, 163, 13)',
        borderWidth: 1,
      },
      {
        label: 'Paid',
        data: [
          data.impressions.paid,
          data.clicks.paid,
          paidConversionPercentage,
          normalizedPaidRevenue,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            const datasetLabel = context.dataset.label || '';
            const categoryIndex = context.dataIndex;
            
            if (categoryIndex === 0) { // Impressions
              return `${datasetLabel}: ${value.toLocaleString()} impressions`;
            } else if (categoryIndex === 1) { // Clicks
              return `${datasetLabel}: ${value.toLocaleString()} clicks`;
            } else if (categoryIndex === 2) { // Conversion Rate
              return `${datasetLabel}: ${value.toFixed(2)}%`;
            } else if (categoryIndex === 3) { // Revenue (normalized)
              // Show actual revenue value in tooltip
              const actualRevenue = datasetLabel === 'Organic' 
                ? data.revenue.organic 
                : data.revenue.paid;
              return `${datasetLabel}: $${actualRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value, index, ticks) {
            // For conversion rate and revenue, show percentage
            return value;
          }
        }
      }
    },
  };

  // Actual metrics comparison (not just the chart)
  const metricsComparison = (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Impressions</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Organic</p>
            <p className="text-lg font-semibold">{data.impressions.organic.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-semibold">{data.impressions.paid.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600" 
            style={{ 
              width: `${data.impressions.organic / (data.impressions.organic + data.impressions.paid) * 100}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Clicks</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Organic</p>
            <p className="text-lg font-semibold">{data.clicks.organic.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-semibold">{data.clicks.paid.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600" 
            style={{ 
              width: `${data.clicks.organic / (data.clicks.organic + data.clicks.paid) * 100}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Organic</p>
            <p className="text-lg font-semibold">{(data.conversionRates.organic * 100).toFixed(2)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-semibold">{(data.conversionRates.paid * 100).toFixed(2)}%</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600" 
            style={{ 
              width: `${data.conversionRates.organic / (data.conversionRates.organic + data.conversionRates.paid) * 100}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Revenue</h4>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">Organic</p>
            <p className="text-lg font-semibold">${data.revenue.organic.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-lg font-semibold">${data.revenue.paid.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600" 
            style={{ 
              width: `${data.revenue.organic / (data.revenue.organic + data.revenue.paid) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      {metricsComparison}
    </div>
  );
};

export default OrganicVsPaidChart;
