import React, { useEffect, useRef } from 'react';
import d3 from '../../utils/d3-imports';

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
  title = 'Heatmap Visualization',
  width = 600,
  height = 400,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  colorRange = ['#f7fbff', '#08306b']
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique x and y values for scales
    const xValues = Array.from(new Set(data.map((d: HeatmapDataPoint) => String(d.x))));
    const yValues = Array.from(new Set(data.map((d: HeatmapDataPoint) => String(d.y))));

    // Create scales
    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([0, innerHeight])
      .padding(0.05);

    // Create color scale
    const maxValue = d3.max(data, (d: HeatmapDataPoint) => d.value) || 0;
    const colorScale = d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]));

    // Draw heatmap cells
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: HeatmapDataPoint) => xScale(String(d.x)) || 0)
      .attr('y', (d: HeatmapDataPoint) => yScale(String(d.y)) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', (d: HeatmapDataPoint) => colorScale(d.value))
      .style('stroke', '#fff')
      .style('stroke-width', 0.5)
      .on('mouseover', function(this: SVGRectElement, event: MouseEvent, d: HeatmapDataPoint) {
        d3.select(this).style('stroke', '#000').style('stroke-width', '1');
        
        // Show tooltip
        tooltip
          .style('opacity', '1')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <div><strong>${d.x}, ${d.y}</strong></div>
            <div>Value: ${d.value.toFixed(2)}</div>
          `);
      })
      .on('mouseout', function(this: SVGRectElement) {
        d3.select(this).style('stroke', '#fff').style('stroke-width', '0.5');
        tooltip.style('opacity', '0');
      });

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid 1px #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', 1000);

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add title
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Add x-axis label
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text(xLabel);

    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .text(yLabel);

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + 20}, ${innerHeight - legendHeight})`);
    
    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
    
    // Add color stops
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorRange[0]);
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorRange[1]);
    
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)');
    
    // Add legend scale
    const legendScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, legendWidth]);
      
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5);
      
    // Add legend axis
    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .select('.domain')
      .remove();

    // Add legend title
    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Value');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.heatmap-tooltip').remove();
    };
  }, [data, width, height, title, xLabel, yLabel, colorRange]);

  return (
    <div className="heatmap-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default HeatmapVisualization;
