import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

interface RevenueChartProps {
  performanceData: TimeSeriesDataPoint[];
  title?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  performanceData,
  title = "Revenue Over Time",
}) => {
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Format dates and prepare data for the chart
  const labels = performanceData.map((item) =>
    format(parseISO(item.date), "MMM d"),
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: performanceData.map((item) => item.value),
        borderColor: "#65a30d", // sage green
        backgroundColor: "rgba(101, 163, 13, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
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
          label: function (context) {
            return `Revenue: $${context.parsed.y.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString("en-US");
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
