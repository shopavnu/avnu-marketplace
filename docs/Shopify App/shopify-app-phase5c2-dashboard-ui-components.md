# Phase 5C-2: Analytics & Reporting - Dashboard UI Components

## Objectives

- Create reusable visualization components
- Implement a responsive dashboard layout system
- Build interactive dashboard widgets

## Timeline: Week 23-24

## Tasks & Implementation Details

### 1. Base Chart Components

Create reusable base chart components using React and Chart.js:

```tsx
// src/client/components/charts/BaseChart.tsx

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'pie';

interface BaseChartProps {
  type: ChartType;
  data: ChartData<any>;
  options?: ChartOptions<any>;
  height?: number;
  width?: number;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  type,
  data,
  options,
  height,
  width,
}) => {
  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  const chartOptions = {
    ...defaultOptions,
    ...options,
  };

  // Render appropriate chart type
  switch (type) {
    case 'line':
      return <Line data={data} options={chartOptions} height={height} width={width} />;
    case 'bar':
      return <Bar data={data} options={chartOptions} height={height} width={width} />;
    case 'pie':
      return <Pie data={data} options={chartOptions} height={height} width={width} />;
    default:
      return <Line data={data} options={chartOptions} height={height} width={width} />;
  }
};
```

### 2. Specialized Chart Components

Create specialized chart components for different visualizations:

```tsx
// src/client/components/charts/LineChart.tsx

import React from 'react';
import { BaseChart } from './BaseChart';
import { ChartOptions, ChartData } from 'chart.js';
import { format } from 'date-fns';

interface LineChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  label?: string;
  color?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  label = 'Value',
  color = 'rgb(75, 192, 192)',
  height = 300,
  width,
  showLegend = true,
}) => {
  // Format the data for Chart.js
  const chartData: ChartData<'line'> = {
    labels: data.map(item => {
      // Try to format the date if it's a valid date string
      try {
        const date = new Date(item.date);
        return format(date, 'MMM d');
      } catch {
        return item.date;
      }
    }),
    datasets: [
      {
        label,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: `${color}33`, // Add transparency
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: showLegend,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <BaseChart
      type="line"
      data={chartData}
      options={options}
      height={height}
      width={width}
    />
  );
};
```

```tsx
// src/client/components/charts/BarChart.tsx

import React from 'react';
import { BaseChart } from './BaseChart';
import { ChartOptions, ChartData } from 'chart.js';

interface BarChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  categoryLabel?: string;
  valueLabel?: string;
  color?: string;
  height?: number;
  width?: number;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  categoryLabel = 'Category',
  valueLabel = 'Value',
  color = 'rgb(54, 162, 235)',
  height = 300,
  width,
  horizontal = false,
}) => {
  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Format the data for Chart.js
  const chartData: ChartData<'bar'> = {
    labels: sortedData.map(item => item.label),
    datasets: [
      {
        label: valueLabel,
        data: sortedData.map(item => item.value),
        backgroundColor: color,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !horizontal,
          text: valueLabel,
        },
      },
      x: {
        title: {
          display: horizontal,
          text: valueLabel,
        },
      },
    },
  };

  return (
    <BaseChart
      type="bar"
      data={chartData}
      options={options}
      height={height}
      width={width}
    />
  );
};
```

```tsx
// src/client/components/charts/PieChart.tsx

import React from 'react';
import { BaseChart } from './BaseChart';
import { ChartOptions, ChartData } from 'chart.js';

interface PieChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  colors?: string[];
  height?: number;
  width?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  colors = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(75, 192, 192)',
    'rgb(255, 205, 86)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
  ],
  height = 300,
  width,
}) => {
  // Format the data for Chart.js
  const chartData: ChartData<'pie'> = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((_, index) => colors[index % colors.length]),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <BaseChart
      type="pie"
      data={chartData}
      options={options}
      height={height}
      width={width}
    />
  );
};
```

### 3. Metric Card Component

Create a card component for displaying individual metrics:

```tsx
// src/client/components/dashboard/MetricCard.tsx

import React from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  percentChange?: number;
  loading?: boolean;
  error?: string;
  format?: 'number' | 'currency' | 'percent';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ChangeContainer = styled.div<{ isPositive?: boolean }>`
  display: flex;
  align-items: center;
  color: ${props => (props.isPositive ? '#3f8600' : '#cf1322')};
  margin-top: auto;
