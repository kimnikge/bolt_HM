import React from 'react';
import { motion } from 'framer-motion';

interface BarChartProps {
  data?: {
    label: string;
    value: number;
  }[];
}

export function BarChart({ data = [] }: BarChartProps) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Нет данных для отображения
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-lg"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-full">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}