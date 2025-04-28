import React, { useEffect, useRef } from 'react';
import d3 from '../../utils/d3-imports';

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface AdRevenueChartProps {
  dailyMetrics: DailyMetric[];
}

const AdRevenueChart: React.FC<AdRevenueChartProps> = ({ dailyMetrics }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !dailyMetrics || dailyMetrics.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Sort metrics by date
    const sortedMetrics = [...dailyMetrics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800;
    const height = 400;
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
      .domain(d3.extent(sortedMetrics, (d: DailyMetric) => new Date(d.date)) as [Date, Date])
      .range([0, innerWidth]);

    const yScaleRevenue = d3.scaleLinear()
      .domain([0, d3.max(sortedMetrics, (d: DailyMetric) => d.revenue) || 0])
      .range([innerHeight, 0])
      .nice();

    const yScaleClicks = d3.scaleLinear()
      .domain([0, d3.max(sortedMetrics, (d: DailyMetric) => d.clicks) || 0])
      .range([innerHeight, 0])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(Math.ceil(sortedMetrics.length / 10)))
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxisRevenue = d3.axisLeft(yScaleRevenue)
      .ticks(5)
      .tickFormat((d: number) => `$${d}`);

    const yAxisClicks = d3.axisRight(yScaleClicks)
      .ticks(5);

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
      .call(yAxisRevenue);

    svg.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisClicks);

    // Add axis labels
    svg.append('text')
      .attr('x', -margin.left + 10)
      .attr('y', -10)
      .attr('fill', '#666')
      .attr('text-anchor', 'start')
      .style('font-size', '12px')
      .text('Revenue ($)');

    svg.append('text')
      .attr('x', innerWidth + margin.right - 10)
      .attr('y', -10)
      .attr('fill', '#666')
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .text('Clicks');

    // Create line generators
    const lineRevenue = d3.line()
      .x((d: DailyMetric) => xScale(new Date(d.date)))
      .y((d: DailyMetric) => yScaleRevenue(d.revenue))
      .curve(d3.curveMonotoneX);

    const lineClicks = d3.line()
      .x((d: DailyMetric) => xScale(new Date(d.date)))
      .y((d: DailyMetric) => yScaleClicks(d.clicks))
      .curve(d3.curveMonotoneX);

    // Add revenue line
    svg.append('path')
      .datum(sortedMetrics)
      .attr('fill', 'none')
      .attr('stroke', '#4ade80')
      .attr('stroke-width', 2)
      .attr('d', lineRevenue(sortedMetrics) as string);

    // Add clicks line
    svg.append('path')
      .datum(sortedMetrics)
      .attr('fill', 'none')
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 2)
      .attr('d', lineClicks(sortedMetrics) as string);

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

    // Add dots for each data point
    svg.selectAll('.revenue-dot')
      .data(sortedMetrics)
      .enter()
      .append('circle')
      .attr('class', 'revenue-dot')
      .attr('cx', (d: DailyMetric) => xScale(new Date(d.date)))
      .attr('cy', (d: DailyMetric) => yScaleRevenue(d.revenue))
      .attr('r', 4)
      .attr('fill', '#4ade80')
      .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: DailyMetric) {
        d3.select(this).attr('r', 6);
        tooltip
          .style('opacity', 1)
          .html(`
            <div><strong>${new Date(d.date).toLocaleDateString()}</strong></div>
            <div>Revenue: $${d.revenue.toFixed(2)}</div>
            <div>Clicks: ${d.clicks}</div>
            <div>Conversions: ${d.conversions}</div>
            <div>ROI: ${d.roi.toFixed(2)}%</div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function(this: SVGCircleElement) {
        d3.select(this).attr('r', 4);
        tooltip.style('opacity', 0);
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth - 100}, 0)`);

    // Revenue legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#4ade80');

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12.5)
      .attr('fill', '#666')
      .style('font-size', '12px')
      .text('Revenue');

    // Clicks legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 25)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#60a5fa');

    legend.append('text')
      .attr('x', 20)
      .attr('y', 37.5)
      .attr('fill', '#666')
      .style('font-size', '12px')
      .text('Clicks');

    // Clean up on unmount
    return () => {
      d3.select('body').selectAll('.chart-tooltip').remove();
    };
  }, [dailyMetrics]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance Over Time</h2>
      <div className="overflow-x-auto">
        <svg ref={chartRef} width="800" height="400" />
      </div>
    </div>
  );
};

export default AdRevenueChart;
