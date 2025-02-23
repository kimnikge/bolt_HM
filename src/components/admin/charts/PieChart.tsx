import React from 'react';
import { motion } from 'framer-motion';

interface PieChartProps {
  data?: {
    label: string;
    value: number;
    color: string;
  }[];
}

export function PieChart({ data = [] }: PieChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const segment = {
      start: currentAngle,
      end: currentAngle + angle,
      color: item.color,
      label: item.label,
      value: item.value
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => {
            const start = polarToCartesian(50, 50, 50, segment.start);
            const end = polarToCartesian(50, 50, 50, segment.end);
            const largeArcFlag = segment.end - segment.start <= 180 ? 0 : 1;

            return (
              <motion.path
                key={index}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                d={`
                  M 50 50
                  L ${start.x} ${start.y}
                  A 50 50 0 ${largeArcFlag} 1 ${end.x} ${end.y}
                  Z
                `}
                fill={segment.color}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold">{total}</div>
        </div>
      </div>
      <div className="ml-4 space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <div className="text-sm">
              <span className="font-medium">{segment.label}</span>
              <span className="text-gray-500 ml-2">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
  const angleInRadians = (angle - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}