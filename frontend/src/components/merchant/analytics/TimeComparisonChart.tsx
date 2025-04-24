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
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonData {
  currentPeriod: {
    label: string;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
  };
  previousPeriod: {
    label: string;
    revenue: number;
    orders: number;
    views: number;
    conversionRate: number;
  };
}

interface TimeComparisonChartProps {
  data: ComparisonData;
  title?: string;
}

const TimeComparisonChart: React.FC<TimeComparisonChartProps> = ({
  data,
  title = 'Period Comparison',
}) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No comparison data available</p>
      </div>
    );
  }

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculateChange(data.currentPeriod.revenue, data.previousPeriod.revenue);
  const ordersChange = calculateChange(data.currentPeriod.orders, data.previousPeriod.orders);
  const viewsChange = calculateChange(data.currentPeriod.views, data.previousPeriod.views);
  const conversionChange = calculateChange(data.currentPeriod.conversionRate, data.previousPeriod.conversionRate);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Prepare data for the chart
  const labels = ['Revenue', 'Orders', 'Views', 'Conversion Rate'];
  
  // Normalize data for better visualization (convert to percentages of previous period)
  const normalizedCurrentRevenue = (data.currentPeriod.revenue / data.previousPeriod.revenue) * 100;
  const normalizedCurrentOrders = (data.currentPeriod.orders / data.previousPeriod.orders) * 100;
  const normalizedCurrentViews = (data.currentPeriod.views / data.previousPeriod.views) * 100;
  const normalizedCurrentConversion = (data.currentPeriod.conversionRate / data.previousPeriod.conversionRate) * 100;

  const chartData = {
    labels,
    datasets: [
      {
        label: data.previousPeriod.label,
        data: [100, 100, 100, 100], // Base 100% for previous period
        backgroundColor: 'rgba(156, 163, 175, 0.7)', // gray
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
      },
      {
        label: data.currentPeriod.label,
        data: [
          normalizedCurrentRevenue,
          normalizedCurrentOrders,
          normalizedCurrentViews,
          normalizedCurrentConversion,
        ],
        backgroundColor: 'rgba(101, 163, 13, 0.7)', // sage green
        borderColor: 'rgb(101, 163, 13)',
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
            const datasetLabel = context.dataset.label || '';
            const categoryIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            if (datasetIndex === 0) { // Previous period (always 100%)
              if (categoryIndex === 0) { // Revenue
                return `${datasetLabel}: ${formatCurrency(data.previousPeriod.revenue)}`;
              } else if (categoryIndex === 1) { // Orders
                return `${datasetLabel}: ${data.previousPeriod.orders}`;
              } else if (categoryIndex === 2) { // Views
                return `${datasetLabel}: ${data.previousPeriod.views}`;
              } else if (categoryIndex === 3) { // Conversion Rate
                return `${datasetLabel}: ${formatPercentage(data.previousPeriod.conversionRate)}`;
              }
            } else { // Current period
              if (categoryIndex === 0) { // Revenue
                return `${datasetLabel}: ${formatCurrency(data.currentPeriod.revenue)}`;
              } else if (categoryIndex === 1) { // Orders
                return `${datasetLabel}: ${data.currentPeriod.orders}`;
              } else if (categoryIndex === 2) { // Views
                return `${datasetLabel}: ${data.currentPeriod.views}`;
              } else if (categoryIndex === 3) { // Conversion Rate
                return `${datasetLabel}: ${formatPercentage(data.currentPeriod.conversionRate)}`;
              }
            }
            return `${datasetLabel}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percentage of Previous Period',
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
  };

  // Comparison metrics cards
  const comparisonMetrics = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Revenue</h4>
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{formatCurrency(data.currentPeriod.revenue)}</p>
          <div className={`flex items-center ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(revenueChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">vs. {formatCurrency(data.previousPeriod.revenue)}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Orders</h4>
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{data.currentPeriod.orders}</p>
          <div className={`flex items-center ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {ordersChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(ordersChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">vs. {data.previousPeriod.orders}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Views</h4>
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{data.currentPeriod.views}</p>
          <div className={`flex items-center ${viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {viewsChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(viewsChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">vs. {data.previousPeriod.views}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</h4>
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{formatPercentage(data.currentPeriod.conversionRate)}</p>
          <div className={`flex items-center ${conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {conversionChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{Math.abs(conversionChange).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">vs. {formatPercentage(data.previousPeriod.conversionRate)}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      {comparisonMetrics}
    </div>
  );
};

export default TimeComparisonChart;
