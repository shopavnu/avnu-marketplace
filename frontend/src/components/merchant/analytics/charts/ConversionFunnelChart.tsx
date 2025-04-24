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

interface FunnelStage {
  name: string;
  count: number;
}

interface ConversionRates {
  viewToClickRate: number;
  clickToCartRate: number;
  cartToOrderRate: number;
  abandonmentRate: number;
  overallConversionRate: number;
}

interface ConversionFunnelChartProps {
  stages: FunnelStage[];
  conversionRates: ConversionRates;
  title?: string;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
  stages,
  conversionRates,
  title = 'Conversion Funnel',
}) => {
  if (!stages || stages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Prepare data for the chart
  const labels = stages.map(stage => stage.name);
  const data = stages.map(stage => stage.count);

  // Calculate gradient colors based on funnel position
  const getBackgroundColor = () => {
    return 'rgba(101, 163, 13, 0.7)';
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Users',
        data,
        backgroundColor: getBackgroundColor(),
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            const value = context.parsed.y;
            const index = context.dataIndex;
            const nextIndex = index + 1;
            
            let tooltipLines = [`Count: ${value.toLocaleString()}`];
            
            // Add conversion rate to the tooltip if there's a next stage
            if (nextIndex < stages.length) {
              const conversionRate = (stages[nextIndex].count / value) * 100;
              tooltipLines.push(`Conversion to next stage: ${conversionRate.toFixed(2)}%`);
            }
            
            return tooltipLines;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Users',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Funnel Stage',
        },
      }
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">View to Click</p>
          <p className="text-lg font-semibold">{(conversionRates.viewToClickRate * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Click to Cart</p>
          <p className="text-lg font-semibold">{(conversionRates.clickToCartRate * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Cart to Order</p>
          <p className="text-lg font-semibold">{(conversionRates.cartToOrderRate * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Abandonment Rate</p>
          <p className="text-lg font-semibold">{(conversionRates.abandonmentRate * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm col-span-1 md:col-span-2">
          <p className="text-sm text-gray-500">Overall Conversion</p>
          <p className="text-lg font-semibold">{(conversionRates.overallConversionRate * 100).toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnelChart;