`;

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  percentChange,
  loading = false,
  error,
  format = 'number',
  prefix,
  suffix,
}) => {
  // Format the value based on the specified format
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val);
      
      case 'percent':
        return new Intl.NumberFormat('en-US', { 
          style: 'percent', 
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(val / 100);
      
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const isPositive = percentChange ? percentChange > 0 : false;
  const formattedValue = typeof value === 'number' ? formatValue(value) : value;

  return (
    <StyledCard title={title}>
      <CardContent>
        {loading ? (
          <Spin />
        ) : error ? (
          <Alert type="error" message={error} />
        ) : (
          <>
            <ValueContainer>
              {prefix && <span style={{ marginRight: 8 }}>{prefix}</span>}
              <Title level={3} style={{ margin: 0 }}>{formattedValue}</Title>
              {suffix && <span style={{ marginLeft: 8 }}>{suffix}</span>}
            </ValueContainer>
            
            {percentChange !== undefined && (
              <ChangeContainer isPositive={isPositive}>
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                <Text strong style={{ marginLeft: 4 }}>
                  {Math.abs(percentChange).toFixed(1)}%
                </Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  vs previous period
                </Text>
              </ChangeContainer>
            )}
          </>
        )}
      </CardContent>
    </StyledCard>
  );
};
```

### 4. Dashboard Widget Component

Create a configurable dashboard widget component:

