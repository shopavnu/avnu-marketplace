import React from "react";

interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}

interface HeatmapVisualizationProps {
  data: HeatmapDataPoint[];
  title?: string;
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  colorRange?: string[];
}

const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({
  data,
  title = "Heatmap Visualization",
  width = 600,
  height = 400,
  xLabel = "X Axis",
  yLabel = "Y Axis",
  colorRange = ["#f7fbff", "#08306b"],
}) => {
  // Get unique x and y values
  const xValues = Array.from(new Set(data.map((d) => String(d.x))));
  const yValues = Array.from(new Set(data.map((d) => String(d.y))));

  // Find the maximum value for color scaling
  const maxValue = Math.max(...data.map((d) => d.value));

  // Calculate color intensity for each cell
  const getColorIntensity = (value: number): number => {
    return maxValue > 0 ? value / maxValue : 0;
  };

  // Generate a color based on intensity (from light to dark blue)
  const getColor = (intensity: number): string => {
    // Simple linear interpolation between the two colors
    const r1 = parseInt(colorRange[0].slice(1, 3), 16);
    const g1 = parseInt(colorRange[0].slice(3, 5), 16);
    const b1 = parseInt(colorRange[0].slice(5, 7), 16);

    const r2 = parseInt(colorRange[1].slice(1, 3), 16);
    const g2 = parseInt(colorRange[1].slice(3, 5), 16);
    const b2 = parseInt(colorRange[1].slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * intensity);
    const g = Math.round(g1 + (g2 - g1) * intensity);
    const b = Math.round(b1 + (b2 - b1) * intensity);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Group data by x and y for table rendering
  const dataMap = new Map<string, Map<string, number>>();

  // Initialize the map with all x,y combinations
  xValues.forEach((x) => {
    const yMap = new Map<string, number>();
    yValues.forEach((y) => {
      yMap.set(y, 0);
    });
    dataMap.set(x, yMap);
  });

  // Fill in actual values
  data.forEach((d) => {
    const xMap = dataMap.get(String(d.x));
    if (xMap) {
      xMap.set(String(d.y), d.value);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>

      <div className="flex mb-2">
        <div className="w-24 font-medium text-gray-700">{yLabel}</div>
        <div className="flex-1 text-center font-medium text-gray-700">
          {xLabel}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24 border border-gray-300 bg-gray-100 p-2"></th>
              {xValues.map((x, i) => (
                <th
                  key={i}
                  className="border border-gray-300 bg-gray-100 p-2 text-sm"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yValues.map((y, yIndex) => (
              <tr key={yIndex}>
                <td className="border border-gray-300 bg-gray-100 p-2 text-sm font-medium">
                  {y}
                </td>
                {xValues.map((x, xIndex) => {
                  const value = dataMap.get(String(x))?.get(String(y)) || 0;
                  const intensity = getColorIntensity(value);
                  const color = getColor(intensity);

                  return (
                    <td
                      key={xIndex}
                      className="border border-gray-300 p-2 text-center relative"
                      style={{
                        backgroundColor: color,
                        color: intensity > 0.6 ? "white" : "black",
                        minWidth: "60px",
                        height: "40px",
                      }}
                      title={`${x}, ${y}: ${value.toFixed(2)}`}
                    >
                      {value.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple legend */}
      <div className="mt-4 flex items-center justify-end">
        <div className="text-xs text-gray-600 mr-2">Value:</div>
        <div className="flex h-4 w-40 rounded overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: getColor(i / 9) }}
            ></div>
          ))}
        </div>
        <div className="flex justify-between w-40 text-xs text-gray-600 px-1">
          <span>0</span>
          <span>{(maxValue / 2).toFixed(1)}</span>
          <span>{maxValue.toFixed(1)}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-md font-medium mb-3">Heatmap Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded shadow-sm">
            <p className="text-sm text-gray-500">Max Value</p>
            <p className="text-xl font-medium">{maxValue.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded shadow-sm">
            <p className="text-sm text-gray-500">Min Value</p>
            <p className="text-xl font-medium">
              {Math.min(...data.map((d) => d.value)).toFixed(2)}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded shadow-sm">
            <p className="text-sm text-gray-500">Average Value</p>
            <p className="text-xl font-medium">
              {(
                data.reduce((sum, d) => sum + d.value, 0) / data.length
              ).toFixed(2)}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded shadow-sm">
            <p className="text-sm text-gray-500">Data Points</p>
            <p className="text-xl font-medium">{data.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapVisualization;
