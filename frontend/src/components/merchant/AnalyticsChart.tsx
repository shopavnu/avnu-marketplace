import { FC, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DailyData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
}

interface AnalyticsChartProps {
  data: DailyData[];
}

const AnalyticsChart: FC<AnalyticsChartProps> = ({ data }) => {
  const [metrics, setMetrics] = useState({
    impressions: true,
    clicks: true,
    conversions: true,
    spent: false
  });

  const toggleMetric = (metric: keyof typeof metrics) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Custom tooltip to show all values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          <div className="mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {entry.name === 'Spent' ? `$${entry.value.toFixed(2)}` : entry.value.toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full">
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={() => toggleMetric('impressions')}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            metrics.impressions ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Impressions
        </button>
        <button
          type="button"
          onClick={() => toggleMetric('clicks')}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            metrics.clicks ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Clicks
        </button>
        <button
          type="button"
          onClick={() => toggleMetric('conversions')}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            metrics.conversions ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Conversions
        </button>
        <button
          type="button"
          onClick={() => toggleMetric('spent')}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            metrics.spent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Spent
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {metrics.impressions && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="impressions"
              name="Impressions"
              stroke="#3b82f6"
              activeDot={{ r: 8 }}
            />
          )}
          {metrics.clicks && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="clicks"
              name="Clicks"
              stroke="#10b981"
              activeDot={{ r: 8 }}
            />
          )}
          {metrics.conversions && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="conversions"
              name="Conversions"
              stroke="#8b5cf6"
              activeDot={{ r: 8 }}
            />
          )}
          {metrics.spent && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="spent"
              name="Spent"
              stroke="#ef4444"
              activeDot={{ r: 8 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
