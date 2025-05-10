import React, { useMemo } from 'react';

/**
 * Simple price chart component for displaying Bitcoin prices
 */
const BitcoinPriceChart = ({ data = [] }) => {
  // Process data for chart rendering
  const chartData = useMemo(() => {
    if (data.length < 2) return [];
    
    // Find min and max values for scaling
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Add a small buffer for better visualization
    const buffer = (maxPrice - minPrice) * 0.1;
    const effectiveMin = Math.max(0, minPrice - buffer);
    const effectiveMax = maxPrice + buffer;
    const range = effectiveMax - effectiveMin;
    
    // Map price data to chart points
    return data.map((d, i) => {
      // Normalize price to 0-100% of chart height (inverted since SVG y-axis is top-down)
      const normalizedHeight = 100 - ((d.price - effectiveMin) / range * 100);
      
      return {
        x: (i / (data.length - 1)) * 100, // 0-100% of chart width
        y: normalizedHeight,
        price: d.price,
        time: d.time
      };
    });
  }, [data]);

  // Generate SVG path for the line
  const linePath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData.map((point, i) => 
      (i === 0 ? 'M' : 'L') + `${point.x} ${point.y}`
    ).join(' ');
  }, [chartData]);

  // Generate SVG path for the area under the line
  const areaPath = useMemo(() => {
    if (chartData.length < 2) return '';
    
    // Start with the line path
    const line = chartData.map((point, i) => 
      (i === 0 ? 'M' : 'L') + `${point.x} ${point.y}`
    ).join(' ');
    
    // Add the area fill by closing the path at the bottom
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    return `${line} L${last.x} 100 L${first.x} 100 Z`;
  }, [chartData]);

  // Determine if price is trending up
  const isUp = useMemo(() => {
    if (chartData.length < 2) return true;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return last >= first;
  }, [chartData]);

  // Only render chart if we have data
  if (data.length < 2) {
    return (
      <div className="h-full flex items-center justify-center text-blue-200">
        Collecting price data...
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Area fill under the line */}
        <path
          d={areaPath}
          fill={isUp ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)'}
          stroke="none"
        />
        
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={isUp ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Latest price dot */}
        {chartData.length > 0 && (
          <circle
            cx={chartData[chartData.length - 1].x}
            cy={chartData[chartData.length - 1].y}
            r="1.5"
            fill={isUp ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'}
          />
        )}
      </svg>
    </div>
  );
};

export default BitcoinPriceChart; 