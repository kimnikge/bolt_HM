import React from 'react';
import { motion } from 'framer-motion';

interface LineChartProps {
  data?: {
    date: string;
    value: number;
  }[];
}

export function LineChart({ data = [] }: LineChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - minValue) / range) * 100
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="h-64 relative">
      <svg className="w-full h-full">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500 dark:text-blue-400"
        />
        {points.map((point, index) => (
          <motion.circle
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="4"
            className="fill-blue-500 dark:fill-blue-400"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-500">
        {data.map((d, i) => (
          <div key={i} className="truncate">
            {new Date(d.date).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
}