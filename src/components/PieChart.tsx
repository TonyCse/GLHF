"use client";

import { useState } from "react";

interface PieChartData {
  label: string;
  value: number;
  color: string;
  userId?: number;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  size?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  onSliceClick?: (data: PieChartData) => void;
}

export default function PieChart({ 
  data, 
  title, 
  size = 160, 
  showLegend = true, 
  showPercentage = true,
  onSliceClick 
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="rounded-2xl p-4 bg-[#1c1d1f] border border-[#2a2c30]">
        <h3 className="text-2xl font-medium text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-40 text-gray-400">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // Convert to degrees
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    
    cumulativePercentage += percentage;
    
    // Calculate path for SVG arc
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArc = percentage > 50 ? 1 : 0;
    
    const pathData = percentage === 100 
      ? `M ${centerX}, ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
      : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    return {
      ...item,
      percentage,
      pathData,
      index
    };
  });

  return (
    <div className="rounded-2xl p-4 bg-[#1c1d1f] border border-[#2a2c30]">
      <h3 className="text-2xl font-medium text-white mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Chart SVG */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {slices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                className={`transition-all duration-200 cursor-pointer ${
                  hoveredIndex === index ? 'opacity-90 scale-105' : 'opacity-80'
                } ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-60' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSliceClick && onSliceClick(slice)}
                style={{
                  filter: hoveredIndex === index ? 'drop-shadow(0 0 8px rgba(143, 96, 208, 0.5))' : 'none',
                  transformOrigin: `${size/2}px ${size/2}px`
                }}
              />
            ))}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-2xl text-white-400">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2 min-w-0">
            {slices.map((slice, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer ${
                  hoveredIndex === index ? 'bg-[#232426] scale-105' : 'hover:bg-[#232426]/50'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSliceClick && onSliceClick(slice)}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-medium text-white truncate">
                    {slice.label}
                  </div>
                  <div className="text-xl text-gray-400">
                    {slice.value} {showPercentage && `(${slice.percentage.toFixed(1)}%)`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