```tsx
// src/client/components/dashboard/DashboardWidget.tsx

import React, { useState } from 'react';
import { Card, Dropdown, Menu, Spin, Alert, DatePicker, Button } from 'antd';
import { MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { LineChart } from '../charts/LineChart';
import { BarChart } from '../charts/BarChart';
import { PieChart } from '../charts/PieChart';
import { MetricCard } from './MetricCard';
import styled from 'styled-components';
import { DashboardWidget as WidgetType } from '../../store/dashboard.store';

const { RangePicker } = DatePicker;

interface DashboardWidgetProps {
  widget: WidgetType;
  onRefresh?: (widgetId: string) => void;
  onDateRangeChange?: (widgetId: string, startDate: Date, endDate: Date) => void;
}

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 250px;
`;

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  onRefresh,
  onDateRangeChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(widget.id);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2 && onDateRangeChange) {
      onDateRangeChange(widget.id, dates[0].toDate(), dates[1].toDate());
      setShowDatePicker(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="refresh" onClick={handleRefresh}>
        <ReloadOutlined /> Refresh
      </Menu.Item>
      <Menu.Item key="dateRange" onClick={() => setShowDatePicker(!showDatePicker)}>
        Change date range
      </Menu.Item>
    </Menu>
  );

  const renderChart = () => {
    if (widget.isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (widget.error) {
      return <Alert type="error" message={widget.error} />;
    }

    switch (widget.chartType) {
      case 'line':
        return (
          <LineChart
            title=""
            data={widget.data.map(item => ({
              date: item.dimension,
              value: parseFloat(item.value),
            }))}
            label={widget.title}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            title=""
            data={widget.data.map(item => ({
              label: item.dimension,
              value: parseFloat(item.value),
            }))}
            valueLabel={widget.title}
          />
        );
      
      case 'pie':
        return (
          <PieChart
            title=""
            data={widget.data.map(item => ({
              label: item.dimension,
              value: parseFloat(item.value),
            }))}
          />
        );
      
      case 'counter':
        return (
          <MetricCard
            title=""
            value={widget.currentValue || 0}
            previousValue={widget.previousValue}
            percentChange={widget.changePercent}
            format={widget.metricKey.includes('rate') || widget.metricKey.includes('percent') ? 'percent' : 
                  widget.metricKey.includes('revenue') || widget.metricKey.includes('sales') ? 'currency' : 'number'}
          />
        );
      
      default:
        return <div>Unsupported chart type: {widget.chartType}</div>;
    }
  };

  return (
    <StyledCard
      title={
        <CardHeader>
          <span>{widget.title}</span>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </CardHeader>
      }
      bordered={false}
    >
      {showDatePicker && (
        <div style={{ marginBottom: 16 }}>
          <RangePicker onChange={handleDateRangeChange} />
        </div>
      )}
      
      <CardContent>
        <ChartContainer>
          {renderChart()}
        </ChartContainer>
        
        {widget.period && (
          <div style={{ marginTop: 8, textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
            Period: {widget.period}
          </div>
        )}
      </CardContent>
    </StyledCard>
  );
};
```

### 5. Dashboard Grid Layout

Implement a responsive grid layout for the dashboard:

```tsx
// src/client/components/dashboard/DashboardGrid.tsx

import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DashboardWidget } from './DashboardWidget';
import { Dashboard } from '../../store/dashboard.store';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  dashboard: Dashboard;
  onLayoutChange?: (layout: any) => void;
  onRefreshWidget?: (widgetId: string) => void;
  onDateRangeChange?: (widgetId: string, startDate: Date, endDate: Date) => void;
  editable?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  dashboard,
  onLayoutChange,
  onRefreshWidget,
  onDateRangeChange,
  editable = false,
}) => {
  // Prepare the layout from the dashboard configuration
  const layouts = {
    lg: dashboard.layout.map(item => ({
      i: item.widgetId,
      x: item.x,
      y: item.y,
      w: item.width,
      h: item.height,
      minW: 3,
      minH: 3,
    })),
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      isDraggable={editable}
      isResizable={editable}
      onLayoutChange={onLayoutChange}
      margin={[16, 16]}
    >
      {dashboard.widgets.map(widget => (
        <div key={widget.id}>
          <DashboardWidget
            widget={widget}
            onRefresh={onRefreshWidget}
            onDateRangeChange={onDateRangeChange}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};
```

### 6. Dashboard Page Component

Create the main dashboard page component:

```tsx
// src/client/pages/DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, Select, Button, Spin, Empty, message } from 'antd';
import { ReloadOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { DashboardGrid } from '../components/dashboard/DashboardGrid';
import {
  fetchDashboards,
  fetchDashboard,
  refreshWidget,
} from '../store/dashboard.store';
import { RootState } from '../store';

const { Option } = Select;

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const {
    availableDashboards,
    currentDashboard,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.dashboard);
  
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLayout, setEditedLayout] = useState<any>(null);

  // Load available dashboards on mount
  useEffect(() => {
    dispatch(fetchDashboards());
  }, [dispatch]);

  // Select the first dashboard when available
  useEffect(() => {
    if (availableDashboards.length > 0 && !selectedDashboardId) {
      const defaultDashboard = availableDashboards.find(d => d.isDefault) || availableDashboards[0];
      setSelectedDashboardId(defaultDashboard.id);
      dispatch(fetchDashboard(defaultDashboard.id));
    }
  }, [availableDashboards, selectedDashboardId, dispatch]);

  const handleDashboardChange = (dashboardId: string) => {
    setSelectedDashboardId(dashboardId);
    dispatch(fetchDashboard(dashboardId));
    setIsEditing(false);
  };

  const handleRefreshDashboard = () => {
    if (selectedDashboardId) {
      dispatch(fetchDashboard(selectedDashboardId));
      message.success('Dashboard refreshed');
    }
  };

  const handleRefreshWidget = (widgetId: string) => {
    if (currentDashboard) {
      const widget = currentDashboard.widgets.find(w => w.id === widgetId);
      if (widget) {
        dispatch(refreshWidget(widgetId, widget.metricKey, widget.dimensionKey));
        message.success(`Widget '${widget.title}' refreshed`);
      }
    }
  };

  const handleDateRangeChange = (widgetId: string, startDate: Date, endDate: Date) => {
    // Implementation for date range change would depend on your API
    console.log(`Change date range for ${widgetId}: ${startDate} - ${endDate}`);
    message.info('Date range changed - this would refresh the widget with new date range');
  };

  const handleLayoutChange = (layout: any) => {
    if (isEditing) {
      setEditedLayout(layout);
    }
  };

  const handleSaveLayout = () => {
    if (editedLayout && currentDashboard) {
      // Save the layout to backend
      // This would call your API to save the layout
      console.log('Saving layout:', editedLayout);
      message.success('Dashboard layout saved');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedLayout(null);
    setIsEditing(false);
  };

  if (isLoading && !currentDashboard) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty
        description={`Error loading dashboard: ${error}`}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <PageHeader
        title="Analytics Dashboard"
        subTitle="Monitor your store performance"
        extra={[
          <Select
            key="dashboard-select"
            style={{ width: 200 }}
            value={selectedDashboardId}
            onChange={handleDashboardChange}
            disabled={isLoading}
          >
            {availableDashboards.map(dashboard => (
              <Option key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </Option>
            ))}
          </Select>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={handleRefreshDashboard}
            disabled={isLoading || !currentDashboard}
          >
            Refresh
          </Button>,
          isEditing ? (
            <>
              <Button 
                key="save" 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveLayout}
              >
                Save Layout
              </Button>
              <Button 
                key="cancel" 
                icon={<CloseOutlined />} 
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              key="edit" 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
              disabled={isLoading || !currentDashboard}
            >
              Edit Layout
            </Button>
          ),
        ]}
      />

      {currentDashboard ? (
        <DashboardGrid
          dashboard={currentDashboard}
          onLayoutChange={handleLayoutChange}
          onRefreshWidget={handleRefreshWidget}
          onDateRangeChange={handleDateRangeChange}
          editable={isEditing}
        />
      ) : (
        <Empty description="Select a dashboard to view" />
      )}
    </div>
  );
};
```

## Dependencies & Prerequisites

- Completed Phase 5C-1 (Dashboard Data Service)
- React and React-DOM
- Chart.js and react-chartjs-2 for visualization
- React-Grid-Layout for responsive dashboard layout
- Ant Design for UI components
- Redux for state management

## Testing Guidelines

1. **Component Testing:**
   - Test each chart component with various data formats
   - Verify responsive behavior of dashboard grid
   - Test widget interactions (refresh, date range changes)

2. **Visual Testing:**
   - Ensure all charts render correctly with different data
   - Verify proper scaling and layout at different screen sizes
   - Test color schemes and visual accessibility

3. **Integration Testing:**
   - Test dashboard with real data from the API
   - Verify data refreshing functionality
   - Test layout saving and loading

## Next Phase

Continue to [Phase 5D-1: Real-time Analytics](./shopify-app-phase5d1-realtime-analytics.md) to implement WebSocket integration for live updates.
