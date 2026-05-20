"use client";

import { useState } from "react";

interface BarChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  height?: number;
  showValues?: boolean;
  maxValue?: number;
}

// Build graphique en barres
export default function BarChart({
  data,
  title,
  height = 200,
  showValues = true,
  maxValue,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = maxValue || Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl p-4 bg-[#1c1d1f] border border-[#2a2c30]">
        <h3 className="text-2xl font-medium text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-40 text-white">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 bg-[#1c1d1f] border border-[#2a2c30]"
      style={{ minHeight: height }}
    >
      <h3 className="text-2xl font-medium text-white mb-4">{title}</h3>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxVal) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl text-white font-medium truncate">{item.label}</span>
                {showValues && <span className="text-2xl text-white ml-2">{item.value}</span>}
              </div>

              <div className="relative">
                <div className="w-full bg-[#232426] rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      hoveredIndex === index ? "shadow-lg" : ""
                    }`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                      filter:
                        hoveredIndex === index
                          ? "brightness(1.2) drop-shadow(0 0 6px rgba(143, 96, 208, 0.5))"
                          : "brightness(1)",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </div>

                {/* Overlay au survol */}
                {hoveredIndex === index && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#232426] border border-[#8F60D0] rounded px-2 py-1 text-xs text-white z-10">
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
