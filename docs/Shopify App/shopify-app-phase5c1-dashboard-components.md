# Phase 5C-1: Analytics & Reporting - Dashboard Components

## Objectives

- Create a flexible dashboard framework
- Implement reusable visualization components 
- Develop standard e-commerce dashboard widgets
- Build a customizable dashboard layout system

## Timeline: Week 22-23

## Tasks & Implementation Details

### 1. Dashboard Data Service

Create a service to provide data for dashboard components:

```typescript
// src/modules/analytics/services/dashboard-data.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsAggregate } from '../../entities/analytics-aggregate.entity';
import { ReportResult } from '../../entities/report-result.entity';
import { MetricsQueryService } from './metrics-query.service';
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, format } from 'date-fns';

export interface DashboardMetricParams {
  merchantId: string;
  metricKey: string;
  dimensionKey?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  compareWithPrevious?: boolean;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  filters?: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin';
    value: any;
  }>;
}

export interface DashboardWidgetData {
  id: string;
  title: string;
  metricKey: string;
  dimensionKey?: string;
  chartType: 'line' | 'bar' | 'pie' | 'table' | 'counter' | 'gauge';
  data: any[];
  currentValue?: number;
  previousValue?: number;
  changePercent?: number;
  period?: string;
  updatedAt: Date;
}

export interface DashboardConfig {
  id: string;
  name: string;
  layout: Array<{
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  widgets: DashboardWidgetData[];
  isDefault: boolean;
}

@Injectable()
export class DashboardDataService {
  private readonly logger = new Logger(DashboardDataService.name);

  constructor(
    @InjectRepository(AnalyticsAggregate)
    private readonly analyticsAggregateRepository: Repository<AnalyticsAggregate>,
    @InjectRepository(ReportResult)
    private readonly reportResultRepository: Repository<ReportResult>,
    private readonly metricsQueryService: MetricsQueryService,
  ) {}

  /**
   * Get data for a single metric dashboard widget
   */
  async getMetricData(params: DashboardMetricParams): Promise<DashboardWidgetData> {
    try {
      const {
        merchantId,
        metricKey,
        dimensionKey = 'date',
        period = 'day',
        compareWithPrevious = true,
        limit = 30,
        startDate = this.getDefaultStartDate(period),
        endDate = new Date(),
        filters = [],
      } = params;
      
      // Get the current period data
      const data = await this.metricsQueryService.queryMetric({
        merchantId,
        metricKey,
        dimensionKey,
        period,
        startDate,
        endDate,
        filters,
      });
      
      // Calculate current value (usually sum or latest value depending on metric)
      const currentValue = this.calculateCurrentValue(data, metricKey);
      
      // Get the previous period data if requested
      let previousValue: number | undefined;
      let changePercent: number | undefined;
      
      if (compareWithPrevious) {
        const previousPeriodDuration = endDate.getTime() - startDate.getTime();
        const previousPeriodEndDate = new Date(startDate.getTime() - 1);
        const previousPeriodStartDate = new Date(previousPeriodEndDate.getTime() - previousPeriodDuration);
        
        const previousData = await this.metricsQueryService.queryMetric({
          merchantId,
          metricKey,
          dimensionKey,
          period,
          startDate: previousPeriodStartDate,
          endDate: previousPeriodEndDate,
          filters,
        });
        
        previousValue = this.calculateCurrentValue(previousData, metricKey);
        
        // Calculate percent change
        if (previousValue && previousValue !== 0) {
          changePercent = ((currentValue - previousValue) / previousValue) * 100;
        }
      }
      
      // Find an appropriate chart type based on the metric and dimension
      const chartType = this.determineChartType(metricKey, dimensionKey);
      
      // Limit the data points if needed
      const limitedData = dimensionKey === 'date' 
        ? data.slice(-limit) 
        : data.slice(0, limit);
      
      return {
        id: `widget_${metricKey}_${dimensionKey}`,
        title: this.formatMetricTitle(metricKey),
        metricKey,
        dimensionKey,
        chartType,
        data: limitedData,
        currentValue,
        previousValue,
        changePercent,
        period: this.formatPeriodLabel(startDate, endDate, period),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error fetching metric data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get data for multiple metrics to populate a dashboard
   */
  async getDashboardData(
    merchantId: string,
    dashboardId: string
  ): Promise<DashboardConfig> {
    try {
      // In a real implementation, this would load the dashboard configuration 
      // from a database or configuration store
      const dashboardConfig = await this.loadDashboardConfig(merchantId, dashboardId);
      
      // Fetch data for each widget in parallel
      const widgetDataPromises = dashboardConfig.widgets.map(widget => {
        return this.getMetricData({
          merchantId,
          metricKey: widget.metricKey,
          dimensionKey: widget.dimensionKey,
          period: widget.period as any,
        }).catch(error => {
          this.logger.error(`Error fetching data for widget ${widget.id}: ${error.message}`);
          return widget; // Return the original widget without data on error
        });
      });
      
      const widgetData = await Promise.all(widgetDataPromises);
      
      // Update the dashboard with the fetched data
      dashboardConfig.widgets = widgetData;
      
      return dashboardConfig;
    } catch (error) {
      this.logger.error(`Error fetching dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a list of available dashboards for a merchant
   */
  async getAvailableDashboards(merchantId: string): Promise<Array<{ id: string; name: string; isDefault: boolean }>> {
    // In a real implementation, this would fetch from a database
    // This is a placeholder implementation
    return [
      { id: 'sales_dashboard', name: 'Sales Overview', isDefault: true },
      { id: 'product_dashboard', name: 'Product Performance', isDefault: false },
      { id: 'customer_dashboard', name: 'Customer Insights', isDefault: false },
    ];
  }

  /**
   * Get the default start date based on period
   */
  private getDefaultStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return startOfDay(subDays(now, 30));
      case 'week':
        return startOfDay(subWeeks(now, 12));
      case 'month':
        return startOfDay(subMonths(now, 12));
      case 'quarter':
        return startOfDay(subMonths(now, 24));
      case 'year':
        return startOfDay(subMonths(now, 36));
      default:
        return startOfDay(subDays(now, 30));
    }
  }

  /**
   * Calculate the current value from data (e.g., sum, latest, etc.)
   */
  private calculateCurrentValue(data: any[], metricKey: string): number {
    if (!data || data.length === 0) {
      return 0;
    }
    
    // Different metrics may need different calculations
    // This is a simplified implementation
    if (this.isCountMetric(metricKey)) {
      // Sum for count metrics
      return data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    } else if (this.isAverageMetric(metricKey)) {
      // Average for average metrics
      const sum = data.reduce((acc, item) => acc + (parseFloat(item.value) || 0), 0);
      return sum / data.length;
    } else if (this.isRateMetric(metricKey)) {
      // Latest value for rate metrics
      return parseFloat(data[data.length - 1]?.value) || 0;
    } else {
      // Default to sum
      return data.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
    }
  }

  /**
   * Determine the chart type based on metric and dimension
   */
  private determineChartType(
    metricKey: string,
    dimensionKey: string
  ): 'line' | 'bar' | 'pie' | 'table' | 'counter' | 'gauge' {
    if (dimensionKey === 'date') {
      return 'line'; // Time series data works well with line charts
    } else if (['product_id', 'category', 'collection', 'tag'].includes(dimensionKey)) {
      return 'bar'; // Categorical data works well with bar charts
    } else if (['payment_method', 'shipping_country', 'customer_type'].includes(dimensionKey)) {
      return 'pie'; // Distribution data works well with pie charts
    } else if (metricKey.includes('rate') || metricKey.includes('percentage')) {
      return 'gauge'; // Rate metrics work well with gauge charts
    } else if (!dimensionKey || dimensionKey === 'none') {
      return 'counter'; // Single value metrics work well with counters
    } else {
      return 'table'; // Default to table for complex data
    }
  }

  /**
   * Check if a metric is a count-type metric
   */
  private isCountMetric(metricKey: string): boolean {
    return [
      'order_count', 
      'product_views', 
      'cart_additions', 
      'checkout_initiations',
      'new_customers',
      'returning_customers',
      'total_visits',
    ].includes(metricKey);
  }

  /**
   * Check if a metric is an average-type metric
   */
  private isAverageMetric(metricKey: string): boolean {
    return [
      'average_order_value', 
      'average_session_duration', 
      'average_products_per_order',
    ].includes(metricKey);
  }

  /**
   * Check if a metric is a rate-type metric
   */
  private isRateMetric(metricKey: string): boolean {
    return [
      'conversion_rate', 
      'cart_abandonment_rate', 
      'bounce_rate',
    ].includes(metricKey);
  }

  /**
   * Format a period label based on date range
   */
  private formatPeriodLabel(startDate: Date, endDate: Date, period: string): string {
    switch (period) {
      case 'day':
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      case 'week':
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      case 'month':
        return `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`;
      case 'quarter':
        return `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`;
      case 'year':
        return `${format(startDate, 'yyyy')} - ${format(endDate, 'yyyy')}`;
      default:
        return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
  }

  /**
   * Format a metric title for display
   */
  private formatMetricTitle(metricKey: string): string {
    // Convert snake_case to Title Case
    return metricKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Load a dashboard configuration
   * (In a real implementation, this would load from a database)
   */
  private async loadDashboardConfig(merchantId: string, dashboardId: string): Promise<DashboardConfig> {
    // This is a placeholder implementation
    // In a real app, this would load from a database or configuration store
    
    if (dashboardId === 'sales_dashboard') {
      return {
        id: 'sales_dashboard',
        name: 'Sales Overview',
        layout: [
          { widgetId: 'widget_revenue_date', x: 0, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_order_count_date', x: 6, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_average_order_value_date', x: 0, y: 8, width: 4, height: 6 },
          { widgetId: 'widget_conversion_rate_date', x: 4, y: 8, width: 4, height: 6 },
          { widgetId: 'widget_revenue_product_id', x: 8, y: 8, width: 4, height: 6 },
        ],
        widgets: [
          {
            id: 'widget_revenue_date',
            title: 'Revenue Over Time',
            metricKey: 'revenue',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_order_count_date',
            title: 'Order Count Over Time',
            metricKey: 'order_count',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_average_order_value_date',
            title: 'Average Order Value',
            metricKey: 'average_order_value',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_conversion_rate_date',
            title: 'Conversion Rate',
            metricKey: 'conversion_rate',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_revenue_product_id',
            title: 'Top Products by Revenue',
            metricKey: 'revenue',
            dimensionKey: 'product_id',
            chartType: 'bar',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
        ],
        isDefault: true,
      };
    } else if (dashboardId === 'product_dashboard') {
      return {
        id: 'product_dashboard',
        name: 'Product Performance',
        layout: [
          { widgetId: 'widget_product_views_product_id', x: 0, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_revenue_product_id', x: 6, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_conversion_rate_product_id', x: 0, y: 8, width: 12, height: 6 },
        ],
        widgets: [
          {
            id: 'widget_product_views_product_id',
            title: 'Product Views',
            metricKey: 'product_views',
            dimensionKey: 'product_id',
            chartType: 'bar',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_revenue_product_id',
            title: 'Product Revenue',
            metricKey: 'revenue',
            dimensionKey: 'product_id',
            chartType: 'bar',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_conversion_rate_product_id',
            title: 'Product Conversion Rate',
            metricKey: 'conversion_rate',
            dimensionKey: 'product_id',
            chartType: 'bar',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
        ],
        isDefault: false,
      };
    } else if (dashboardId === 'customer_dashboard') {
      return {
        id: 'customer_dashboard',
        name: 'Customer Insights',
        layout: [
          { widgetId: 'widget_new_customers_date', x: 0, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_returning_customers_date', x: 6, y: 0, width: 6, height: 8 },
          { widgetId: 'widget_revenue_customer_type', x: 0, y: 8, width: 6, height: 6 },
          { widgetId: 'widget_average_order_value_customer_type', x: 6, y: 8, width: 6, height: 6 },
        ],
        widgets: [
          {
            id: 'widget_new_customers_date',
            title: 'New Customers Over Time',
            metricKey: 'new_customers',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_returning_customers_date',
            title: 'Returning Customers Over Time',
            metricKey: 'returning_customers',
            dimensionKey: 'date',
            chartType: 'line',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_revenue_customer_type',
            title: 'Revenue by Customer Type',
            metricKey: 'revenue',
            dimensionKey: 'customer_type',
            chartType: 'pie',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
          {
            id: 'widget_average_order_value_customer_type',
            title: 'Average Order Value by Customer Type',
            metricKey: 'average_order_value',
            dimensionKey: 'customer_type',
            chartType: 'bar',
            data: [],
            period: 'day',
            updatedAt: new Date(),
          },
        ],
        isDefault: false,
      };
    } else {
      throw new NotFoundException(`Dashboard with ID ${dashboardId} not found`);
    }
  }
}
```

### 2. Dashboard Controller

Create a controller for dashboard API endpoints:

```typescript
// src/modules/analytics/controllers/dashboard.controller.ts

import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardDataService } from '../services/dashboard-data.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardDataService: DashboardDataService,
  ) {}

  @Get()
  async getAvailableDashboards(@Request() req) {
    const merchantId = req.user.merchantId;
    return this.dashboardDataService.getAvailableDashboards(merchantId);
  }

  @Get(':dashboardId')
  async getDashboardData(@Request() req, @Param('dashboardId') dashboardId: string) {
    const merchantId = req.user.merchantId;
    return this.dashboardDataService.getDashboardData(merchantId, dashboardId);
  }

  @Get('metrics/:metricKey')
  async getMetricData(
    @Request() req,
    @Param('metricKey') metricKey: string,
    @Query('dimensionKey') dimensionKey: string = 'date',
    @Query('period') period: string = 'day',
    @Query('compareWithPrevious') compareWithPrevious: boolean = true,
    @Query('limit') limit: number = 30,
  ) {
    const merchantId = req.user.merchantId;
    
    return this.dashboardDataService.getMetricData({
      merchantId,
      metricKey,
      dimensionKey,
      period: period as any,
      compareWithPrevious,
      limit,
    });
  }
}
```

### 3. Dashboard Store Module (Frontend)

Create a frontend store module for dashboard state management:

```typescript
// src/client/store/dashboard.store.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../services/api-client';

export interface DashboardWidget {
  id: string;
  title: string;
  metricKey: string;
  dimensionKey?: string;
  chartType: 'line' | 'bar' | 'pie' | 'table' | 'counter' | 'gauge';
  data: any[];
  currentValue?: number;
  previousValue?: number;
  changePercent?: number;
  period?: string;
  updatedAt: Date;
  isLoading?: boolean;
  error?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  layout: Array<{
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

export interface DashboardState {
  availableDashboards: Array<{
    id: string;
    name: string;
    isDefault: boolean;
  }>;
  currentDashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  availableDashboards: [],
  currentDashboard: null,
  isLoading: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardsSuccess(state, action: PayloadAction<Array<{
      id: string;
      name: string;
      isDefault: boolean;
    }>>) {
      state.availableDashboards = action.payload;
      state.isLoading = false;
    },
    fetchDashboardsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchDashboardStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardSuccess(state, action: PayloadAction<Dashboard>) {
      state.currentDashboard = action.payload;
      state.isLoading = false;
    },
    fetchDashboardFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateWidgetStart(state, action: PayloadAction<string>) {
      if (state.currentDashboard) {
        const widget = state.currentDashboard.widgets.find(w => w.id === action.payload);
        if (widget) {
          widget.isLoading = true;
          widget.error = undefined;
        }
      }
    },
    updateWidgetSuccess(state, action: PayloadAction<DashboardWidget>) {
      if (state.currentDashboard) {
        state.currentDashboard.widgets = state.currentDashboard.widgets.map(widget => 
          widget.id === action.payload.id ? action.payload : widget
        );
      }
    },
    updateWidgetFailure(state, action: PayloadAction<{ widgetId: string; error: string }>) {
      if (state.currentDashboard) {
        const widget = state.currentDashboard.widgets.find(w => w.id === action.payload.widgetId);
        if (widget) {
          widget.isLoading = false;
          widget.error = action.payload.error;
        }
      }
    },
  },
});

export const {
  fetchDashboardsStart,
  fetchDashboardsSuccess,
  fetchDashboardsFailure,
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  updateWidgetStart,
  updateWidgetSuccess,
  updateWidgetFailure,
} = dashboardSlice.actions;

// Thunk actions
export const fetchDashboards = () => async (dispatch) => {
  try {
    dispatch(fetchDashboardsStart());
    const response = await apiClient.get('/dashboard');
    dispatch(fetchDashboardsSuccess(response.data));
    
    // If there are dashboards, fetch the default one
    if (response.data && response.data.length > 0) {
      const defaultDashboard = response.data.find(d => d.isDefault) || response.data[0];
      dispatch(fetchDashboard(defaultDashboard.id));
    }
  } catch (error) {
    dispatch(fetchDashboardsFailure(error.message));
  }
};

export const fetchDashboard = (dashboardId: string) => async (dispatch) => {
  try {
    dispatch(fetchDashboardStart());
    const response = await apiClient.get(`/dashboard/${dashboardId}`);
    dispatch(fetchDashboardSuccess(response.data));
  } catch (error) {
    dispatch(fetchDashboardFailure(error.message));
  }
};

export const refreshWidget = (widgetId: string, metricKey: string, dimensionKey?: string, period?: string) => async (dispatch) => {
  try {
    dispatch(updateWidgetStart(widgetId));
    
    const params = {
      dimensionKey: dimensionKey || 'date',
      period: period || 'day',
      compareWithPrevious: true,
    };
    
    const response = await apiClient.get(`/dashboard/metrics/${metricKey}`, { params });
    
    dispatch(updateWidgetSuccess({
      ...response.data,
      id: widgetId,
    }));
  } catch (error) {
    dispatch(updateWidgetFailure({
      widgetId,
      error: error.message,
    }));
  }
};

export default dashboardSlice.reducer;
```
