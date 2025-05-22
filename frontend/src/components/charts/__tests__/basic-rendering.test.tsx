import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

// Import the components through the index to ensure we're using them as they'd be used in the app
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
  CompositeChartComponent,
  AreaChartComponent,
} from "../";

// Mock the Recharts components to avoid rendering issues
jest.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    ComposedChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="composite-chart">{children}</div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="area-chart">{children}</div>
    ),
    Bar: () => <div data-testid="bar" />,
    Pie: () => <div data-testid="pie" />,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
  };
});

// Mock the MUI theme hook
jest.mock("@mui/material", () => {
  return {
    Box: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mui-box">{children}</div>
    ),
    Typography: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mui-typography">{children}</div>
    ),
    useTheme: () => ({
      palette: {
        primary: { main: "#1976d2" },
        secondary: { main: "#dc004e" },
        text: { secondary: "#666666" },
        divider: "#eeeeee",
        background: { paper: "#ffffff" },
        success: { main: "#4caf50" },
        info: { main: "#2196f3" },
        warning: { main: "#ff9800" },
        error: { main: "#f44336" },
      },
      shadows: [null, null, "0px 2px 4px rgba(0,0,0,0.1)"],
    }),
  };
});

/**
 * Basic rendering tests for chart components
 *
 * This test suite checks that all chart components can render without errors.
 * It does not test all functionality, just basic rendering with minimal props.
 */
describe("Chart Components Basic Rendering", () => {
  // Simple mock data for each chart type
  const barData = [
    { category: "A", value: 10 },
    { category: "B", value: 15 },
    { category: "C", value: 8 },
  ];

  const pieData = [
    { name: "Category A", value: 30 },
    { name: "Category B", value: 40 },
    { name: "Category C", value: 30 },
  ];

  const lineData = [
    { month: "Jan", value: 100 },
    { month: "Feb", value: 120 },
    { month: "Mar", value: 140 },
  ];

  test("BarChartComponent renders without crashing", () => {
    const { getByTestId } = render(
      <BarChartComponent data={barData} xKey="category" yKey="value" />,
    );

    expect(getByTestId("responsive-container")).toBeInTheDocument();
    expect(getByTestId("bar-chart")).toBeInTheDocument();
  });

  test("PieChartComponent renders without crashing", () => {
    const { getByTestId } = render(
      <PieChartComponent data={pieData} nameKey="name" valueKey="value" />,
    );

    expect(getByTestId("responsive-container")).toBeInTheDocument();
    expect(getByTestId("pie-chart")).toBeInTheDocument();
  });

  test("LineChartComponent renders without crashing", () => {
    const { getByTestId } = render(
      <LineChartComponent data={lineData} xKey="month" yKey="value" />,
    );

    expect(getByTestId("responsive-container")).toBeInTheDocument();
    expect(getByTestId("line-chart")).toBeInTheDocument();
  });

  test("AreaChartComponent renders without crashing", () => {
    const { getByTestId } = render(
      <AreaChartComponent data={lineData} xKey="month" yKey="value" />,
    );

    expect(getByTestId("responsive-container")).toBeInTheDocument();
    expect(getByTestId("area-chart")).toBeInTheDocument();
  });

  test("CompositeChartComponent renders without crashing", () => {
    const { getByTestId } = render(
      <CompositeChartComponent
        data={lineData}
        xKey="month"
        metrics={[{ key: "value", type: "bar", name: "Value" }]}
      />,
    );

    expect(getByTestId("responsive-container")).toBeInTheDocument();
    expect(getByTestId("composite-chart")).toBeInTheDocument();
  });
});
