import { Repository } from 'typeorm';
import { BusinessMetrics, MetricType, TimeGranularity } from '../entities/business-metrics.entity';
export declare class BusinessMetricsService {
    private readonly businessMetricsRepository;
    private readonly logger;
    constructor(businessMetricsRepository: Repository<BusinessMetrics>);
    recordMetric(data: Partial<BusinessMetrics>): Promise<BusinessMetrics>;
    recordRevenue(value: number, periodStart: Date, periodEnd: Date, timeGranularity?: TimeGranularity, dimension1?: string, dimension2?: string, dimension3?: string): Promise<BusinessMetrics>;
    recordOrders(count: number, periodStart: Date, periodEnd: Date, timeGranularity?: TimeGranularity, dimension1?: string, dimension2?: string, dimension3?: string): Promise<BusinessMetrics>;
    recordAverageOrderValue(value: number, periodStart: Date, periodEnd: Date, timeGranularity?: TimeGranularity, dimension1?: string, dimension2?: string, dimension3?: string): Promise<BusinessMetrics>;
    recordConversionRate(value: number, periodStart: Date, periodEnd: Date, timeGranularity?: TimeGranularity, dimension1?: string, dimension2?: string, dimension3?: string): Promise<BusinessMetrics>;
    recordSearchConversion(value: number, periodStart: Date, periodEnd: Date, timeGranularity?: TimeGranularity, dimension1?: string, dimension2?: string, dimension3?: string): Promise<BusinessMetrics>;
    getMetricsByTypeAndPeriod(metricType: MetricType, startDate: Date, endDate: Date, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getRevenueMetrics(period?: number, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getOrderMetrics(period?: number, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getAverageOrderValueMetrics(period?: number, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getConversionRateMetrics(period?: number, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getSearchConversionMetrics(period?: number, timeGranularity?: TimeGranularity): Promise<BusinessMetrics[]>;
    getMetricsSummary(period?: number): Promise<any>;
    private getTotalMetricValue;
    private getTotalMetricCount;
    private getAverageMetricValue;
}
