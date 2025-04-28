import React, { useEffect, useRef } from 'react';
import d3 from '../../utils/d3-imports';

interface HistoricalMetric {
  date: string;
  totalRevenue: number;
  totalCost: number;
  platformAdRevenue: number;
  productSalesFromAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}

interface MetricsTrendChartProps {
  historicalMetrics: HistoricalMetric[];
  metricType: 'revenue' | 'conversions' | 'platform';
  title: string;
}

const MetricsTrendChart: React.FC<MetricsTrendChartProps> = ({ 
  historicalMetrics, 
  metricType,
  title
}) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !historicalMetrics || historicalMetrics.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Sort metrics by date
    const sortedMetrics = [...historicalMetrics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800;
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(sortedMetrics, (d: HistoricalMetric) => new Date(d.date)) as [Date, Date])
      .range([0, innerWidth]);

    // Determine which metrics to show based on metricType
    let primaryMetric: string;
    let secondaryMetric: string | null = null;
    let primaryColor: string;
    let secondaryColor: string | null = null;
    let primaryLabel: string;
    let secondaryLabel: string | null = null;
    let yDomain: [number, number];

    if (metricType === 'revenue') {
      primaryMetric = 'totalRevenue';
      secondaryMetric = 'totalCost';
      primaryColor = '#4ade80'; // green
      secondaryColor = '#f87171'; // red
      primaryLabel = 'Revenue';
      secondaryLabel = 'Cost';
      yDomain = [0, d3.max(sortedMetrics, (d: HistoricalMetric) => Math.max(d.totalRevenue, d.totalCost)) || 0];
    } else if (metricType === 'conversions') {
      primaryMetric = 'totalClicks';
      secondaryMetric = 'totalConversions';
      primaryColor = '#60a5fa'; // blue
      secondaryColor = '#a78bfa'; // purple
      primaryLabel = 'Clicks';
      secondaryLabel = 'Conversions';
      yDomain = [0, d3.max(sortedMetrics, (d: HistoricalMetric) => d.totalClicks) || 0];
    } else { // platform
      primaryMetric = 'platformAdRevenue';
      secondaryMetric = 'productSalesFromAds';
      primaryColor = '#8b5cf6'; // purple
      secondaryColor = '#10b981'; // green
      primaryLabel = 'Platform Revenue';
      secondaryLabel = 'Product Sales';
      yDomain = [0, d3.max(sortedMetrics, (d: HistoricalMetric) => d.productSalesFromAds) || 0];
    }

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(Math.ceil(sortedMetrics.length / 10)))
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((d: number) => {
        if (metricType === 'conversions') {
          return d.toLocaleString();
        } else {
          return `$${d.toLocaleString()}`;
        }
      });

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(yAxis);

    // Create line generators
    const createLine = (metric: string) => {
      return d3.line()
        .x((d: any) => xScale(new Date(d.date)))
        .y((d: any) => yScale(d[metric]))
        .curve(d3.curveMonotoneX);
    };

    // Add primary line
    const primaryLine = createLine(primaryMetric);
    svg.append('path')
      .datum(sortedMetrics)
      .attr('fill', 'none')
      .attr('stroke', primaryColor)
      .attr('stroke-width', 2)
      .attr('d', primaryLine(sortedMetrics) as string);

    // Add secondary line if applicable
    if (secondaryMetric) {
      const secondaryLine = createLine(secondaryMetric);
      svg.append('path')
        .datum(sortedMetrics)
        .attr('fill', 'none')
        .attr('stroke', secondaryColor as string)
        .attr('stroke-width', 2)
        .attr('d', secondaryLine(sortedMetrics) as string);
    }

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth - 120}, 0)`);

    // Primary legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', primaryColor);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12.5)
      .attr('fill', '#666')
      .style('font-size', '12px')
      .text(primaryLabel);

    // Secondary legend if applicable
    if (secondaryMetric && secondaryLabel && secondaryColor) {
      legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', secondaryColor);

      legend.append('text')
        .attr('x', 20)
        .attr('y', 37.5)
        .attr('fill', '#666')
        .style('font-size', '12px')
        .text(secondaryLabel);
    }

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 100);

    // Add dots for each data point on primary line
    svg.selectAll('.primary-dot')
      .data(sortedMetrics)
      .enter()
      .append('circle')
      .attr('class', 'primary-dot')
      .attr('cx', (d: HistoricalMetric) => xScale(new Date(d.date)))
      .attr('cy', (d: any) => yScale(d[primaryMetric]))
      .attr('r', 4)
      .attr('fill', primaryColor)
      .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: any) {
        d3.select(this).attr('r', 6);
        
        let tooltipContent = `
          <div><strong>${new Date(d.date).toLocaleDateString()}</strong></div>
        `;
        
        if (metricType === 'revenue') {
          tooltipContent += `
            <div>Revenue: $${d.totalRevenue.toFixed(2)}</div>
            <div>Cost: $${d.totalCost.toFixed(2)}</div>
            <div>Profit: $${(d.totalRevenue - d.totalCost).toFixed(2)}</div>
          `;
        } else if (metricType === 'conversions') {
          tooltipContent += `
            <div>Clicks: ${d.totalClicks.toLocaleString()}</div>
            <div>Conversions: ${d.totalConversions.toLocaleString()}</div>
            <div>Conversion Rate: ${(d.totalConversions / d.totalClicks * 100).toFixed(2)}%</div>
          `;
        } else { // platform
          tooltipContent += `
            <div>Platform Revenue: $${d.platformAdRevenue.toFixed(2)}</div>
            <div>Product Sales: $${d.productSalesFromAds.toFixed(2)}</div>
            <div>ROAS: ${(d.productSalesFromAds / d.totalCost).toFixed(2)}x</div>
          `;
        }
        
        tooltip
          .style('opacity', 1)
          .html(tooltipContent)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function(this: SVGCircleElement) {
        d3.select(this).attr('r', 4);
        tooltip.style('opacity', 0);
      });

    // Clean up on unmount
    return () => {
      d3.select('body').selectAll('.chart-tooltip').remove();
    };
  }, [historicalMetrics, metricType, title]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <svg ref={chartRef} width="800" height="300" />
      </div>
    </div>
  );
};

export default MetricsTrendChart;
