import React, { useEffect, useRef } from 'react';
import d3 from '../../utils/d3-imports';

interface FunnelStep {
  name: string;
  value: number;
  percentage?: number;
  conversionRate?: number;
}

interface FunnelVisualizationProps {
  data: FunnelStep[];
  title?: string;
  height?: number;
  width?: number;
  showLabels?: boolean;
}

interface ProcessedStep extends FunnelStep {
  x: number;
  y: number;
}

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({
  data,
  title = 'Funnel Visualization',
  height = 400,
  width = 600,
  showLabels = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Process data to ensure it has conversion rates and percentages
    const processedData = data.map((step, i) => {
      const prevValue = i > 0 ? data[i - 1].value : step.value;
      const percentage = i > 0 ? (step.value / prevValue) * 100 : 100;
      const conversionRate = (step.value / data[0].value) * 100;
      return {
        ...step,
        percentage,
        conversionRate,
      };
    });

    // Create scales
    const xScale = d3
      .scaleLinear()
      .range([0, innerWidth])
      .domain([0, d3.max(processedData, (d: any) => d.value) || 0]);

    const yScale = d3
      .scaleBand()
      .range([0, innerHeight])
      .domain(processedData.map((d: any) => d.name))
      .padding(0.3);

    // Create funnel shape points
    const funnelPoints = processedData.map((step, i) => {
      const y = yScale(step.name) || 0;
      const height = yScale.bandwidth();
      const width = xScale(step.value);
      return [
        { x: 0, y } as ProcessedStep,
        { x: width, y } as ProcessedStep,
        { x: width, y: y + height } as ProcessedStep,
        { x: 0, y: y + height } as ProcessedStep,
      ];
    });

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create line generator for funnel shapes
    const lineGenerator = d3
      .line()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    // Draw the trapezoids
    funnelPoints.forEach((points, i) => {
      svg.append('path')
        .datum(points)
        .attr('d', lineGenerator)
        .attr('fill', '#638C6B')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .on('mouseover', function(this: SVGPathElement, event: MouseEvent) {
          d3.select(this).attr('opacity', '0.8');

          // Show tooltip
          const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'funnel-tooltip')
            .style('opacity', '1')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', 'solid 1px #ddd')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .style('z-index', '1000');

          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(`
              <div><strong>${processedData[i].name}</strong></div>
              <div>Count: ${processedData[i].value.toLocaleString()}</div>
              ${i > 0 && processedData[i].percentage !== undefined ? `<div>Drop-off: ${(100 - processedData[i].percentage).toFixed(1)}%</div>` : ''}
              ${i > 0 && processedData[i].percentage !== undefined ? `<div>Conversion from previous: ${processedData[i].percentage.toFixed(1)}%</div>` : ''}
              ${i > 0 && processedData[i].conversionRate !== undefined ? `<div>Overall conversion: ${processedData[i].conversionRate.toFixed(1)}%</div>` : ''}
            `);
        })
        .on('mouseout', function(this: SVGPathElement) {
          d3.select(this).attr('opacity', '1');
          d3.select('.funnel-tooltip').remove();
        });
    });

    // Add value labels
    svg
      .selectAll('.value-label')
      .data(processedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d: any) => xScale(d.value) + 10)
      .attr('y', (d: any) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text((d: any) => {
        const conversionRate = d.conversionRate !== undefined ? d.conversionRate.toFixed(1) : '0.0';
        return `${d.value.toLocaleString()} (${conversionRate}%)`;
      });

    // Add step name labels if showLabels is true
    if (showLabels) {
      svg
        .selectAll('.step-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'step-label')
        .attr('x', -10)
        .attr('y', (d: any) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text((d: any) => d.name);
    }

    // Add title
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    // Add color legend
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + 20}, 0)`);

    // Create color scheme
    const colors = d3.schemeCategory10;

    processedData.forEach((step, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colors[i % colors.length]);

      legendRow.append('text')
        .attr('x', 25)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(step.name);
    });

    // Add conversion arrows and percentages
    processedData.forEach((step, i) => {
      if (i < processedData.length - 1) {
        const currentY = (yScale(step.name) || 0) + yScale.bandwidth() / 2;
        const nextY = (yScale(processedData[i + 1].name) || 0) + yScale.bandwidth() / 2;
        const currentX = xScale(step.value);
        const nextX = xScale(processedData[i + 1].value);
        
        // Draw arrow
        svg.append('path')
          .attr('d', `M${currentX},${currentY} L${nextX},${nextY}`)
          .attr('stroke', '#999')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4')
          .attr('marker-end', 'url(#arrow)');
        
        // Add conversion percentage
        const midX = (currentX + nextX) / 2;
        const midY = (currentY + nextY) / 2;
        const percentage = processedData[i + 1].percentage;
        
        if (percentage !== undefined) {
          svg.append('text')
            .attr('x', midX)
            .attr('y', midY - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('fill', '#666')
            .text(`${percentage.toFixed(1)}%`);
        }
      }
    });

    // Add arrow marker definition
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.funnel-tooltip').remove();
    };
  }, [data, width, height, title, showLabels]);

  return (
    <div className="funnel-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FunnelVisualization;
