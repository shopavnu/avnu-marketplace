import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface TopProduct {
  productId: string;
  productName: string;
  revenue: number;
  orders: number;
  views: number;
  conversionRate: number;
}

interface TopProductsChartProps {
  products: TopProduct[];
  metric: "revenue" | "orders" | "views" | "conversionRate";
  title?: string;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({
  products,
  metric,
  title,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Sort products by the selected metric
  const sortedProducts = [...products]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 5);

  // Prepare data for the chart
  const labels = sortedProducts.map((product) => {
    // Truncate long product names
    return product.productName.length > 20
      ? product.productName.substring(0, 20) + "..."
      : product.productName;
  });

  // Set colors based on metric
  let backgroundColor = "rgba(101, 163, 13, 0.7)"; // default sage green
  let borderColor = "rgb(101, 163, 13)";

  if (metric === "orders") {
    backgroundColor = "rgba(59, 130, 246, 0.7)"; // blue
    borderColor = "rgb(59, 130, 246)";
  } else if (metric === "views") {
    backgroundColor = "rgba(245, 158, 11, 0.7)"; // amber
    borderColor = "rgb(245, 158, 11)";
  } else if (metric === "conversionRate") {
    backgroundColor = "rgba(139, 92, 246, 0.7)"; // purple
    borderColor = "rgb(139, 92, 246)";
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: getMetricLabel(metric),
        data: sortedProducts.map((product) => product[metric]),
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // Horizontal bar chart
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title || `Top Products by ${getMetricLabel(metric)}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed.x;
            if (metric === "revenue") {
              return `Revenue: $${value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            } else if (metric === "conversionRate") {
              return `Conversion Rate: ${(value * 100).toFixed(2)}%`;
            } else {
              return `${getMetricLabel(metric)}: ${value.toLocaleString("en-US")}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            if (metric === "revenue") {
              return "$" + value.toLocaleString("en-US");
            } else if (metric === "conversionRate") {
              return (Number(value) * 100).toFixed(1) + "%";
            } else {
              return value;
            }
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Helper function to get the label for each metric
function getMetricLabel(metric: string): string {
  switch (metric) {
    case "revenue":
      return "Revenue";
    case "orders":
      return "Orders";
    case "views":
      return "Views";
    case "conversionRate":
      return "Conversion Rate";
    default:
      return metric.charAt(0).toUpperCase() + metric.slice(1);
  }
}

export default TopProductsChart;
