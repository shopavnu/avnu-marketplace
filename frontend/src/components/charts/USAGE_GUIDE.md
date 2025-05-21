# Recharts Component Usage Guide

This guide provides standardized patterns for implementing charts across the AVNU Marketplace dashboards.

## Table of Contents

1. [Component Overview](#component-overview)
2. [Common Props](#common-props)
3. [BarChartComponent](#barchartcomponent)
4. [PieChartComponent](#piechartcomponent)
5. [LineChartComponent](#linechartcomponent)
6. [AreaChartComponent](#areachartcomponent)
7. [CompositeChartComponent](#compositechartcomponent)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Component Overview

Our chart components are built using [Recharts](https://recharts.org/), a composable charting library for React. We've created wrapper components to standardize implementation across the application:

- **BarChartComponent**: For bar charts (horizontal or vertical)
- **PieChartComponent**: For pie and donut charts
- **LineChartComponent**: For line charts
- **AreaChartComponent**: For area charts
- **CompositeChartComponent**: For combining multiple chart types

## Common Props

These props are commonly used across multiple chart components:

| Prop | Type | Description |
|------|------|-------------|
| `data` | `any[]` | Array of data objects to be visualized |
| `height` | `number` | Height of the chart in pixels (default: 300) |
| `tooltipFormatter` | `(value: number) => string` | Function to format tooltip values |
| `colors` | `string[]` | Array of color hex codes for chart elements |

## BarChartComponent

```tsx
<BarChartComponent
  data={dataArray}
  xKey="categoryField"
  yKey="primaryValueField"
  secondaryYKey="secondaryValueField" // Optional
  stackedBars={true|false} // Optional, default: false
  barSize={35} // Optional, controls bar width
  height={280} // Optional, default: 300
  xAxisLabel="X-Axis Label" // Optional
  yAxisLabel="Y-Axis Label" // Optional
  tooltipFormatter={(value) => `${value}%`} // Optional
  valueFormatter={(value) => `${value}%`} // Optional
  showGrid={true|false} // Optional, default: true
  horizontal={true|false} // Optional, default: false
/>
```

### Required Props

- `data`: Array of data objects
- `xKey`: Field name for the x-axis categories
- `yKey`: Field name for the primary y-axis values

### Common Usage Patterns

**Basic Bar Chart:**
```tsx
<BarChartComponent
  data={productPerformance}
  xKey="product"
  yKey="sales"
  barSize={35}
  height={280}
/>
```

**Stacked Bar Chart:**
```tsx
<BarChartComponent
  data={platformData}
  xKey="category"
  yKey="mobile"
  secondaryYKey="web"
  stackedBars={true}
  barSize={35}
/>
```

**Horizontal Bar Chart:**
```tsx
<BarChartComponent
  data={rankings}
  xKey="item"
  yKey="score"
  horizontal={true}
  barSize={25}
/>
```

## PieChartComponent

```tsx
<PieChartComponent
  data={dataArray}
  nameKey="categoryField"
  valueKey="valueField"
  height={280} // Optional, default: 300
  tooltipFormatter={(value) => `${value}%`} // Optional
  valueFormatter={(value) => `${value}%`} // Optional
  colors={['#8884d8', '#82ca9d', '#ffc658']} // Optional
  donut={true|false} // Optional, default: false
  innerRadius={60} // Optional, for donut charts
  outerRadius={80} // Optional
  legendPosition="top|right|bottom|left" // Optional, default: "bottom"
/>
```

### Required Props

- `data`: Array of data objects
- `nameKey`: Field name for segment names/categories
- `valueKey`: Field name for segment values

### Common Usage Patterns

**Simple Pie Chart:**
```tsx
<PieChartComponent
  data={marketShareData}
  nameKey="company"
  valueKey="share"
  tooltipFormatter={(value) => `${value}%`}
/>
```

**Donut Chart:**
```tsx
<PieChartComponent
  data={deviceDistribution}
  nameKey="device"
  valueKey="percentage"
  donut={true}
  innerRadius={60}
  outerRadius={80}
  tooltipFormatter={(value) => `${value}%`}
/>
```

**Custom Colors:**
```tsx
<PieChartComponent
  data={statusDistribution}
  nameKey="status"
  valueKey="count"
  colors={['#4caf50', '#8bc34a', '#ffeb3b', '#f44336']}
/>
```

## LineChartComponent

```tsx
<LineChartComponent
  data={dataArray}
  xKey="dateField"
  yKey="valueField"
  secondaryYKey="comparisonField" // Optional
  height={280} // Optional, default: 300
  xAxisLabel="X-Axis Label" // Optional
  yAxisLabel="Y-Axis Label" // Optional
  tooltipFormatter={(value) => `${value}%`} // Optional
  valueFormatter={(value) => `${value}%`} // Optional
  showGrid={true|false} // Optional, default: true
  area={true|false} // Optional, default: false
  curveType="linear|natural|step|monotone" // Optional, default: "linear"
  dotSize={4} // Optional
/>
```

### Required Props

- `data`: Array of data objects
- `xKey`: Field name for the x-axis values (often dates)
- `yKey`: Field name for the y-axis values

### Common Usage Patterns

**Simple Line Chart:**
```tsx
<LineChartComponent
  data={revenueData}
  xKey="month"
  yKey="amount"
  tooltipFormatter={(value) => `$${value.toLocaleString()}`}
/>
```

**Multi-Line Chart:**
```tsx
<LineChartComponent
  data={comparisonData}
  xKey="date"
  yKey="current"
  secondaryYKey="previous"
  tooltipFormatter={(value) => `${value.toFixed(1)}%`}
/>
```

**Smooth Line Chart:**
```tsx
<LineChartComponent
  data={trendData}
  xKey="week"
  yKey="value"
  curveType="monotone"
  showGrid={false}
/>
```

## AreaChartComponent

```tsx
<AreaChartComponent
  data={dataArray}
  xKey="dateField"
  yKey="valueField"
  secondaryYKey="comparisonField" // Optional
  height={280} // Optional, default: 300
  xAxisLabel="X-Axis Label" // Optional
  yAxisLabel="Y-Axis Label" // Optional
  tooltipFormatter={(value) => `${value}%`} // Optional
  stackedAreas={true|false} // Optional, default: false
  curveType="linear|natural|step|monotone" // Optional, default: "linear"
  gradientColors={true|false} // Optional, default: true
/>
```

### Required Props

- `data`: Array of data objects
- `xKey`: Field name for the x-axis values
- `yKey`: Field name for the y-axis values

### Common Usage Patterns

**Basic Area Chart:**
```tsx
<AreaChartComponent
  data={sessionData}
  xKey="date"
  yKey="sessions"
  tooltipFormatter={(value) => value.toLocaleString()}
/>
```

**Stacked Area Chart:**
```tsx
<AreaChartComponent
  data={trafficData}
  xKey="date"
  yKey="organic"
  secondaryYKey="paid"
  stackedAreas={true}
/>
```

## CompositeChartComponent

```tsx
<CompositeChartComponent
  data={dataArray}
  xKey="categoryField"
  barKeys={["field1", "field2"]} // Optional
  lineKeys={["field3", "field4"]} // Optional
  areaKeys={["field5"]} // Optional
  height={280} // Optional, default: 300
  xAxisLabel="X-Axis Label" // Optional
  yAxisLabel="Y-Axis Label" // Optional
  tooltipFormatter={(value) => `${value}%`} // Optional
  showGrid={true|false} // Optional, default: true
  barSize={20} // Optional
  stackedBars={true|false} // Optional, default: false
/>
```

### Required Props

- `data`: Array of data objects
- `xKey`: Field name for the x-axis categories
- At least one of: `barKeys`, `lineKeys`, or `areaKeys`

### Common Usage Patterns

**Bar and Line Chart:**
```tsx
<CompositeChartComponent
  data={salesData}
  xKey="month"
  barKeys={["revenue"]}
  lineKeys={["target"]}
  barSize={30}
  tooltipFormatter={(value) => `$${value.toLocaleString()}`}
/>
```

**Multi-Type Chart:**
```tsx
<CompositeChartComponent
  data={performanceData}
  xKey="quarter"
  barKeys={["actual"]}
  lineKeys={["forecast", "target"]}
  areaKeys={["range"]}
/>
```

## Best Practices

1. **Consistent Formatting**: Use the same formatting for similar metrics across dashboards
2. **Responsive Sizing**: Generally set an explicit height but allow width to be responsive
3. **Color Consistency**: Use consistent colors for the same types of data across charts
4. **Tooltips**: Always include tooltips with formatted values for better user experience
5. **Readable Labels**: Use clear, concise labels and avoid clipping/overlapping
6. **Data Transformation**: Transform data into the right format before passing to charts
7. **Loading States**: Show appropriate loading states while data is being fetched

## Troubleshooting

### Common TypeScript Errors

- **Property 'dataKeyForName' does not exist**: Use `nameKey` instead for PieChartComponent
- **Property 'dataKeyForValue' does not exist**: Use `valueKey` instead for PieChartComponent
- **Property 'multipleYKeys' does not exist**: Use `yKey` and `secondaryYKey` with `stackedBars` for BarChartComponent
- **Property 'showLegend' does not exist**: The legend is shown by default, no need for this prop

### Performance Issues

1. **Too Many Data Points**: Consider aggregating or filtering data if displaying more than 50-100 points
2. **Complex Composite Charts**: Limit the number of different series in CompositeChartComponent
3. **Rerendering**: Use React.memo or useMemo for chart components that don't need to rerender frequently

### Styling

- For custom styling beyond the available props, you can directly use Recharts' styling capabilities
- Consider adding custom themes by extending the component wrappers when necessary
